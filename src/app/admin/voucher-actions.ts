"use server";

import { revalidatePath } from "next/cache";
import { assertAdminRole } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { normalizeVoucherCode } from "@/lib/vouchers";

function parsePercent(raw: FormDataEntryValue | null): number {
  const n = Number(typeof raw === "string" ? raw.trim() : "");
  if (!Number.isFinite(n) || n <= 0 || n > 100) {
    throw new Error("Percentual deve ser maior que 0 e menor ou igual a 100.");
  }
  return Math.round(n);
}

function parseDateStart(raw: FormDataEntryValue | null): Date | null {
  const value = typeof raw === "string" ? raw.trim() : "";
  if (!value) return null;
  const d = new Date(`${value}T00:00:00-03:00`);
  if (Number.isNaN(d.getTime())) throw new Error("Data de início inválida.");
  return d;
}

function parseDateEnd(raw: FormDataEntryValue | null): Date | null {
  const value = typeof raw === "string" ? raw.trim() : "";
  if (!value) return null;
  const d = new Date(`${value}T23:59:59-03:00`);
  if (Number.isNaN(d.getTime())) throw new Error("Data de expiração inválida.");
  return d;
}

function parseUsageLimit(raw: FormDataEntryValue | null): number | null {
  const value = typeof raw === "string" ? raw.trim() : "";
  if (!value) return null;
  const n = Number(value);
  if (!Number.isInteger(n) || n < 1) throw new Error("Limite de usos deve ser inteiro maior que zero.");
  return n;
}

function parseCode(raw: FormDataEntryValue | null): string {
  const code = normalizeVoucherCode(typeof raw === "string" ? raw : "");
  if (!code) throw new Error("Código é obrigatório.");
  return code;
}

function revalidateVouchers() {
  revalidatePath("/admin/vouchers");
}

export async function createVoucher(formData: FormData) {
  await assertAdminRole();
  const code = parseCode(formData.get("code"));
  const discountPercent = parsePercent(formData.get("discountPercent"));
  const startsAt = parseDateStart(formData.get("startsAt"));
  const expiresAt = parseDateEnd(formData.get("expiresAt"));
  const usageLimit = parseUsageLimit(formData.get("usageLimit"));
  const isActive = formData.get("isActive") === "on";

  if (startsAt && expiresAt && startsAt > expiresAt) {
    throw new Error("Data de início deve ser anterior ou igual à expiração.");
  }

  await prisma.voucher.create({
    data: {
      code,
      discountPercent,
      isActive,
      startsAt,
      expiresAt,
      usageLimit,
    },
  });
  revalidateVouchers();
}

export async function updateVoucher(formData: FormData) {
  await assertAdminRole();
  const idRaw = formData.get("id");
  const id = typeof idRaw === "string" ? idRaw.trim() : "";
  if (!id) throw new Error("Voucher inválido.");

  const code = parseCode(formData.get("code"));
  const discountPercent = parsePercent(formData.get("discountPercent"));
  const startsAt = parseDateStart(formData.get("startsAt"));
  const expiresAt = parseDateEnd(formData.get("expiresAt"));
  const usageLimit = parseUsageLimit(formData.get("usageLimit"));
  const isActive = formData.get("isActive") === "on";

  if (startsAt && expiresAt && startsAt > expiresAt) {
    throw new Error("Data de início deve ser anterior ou igual à expiração.");
  }

  await prisma.voucher.update({
    where: { id },
    data: {
      code,
      discountPercent,
      isActive,
      startsAt,
      expiresAt,
      usageLimit,
    },
  });
  revalidateVouchers();
}

export async function setVoucherActive(id: string, isActive: boolean) {
  await assertAdminRole();
  await prisma.voucher.update({ where: { id }, data: { isActive } });
  revalidateVouchers();
}

