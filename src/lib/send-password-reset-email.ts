import nodemailer from "nodemailer";

/**
 * Envio de e-mail de recuperação.
 * Com `SMTP_HOST` e `EMAIL_FROM` definidos, envia via SMTP (nodemailer).
 * Sem isso, apenas regista o link no log do servidor (útil em desenvolvimento).
 */
export async function sendPasswordResetEmail(to: string, resetUrl: string): Promise<void> {
  const host = process.env.SMTP_HOST?.trim();
  const from = (process.env.EMAIL_FROM ?? process.env.SMTP_FROM)?.trim();

  if (!host || !from) {
    console.info("[MOV password reset] SMTP não configurado (SMTP_HOST / EMAIL_FROM); link apenas no log.");
    console.info("[MOV password reset — destinatário]", to);
    console.info("[MOV password reset — link]", resetUrl);
    return;
  }

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

  await transporter.sendMail({
    from,
    to,
    subject: "Redefinir senha — MOV",
    text: `Para definir uma nova senha, abra este link (válido por 1 hora):\n\n${resetUrl}\n\nSe não pediu este e-mail, ignore.`,
    html: `<p>Para definir uma nova senha, use o link abaixo (válido por 1 hora):</p><p><a href="${escapeHtmlAttr(resetUrl)}">${escapeHtml(resetUrl)}</a></p><p>Se não pediu este e-mail, ignore.</p>`,
  });
  console.info("[MOV password reset] e-mail enviado para", to);
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
