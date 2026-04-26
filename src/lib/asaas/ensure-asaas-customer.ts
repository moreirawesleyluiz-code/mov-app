import "server-only";

import { createAsaasCustomer, findFirstCustomerIdByEmail } from "@/lib/asaas/asaas-api";

function onlyDigits(s: string): string {
  return s.replace(/\D/g, "");
}

function readDefaultCpfCnpj(): string | null {
  const raw = process.env.ASAAS_DEFAULT_CUSTOMER_CPF_CNPJ?.trim();
  if (!raw) return null;
  const digits = onlyDigits(raw);
  return digits.length === 11 || digits.length === 14 ? digits : null;
}

export async function ensureAsaasCustomerId(input: {
  userId: string;
  email: string;
  name?: string | null;
}): Promise<string> {
  const existingId = await findFirstCustomerIdByEmail(input.email);
  if (existingId) return existingId;

  const cpfCnpj = readDefaultCpfCnpj();
  if (!cpfCnpj) {
    throw new Error("ASAAS_DEFAULT_CUSTOMER_CPF_CNPJ ausente/inválido no servidor.");
  }

  const created = await createAsaasCustomer({
    name: (input.name || input.email.split("@")[0] || "Participante").slice(0, 120),
    email: input.email,
    cpfCnpj,
    externalReference: `mov_user_${input.userId}`,
  });
  return created.id;
}

