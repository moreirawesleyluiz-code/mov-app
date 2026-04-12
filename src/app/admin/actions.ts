"use server";

import { revalidatePath } from "next/cache";
import { assertAdminRole } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

/** Soft delete: inativa participante e remove-o das mesas de curadoria. Não inativa admins. */
export async function softDeleteParticipant(userId: string) {
  await assertAdminRole();
  const u = await prisma.user.findFirst({
    where: { id: userId },
    select: { id: true, role: true },
  });
  if (!u) throw new Error("Utilizador não encontrado.");
  if (u.role === "admin") throw new Error("Não é permitido inativar contas de administrador.");
  await prisma.$transaction([
    prisma.adminCuratedTableMember.deleteMany({ where: { userId } }),
    prisma.user.update({
      where: { id: userId },
      data: { deletedAt: new Date() },
    }),
  ]);
  revalidatePath("/admin");
  revalidatePath("/admin/mesas");
  revalidatePath(`/admin/users/${userId}`);
}

export async function updateAdminUserNotes(userId: string, adminNotes: string) {
  await assertAdminRole();
  await prisma.user.update({
    where: { id: userId },
    data: { adminNotes: adminNotes.trim() || null },
  });
  revalidatePath("/admin");
  revalidatePath(`/admin/users/${userId}`);
}
