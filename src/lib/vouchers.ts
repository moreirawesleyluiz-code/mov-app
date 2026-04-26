import "server-only";

import { prisma } from "@/lib/prisma";

export function normalizeVoucherCode(input: string): string {
  return input.trim().toUpperCase();
}

export function calculateDiscountedValueCents(valueCents: number, discountPercent: number): number {
  const discounted = Math.round((valueCents * (100 - discountPercent)) / 100);
  return Math.max(0, discounted);
}

export type VoucherValidation =
  | { ok: true; voucherId: string; code: string; discountPercent: number; finalValueCents: number }
  | { ok: false; error: string };

export async function validateVoucherForAmount(input: {
  code: string;
  baseValueCents: number;
  now?: Date;
}): Promise<VoucherValidation> {
  const code = normalizeVoucherCode(input.code);
  if (!code) return { ok: false, error: "Informe um código promocional." };

  const voucher = await prisma.voucher.findUnique({
    where: { code },
    select: {
      id: true,
      code: true,
      discountPercent: true,
      isActive: true,
      startsAt: true,
      expiresAt: true,
      usageLimit: true,
      usageCount: true,
    },
  });

  if (!voucher) return { ok: false, error: "Cupom inválido." };
  if (!voucher.isActive) return { ok: false, error: "Cupom inativo." };
  if (voucher.discountPercent <= 0 || voucher.discountPercent > 100) {
    return { ok: false, error: "Cupom inválido." };
  }

  const now = input.now ?? new Date();
  if (voucher.startsAt && now < voucher.startsAt) return { ok: false, error: "Cupom ainda não está disponível." };
  if (voucher.expiresAt && now > voucher.expiresAt) return { ok: false, error: "Cupom expirado." };
  if (voucher.usageLimit !== null && voucher.usageCount >= voucher.usageLimit) {
    return { ok: false, error: "Cupom sem saldo de uso." };
  }

  return {
    ok: true,
    voucherId: voucher.id,
    code: voucher.code,
    discountPercent: voucher.discountPercent,
    finalValueCents: calculateDiscountedValueCents(input.baseValueCents, voucher.discountPercent),
  };
}

