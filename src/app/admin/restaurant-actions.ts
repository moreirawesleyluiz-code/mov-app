"use server";

import { revalidatePath } from "next/cache";
import { assertAdminRole } from "@/lib/admin-auth";
import { payloadToPrismaData, partnerRestaurantSavePayloadSchema } from "@/lib/partner-restaurant-save";
import { prisma } from "@/lib/prisma";

export async function savePartnerRestaurantStructured(raw: unknown) {
  await assertAdminRole();
  const parsed = partnerRestaurantSavePayloadSchema.safeParse(raw);
  if (!parsed.success) {
    const msg = parsed.error.issues.map((i) => `${i.path.join(".") || "root"}: ${i.message}`).join("; ");
    throw new Error(msg || "Dados inválidos.");
  }
  const data = parsed.data;
  const prismaData = payloadToPrismaData(data);
  if (data.id) {
    await prisma.partnerRestaurant.update({ where: { id: data.id }, data: prismaData });
    revalidatePath(`/admin/restaurantes/${data.id}`);
  } else {
    await prisma.partnerRestaurant.create({ data: prismaData });
  }
  revalidatePath("/admin/restaurantes");
  revalidatePath("/admin/mesas");
  revalidatePath("/admin/montagem");
}

export async function setPartnerRestaurantActive(id: string, active: boolean) {
  await assertAdminRole();
  await prisma.partnerRestaurant.update({
    where: { id },
    data: { active, statusLabel: active ? "ativo" : "inativo" },
  });
  revalidatePath("/admin/restaurantes");
  revalidatePath(`/admin/restaurantes/${id}`);
  revalidatePath("/admin/mesas");
  revalidatePath("/admin/montagem");
}

export async function deletePartnerRestaurant(id: string) {
  await assertAdminRole();
  await prisma.partnerRestaurant.delete({ where: { id } });
  revalidatePath("/admin/restaurantes");
  revalidatePath("/admin/mesas");
  revalidatePath("/admin/montagem");
}
