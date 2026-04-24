"use server";

import bcrypt from "bcryptjs";
import { z } from "zod";
import { generateResetToken, hashResetToken } from "@/lib/password-reset-crypto";
import { prisma } from "@/lib/prisma";
import { getPublicAppOrigin } from "@/lib/public-app-url";
import { sendPasswordResetEmail } from "@/lib/send-password-reset-email";

const GENERIC_SUCCESS =
  "Se existir uma conta com este e-mail, enviaremos instruções para redefinir a senha.";

function appBaseUrl(): string {
  return getPublicAppOrigin();
}

const requestSchema = z.object({
  email: z.string().email(),
});

const resetSchema = z.object({
  token: z.string().min(16),
  password: z.string().min(8).max(128),
});

/** Pedido de reset — mensagem sempre genérica. */
export async function requestPasswordReset(
  input: unknown,
): Promise<{ ok: boolean; message: string }> {
  const parsed = requestSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: "Indique um e-mail válido." };
  }
  const email = parsed.data.email.toLowerCase().trim();

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, role: true, deletedAt: true },
  });

  await new Promise((r) => setTimeout(r, 250));

  if (!user || user.deletedAt || user.role === "admin") {
    if (!user) {
      console.info("[MOV password reset] nenhum utilizador — resposta genérica (timing normalizado)");
    } else if (user.deletedAt) {
      console.info("[MOV password reset] utilizador inativo — resposta genérica");
    } else {
      console.info("[MOV password reset] conta admin — recuperação por e-mail desativada");
    }
    return { ok: true, message: GENERIC_SUCCESS };
  }

  console.info("[MOV password reset] utilizador encontrado", { userId: user.id });

  await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });

  const { raw, tokenHash } = generateResetToken();
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      tokenHash,
      expiresAt,
    },
  });

  console.info("[MOV password reset] token guardado na BD", {
    userId: user.id,
    expiresAt: expiresAt.toISOString(),
  });

  const url = `${appBaseUrl()}/reset-password?token=${encodeURIComponent(raw)}`;
  try {
    await sendPasswordResetEmail(email, url);
  } catch (err) {
    console.error("[MOV password reset] falha no envio (Resend/SMTP):", err);
    return {
      ok: false,
      message: "Não foi possível enviar o e-mail. Tente novamente mais tarde.",
    };
  }

  console.info("[MOV password reset] fluxo de envio concluído para userId=", user.id);
  return { ok: true, message: GENERIC_SUCCESS };
}

/** Redefinir senha com token único e expiração. */
export async function resetPasswordWithToken(
  input: unknown,
): Promise<{ ok: boolean; message: string }> {
  const parsed = resetSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: "Dados inválidos. A senha deve ter pelo menos 8 caracteres." };
  }
  const { token: rawToken, password } = parsed.data;
  const tokenHash = hashResetToken(rawToken);

  const row = await prisma.passwordResetToken.findUnique({
    where: { tokenHash },
    include: { user: { select: { id: true, deletedAt: true, role: true } } },
  });

  if (!row || row.usedAt || row.user.deletedAt) {
    console.info("[MOV password reset] reset falhou: token inválido, usado ou utilizador inativo");
    return { ok: false, message: "Este link é inválido ou já foi utilizado." };
  }
  if (row.expiresAt.getTime() < Date.now()) {
    console.info("[MOV password reset] reset falhou: token expirado", { userId: row.userId });
    return { ok: false, message: "Este link expirou. Peça um novo e-mail de recuperação." };
  }
  if (row.user.role === "admin") {
    console.info("[MOV password reset] reset falhou: conta admin");
    return { ok: false, message: "Este link não é válido." };
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: row.userId },
      data: { passwordHash },
    }),
    prisma.passwordResetToken.update({
      where: { id: row.id },
      data: { usedAt: new Date() },
    }),
  ]);

  console.info("[MOV password reset] senha atualizada e token invalidado", { userId: row.userId });
  return { ok: true, message: "Senha atualizada. Já pode entrar com a nova senha." };
}
