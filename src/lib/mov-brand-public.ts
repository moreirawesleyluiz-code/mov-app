/**
 * Identidade pública da MOV (domínio e e-mails institucionais).
 * Em produção, defina as variáveis `NEXT_PUBLIC_MOV_EMAIL_*` no painel de deploy se forem diferentes.
 * Valores padrão: domínio oficial se-mov.com.
 */
const DEFAULT_DOMAIN = "se-mov.com";

export function getMovPublicDomain(): string {
  return process.env.NEXT_PUBLIC_MOV_PUBLIC_DOMAIN?.trim() || DEFAULT_DOMAIN;
}

export function getPublicContactEmail(): string {
  return process.env.NEXT_PUBLIC_MOV_EMAIL_CONTACT?.trim() || `contato@${getMovPublicDomain()}`;
}

export function getPublicSupportEmail(): string {
  return process.env.NEXT_PUBLIC_MOV_EMAIL_SUPPORT?.trim() || `suporte@${getMovPublicDomain()}`;
}

export function getPublicNoreplyEmail(): string {
  return process.env.NEXT_PUBLIC_MOV_EMAIL_NOREPLY?.trim() || `noreply@${getMovPublicDomain()}`;
}
