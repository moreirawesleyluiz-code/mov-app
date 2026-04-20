import nodemailer from "nodemailer";

const SUBJECT = "Redefinir senha — MOV";

function buildBodies(resetUrl: string): { text: string; html: string } {
  const text = `Para definir uma nova senha, abra este link (válido por 1 hora):\n\n${resetUrl}\n\nSe não pediu este e-mail, ignore.`;
  const html = `<p>Para definir uma nova senha, use o link abaixo (válido por 1 hora):</p><p><a href="${escapeHtmlAttr(resetUrl)}">${escapeHtml(resetUrl)}</a></p><p>Se não pediu este e-mail, ignore.</p>`;
  return { text, html };
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function escapeHtmlAttr(s: string): string {
  return escapeHtml(s).replace(/'/g, "&#39;");
}

/** Remetente: MAIL_FROM (preferido para Mailtrap) ou EMAIL_FROM / SMTP_FROM. */
function resolveFrom(): string | undefined {
  return (process.env.MAIL_FROM ?? process.env.EMAIL_FROM ?? process.env.SMTP_FROM)?.trim();
}

/** Resend (HTTPS) — RESEND_API_KEY + remetente. */
async function sendViaResend(to: string, from: string, resetUrl: string): Promise<void> {
  const key = process.env.RESEND_API_KEY?.trim();
  if (!key) throw new Error("RESEND_API_KEY em falta");

  const { text, html } = buildBodies(resetUrl);
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject: SUBJECT,
      text,
      html,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Resend HTTP ${res.status}: ${body || res.statusText}`);
  }
}

function sendMailWithTransport(
  to: string,
  from: string,
  resetUrl: string,
  transporter: nodemailer.Transporter,
): Promise<nodemailer.SentMessageInfo> {
  const { text, html } = buildBodies(resetUrl);
  return transporter.sendMail({
    from,
    to,
    subject: SUBJECT,
    text,
    html,
  });
}

/** Mailtrap sandbox / produção — MAILTRAP_HOST, MAILTRAP_USER, MAILTRAP_PASS (+ MAIL_FROM). */
async function sendViaMailtrap(to: string, from: string, resetUrl: string): Promise<void> {
  const host = process.env.MAILTRAP_HOST?.trim();
  const user = process.env.MAILTRAP_USER?.trim();
  const pass = process.env.MAILTRAP_PASS ?? "";
  if (!host || !user) {
    throw new Error("MAILTRAP_HOST e MAILTRAP_USER são obrigatórios para Mailtrap SMTP.");
  }

  const port = Number(process.env.MAILTRAP_PORT ?? "2525");
  const secure =
    process.env.MAILTRAP_SECURE === "true" || process.env.MAILTRAP_SECURE === "1" || port === 465;

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });
  await sendMailWithTransport(to, from, resetUrl, transporter);
}

/** SMTP genérico (Gmail, SendGrid, etc.) — SMTP_HOST + remetente. */
async function sendViaGenericSmtp(to: string, from: string, resetUrl: string): Promise<void> {
  const host = process.env.SMTP_HOST?.trim();
  if (!host) throw new Error("SMTP_HOST em falta");

  const port = Number(process.env.SMTP_PORT ?? "587");
  const secure =
    process.env.SMTP_SECURE === "true" || process.env.SMTP_SECURE === "1" || port === 465;
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASSWORD ?? "";

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    ...(user ? { auth: { user, pass } } : {}),
  });
  await sendMailWithTransport(to, from, resetUrl, transporter);
}

function logDevFallback(to: string, resetUrl: string): void {
  const line = "=".repeat(72);
  console.warn(`\n${line}`);
  console.warn("[MOV password reset] MODO DEV: nenhum provedor de e-mail configurado.");
  console.warn("[MOV password reset] Para Mailtrap: MAILTRAP_HOST, MAILTRAP_PORT, MAILTRAP_USER, MAILTRAP_PASS, MAIL_FROM");
  console.warn("[MOV password reset] Copie o link abaixo para testar o reset (válido 1h):");
  console.warn(`${line}`);
  console.warn(resetUrl);
  console.warn(`${line}`);
  console.warn(`Destinatário esperado: ${to}\n`);
}

/**
 * Ordem de envio:
 * 1. Resend (RESEND_API_KEY + remetente)
 * 2. Mailtrap (MAILTRAP_HOST + MAILTRAP_USER + MAIL_FROM ou EMAIL_FROM)
 * 3. SMTP genérico (SMTP_HOST + remetente)
 * 4. Log no terminal (sem erro para o cliente — mensagem genérica na UI)
 */
export async function sendPasswordResetEmail(to: string, resetUrl: string): Promise<void> {
  const from = resolveFrom();
  const resendKey = process.env.RESEND_API_KEY?.trim();

  if (resendKey && from) {
    await sendViaResend(to, from, resetUrl);
    console.info("[MOV password reset] e-mail enviado via Resend para", to);
    return;
  }

  const mailtrapHost = process.env.MAILTRAP_HOST?.trim();
  if (mailtrapHost && from) {
    await sendViaMailtrap(to, from, resetUrl);
    console.info("[MOV password reset] e-mail enviado via Mailtrap SMTP para", to);
    return;
  }

  const smtpHost = process.env.SMTP_HOST?.trim();
  if (smtpHost && from) {
    await sendViaGenericSmtp(to, from, resetUrl);
    console.info("[MOV password reset] e-mail enviado via SMTP para", to);
    return;
  }

  console.info(
    "[MOV password reset] Nenhum provedor configurado (Resend, Mailtrap ou SMTP genérico + MAIL_FROM/EMAIL_FROM).",
  );
  logDevFallback(to, resetUrl);
}
