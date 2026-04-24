/**
 * Tipos de evento MOV usados na base e na alocação (`experienceTypesJson`).
 * Manter alinhado com `Event.type` no Prisma.
 */
export const PARTNER_EXPERIENCE_TYPE_IDS = [
  "SE_MOV_JANTAR",
  "SE_MOV_CAFE",
  "SE_MOV_EXODO",
  "CLASSICO",
  "SENSORIAL",
  "EXCLUSIVO",
  "COMUNIDADE",
  "ROLÊ",
] as const;

export type PartnerExperienceTypeId = (typeof PARTNER_EXPERIENCE_TYPE_IDS)[number];

export const PARTNER_EXPERIENCE_TYPE_LABELS: Record<PartnerExperienceTypeId, string> = {
  SE_MOV_JANTAR: "Se Mov — Jantar",
  SE_MOV_CAFE: "Se Mov — Café",
  SE_MOV_EXODO: "Se Mov — Êxodo",
  CLASSICO: "MOV Clássico",
  SENSORIAL: "MOV Sensorial",
  EXCLUSIVO: "MOV Exclusivo",
  COMUNIDADE: "Comunidade",
  ROLÊ: "Rolê",
};

/** Tags sugeridas para curadoria (livre: também se pode acrescentar outras). */
export const CURATION_TAG_PRESETS = [
  "primeiro-encontro",
  "premium",
  "intimista",
  "animado",
  "negocios",
  "grupo-jovem",
  "familia",
  "romantico",
] as const;

/**
 * Chaves de disponibilidade alinhadas ao fluxo de inscrição (`availabilitySlotsJson`).
 * O parceiro pode restringir a quais chaves aceita operar.
 */
export const AVAILABILITY_KEY_PRESETS = [
  "seg-noite",
  "ter-noite",
  "qua-noite",
  "qui-noite",
  "quinta-noite",
  "sex-noite",
  "sab-almoco",
  "sab-noite",
  "dom-almoco",
  "dom-noite",
] as const;
