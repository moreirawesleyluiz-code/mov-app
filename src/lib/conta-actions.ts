"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import {
  mergeAppProfileExtra,
  parseAppProfileExtra,
  type AppProfileExtra,
} from "@/lib/app-profile-extra";
import { prisma } from "@/lib/prisma";

async function requireUserId(): Promise<string> {
  const session = await auth();
  const id = session?.user?.id;
  if (!id) throw new Error("Não autenticado");
  return id;
}

export async function updateContaProfileExtra(patch: Partial<AppProfileExtra>) {
  const userId = await requireUserId();
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { appProfileJson: true, name: true },
  });
  if (!user) throw new Error("Utilizador não encontrado");

  const current = parseAppProfileExtra(user.appProfileJson);
  const next = mergeAppProfileExtra(current, patch);
  delete (next as Record<string, unknown>).children;

  const first = (next.firstName ?? "").trim();
  const last = (next.lastName ?? "").trim();
  const fullName =
    first || last ? [first, last].filter(Boolean).join(" ").trim() : (user.name ?? undefined);

  await prisma.user.update({
    where: { id: userId },
    data: {
      appProfileJson: JSON.stringify(next),
      ...(fullName !== undefined ? { name: fullName } : {}),
    },
  });

  revalidatePath("/app/conta");
  revalidatePath("/app/conta/editar");
  return { ok: true as const };
}

export async function updateContaCity(city: string) {
  const userId = await requireUserId();
  await prisma.user.update({
    where: { id: userId },
    data: { city: city.trim() || null },
  });
  revalidatePath("/app/conta");
  revalidatePath("/app/conta/editar");
  return { ok: true as const };
}

export async function updateContaImageUrl(imageUrl: string | null) {
  const userId = await requireUserId();
  await prisma.user.update({
    where: { id: userId },
    data: { image: imageUrl?.trim() || null },
  });
  revalidatePath("/app/conta");
  revalidatePath("/app/conta/editar");
  return { ok: true as const };
}
