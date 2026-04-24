"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import {
  mergeAppProfileExtra,
  parseAppProfileExtra,
  type AppProfileExtra,
} from "@/lib/app-profile-extra";
import { prisma } from "@/lib/prisma";

function normalizeBirthDateInput(input: string): string | null {
  const value = input.trim();
  if (!value) return null;

  const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (iso) {
    const year = Number(iso[1]);
    const month = Number(iso[2]);
    const day = Number(iso[3]);
    const utc = new Date(Date.UTC(year, month - 1, day));
    if (
      utc.getUTCFullYear() === year &&
      utc.getUTCMonth() === month - 1 &&
      utc.getUTCDate() === day
    ) {
      return value;
    }
    return null;
  }

  const br = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value);
  if (!br) return null;
  const day = Number(br[1]);
  const month = Number(br[2]);
  const year = Number(br[3]);
  const utc = new Date(Date.UTC(year, month - 1, day));
  if (
    utc.getUTCFullYear() !== year ||
    utc.getUTCMonth() !== month - 1 ||
    utc.getUTCDate() !== day
  ) {
    return null;
  }
  return `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

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

  const normalizedPatch: Partial<AppProfileExtra> = { ...patch };
  if (patch.birthDate !== undefined) {
    const normalizedBirthDate = normalizeBirthDateInput(patch.birthDate);
    if (patch.birthDate.trim() && !normalizedBirthDate) {
      throw new Error("Data de nascimento inválida");
    }
    normalizedPatch.birthDate = normalizedBirthDate ?? undefined;
  }

  const current = parseAppProfileExtra(user.appProfileJson);
  const next = mergeAppProfileExtra(current, normalizedPatch);
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
