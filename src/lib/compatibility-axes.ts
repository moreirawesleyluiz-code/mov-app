/**
 * Deriva eixos de compatibilidade (0–1) a partir das respostas brutas do onboarding v4.
 * Valores null = pergunta fonte ausente no payload.
 */

export const COMPATIBILITY_AXES_SCHEMA_VERSION = 1 as const;

export type CompatibilityAxesPayload = {
  schemaVersion: typeof COMPATIBILITY_AXES_SCHEMA_VERSION;
  computedAt: string;
  introversionScore: number | null;
  /** 0 = lógica, 1 = emoção */
  logicEmotionScore: number | null;
  humorScore: number | null;
  creativityScore: number | null;
  stressScore: number | null;
  sociabilityScore: number | null;
  familyImportanceScore: number | null;
  spiritualityImportanceScore: number | null;
  /** Interesse / abertura a temas políticos e humor ácido (média de duas escalas). */
  politicsToleranceOrInterestScore: number | null;
  /** 0 = preferência por natureza, 1 = preferência urbana */
  cityNaturePreferenceScore: number | null;
  academicAmbitionScore: number | null;
  /** Estilo ativo: treino + saídas sociais (média). */
  activityLifestyleScore: number | null;
};

/** Normaliza escala 1–10 para [0, 1]. */
export function normalizeScale10(value: string | undefined): number | null {
  if (value === undefined || value === "") return null;
  const n = Number.parseInt(value, 10);
  if (Number.isNaN(n) || n < 1 || n > 10) return null;
  return (n - 1) / 9;
}

function average(nums: (number | null)[]): number | null {
  const ok = nums.filter((x): x is number => x !== null);
  if (ok.length === 0) return null;
  return ok.reduce((a, b) => a + b, 0) / ok.length;
}

/**
 * Deriva o perfil de eixos. Não altera ordem de perguntas nem UX — só leitura de `answers`.
 */
export function deriveCompatibilityAxes(answers: Record<string, string>): CompatibilityAxesPayload {
  const introversionScore = normalizeScale10(answers.p_introvert);

  let logicEmotionScore: number | null = null;
  if (answers.p_opinions === "logica") logicEmotionScore = 0;
  else if (answers.p_opinions === "emocoes") logicEmotionScore = 1;

  const humorScore = normalizeScale10(answers.p_humor_importance);
  const creativityScore = normalizeScale10(answers.p_creative);
  const stressScore = normalizeScale10(answers.p_stressed);

  const friends = normalizeScale10(answers.p_friends_out);
  const lonely = normalizeScale10(answers.p_lonely);
  const proactive = normalizeScale10(answers.p_proactive);
  const lonelyInverted = lonely === null ? null : 1 - lonely;
  const sociabilityScore = average([friends, lonelyInverted, proactive]);

  const familyImportanceScore = normalizeScale10(answers.p_family);
  const spiritualityImportanceScore = normalizeScale10(answers.p_spirituality);

  const politicsToleranceOrInterestScore = average([
    normalizeScale10(answers.p_politics_news),
    normalizeScale10(answers.p_dark_humor),
  ]);

  const cityNaturePreferenceScore = normalizeScale10(answers.p_nature_city);

  const academicAmbitionScore = normalizeScale10(answers.p_academic);

  const activityLifestyleScore = average([
    normalizeScale10(answers.p_train),
    normalizeScale10(answers.p_friends_out),
  ]);

  return {
    schemaVersion: COMPATIBILITY_AXES_SCHEMA_VERSION,
    computedAt: new Date().toISOString(),
    introversionScore,
    logicEmotionScore,
    humorScore,
    creativityScore,
    stressScore,
    sociabilityScore,
    familyImportanceScore,
    spiritualityImportanceScore,
    politicsToleranceOrInterestScore,
    cityNaturePreferenceScore,
    academicAmbitionScore,
    activityLifestyleScore,
  };
}

export function serializeCompatibilityAxes(payload: CompatibilityAxesPayload): string {
  return JSON.stringify(payload);
}

export function parseCompatibilityAxes(json: string | null): CompatibilityAxesPayload | null {
  if (!json) return null;
  try {
    const o = JSON.parse(json) as Partial<CompatibilityAxesPayload>;
    if (o.schemaVersion !== COMPATIBILITY_AXES_SCHEMA_VERSION) return null;
    return o as CompatibilityAxesPayload;
  } catch {
    return null;
  }
}
