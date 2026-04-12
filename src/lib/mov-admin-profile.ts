/**
 * Perfil MOV para operação admin — derivado das respostas existentes (sem alterar perguntas).
 * Reutiliza `deriveCompatibilityAxes` e mapeia para eixos de produto + tags + recomendação.
 */

import { deriveCompatibilityAxes, type CompatibilityAxesPayload } from "@/lib/compatibility-axes";

export type MovAdminAxisKey =
  | "energiaSocial"
  | "profundidadeConexao"
  | "expressividade"
  | "aberturaNovo"
  | "valoresSensibilidades"
  | "ambienteIdeal";

export type MovAdminAxis = {
  key: MovAdminAxisKey;
  label: string;
  /** 0–100 */
  score: number | null;
  source: string;
};

export type MovAdminProfile = {
  axes: MovAdminAxis[];
  tags: string[];
  shortLabel: string;
  /** Texto único legado (mesa + evento combinados) */
  recommendation: string;
  /** Sugestão operacional de formato de mesa */
  mesaSuggestion: string;
  /** Sugestão de tipo de evento / experiência */
  eventSuggestion: string;
  compatibility: CompatibilityAxesPayload | null;
};

function scale01to100(v: number | null): number | null {
  if (v === null || Number.isNaN(v)) return null;
  return Math.round(Math.min(1, Math.max(0, v)) * 100);
}

function avg(a: (number | null)[]): number | null {
  const ok = a.filter((x): x is number => x !== null);
  if (ok.length === 0) return null;
  return ok.reduce((x, y) => x + y, 0) / ok.length;
}

/**
 * Constrói `Record<questionId, answerValue>` a partir das linhas normalizadas.
 */
export function answersRecordFromRows(
  rows: Array<{ questionId: string; answerValue: string }>,
): Record<string, string> {
  const o: Record<string, string> = {};
  for (const r of rows) {
    o[r.questionId] = r.answerValue;
  }
  return o;
}

export function buildMovAdminProfile(answers: Record<string, string>): MovAdminProfile {
  const compatibility = deriveCompatibilityAxes(answers);
  const c = compatibility;

  const energiaSocial = scale01to100(
    avg([c.sociabilityScore, c.activityLifestyleScore]),
  );
  const profundidadeConexao = scale01to100(
    avg([c.familyImportanceScore, c.spiritualityImportanceScore, c.stressScore !== null ? 1 - c.stressScore : null]),
  );
  const expressividade = scale01to100(avg([c.creativityScore, c.humorScore]));
  const aberturaNovo = scale01to100(
    avg([c.cityNaturePreferenceScore, c.politicsToleranceOrInterestScore]),
  );
  const valoresSensibilidades = scale01to100(
    avg([c.familyImportanceScore, c.spiritualityImportanceScore]),
  );
  const ambienteIdeal = scale01to100(
    avg([
      c.introversionScore !== null ? 1 - c.introversionScore : null,
      c.cityNaturePreferenceScore,
    ]),
  );

  const axes: MovAdminAxis[] = [
    { key: "energiaSocial", label: "Energia social", score: energiaSocial, source: "sociability + estilo ativo" },
    { key: "profundidadeConexao", label: "Profundidade de conexão", score: profundidadeConexao, source: "família, espiritualidade, stress" },
    { key: "expressividade", label: "Expressividade", score: expressividade, source: "criatividade + humor" },
    { key: "aberturaNovo", label: "Abertura ao novo", score: aberturaNovo, source: "cidade/natureza + política/humor" },
    { key: "valoresSensibilidades", label: "Valores / sensibilidades", score: valoresSensibilidades, source: "família + espiritualidade" },
    { key: "ambienteIdeal", label: "Ambiente ideal", score: ambienteIdeal, source: "extroversão + urbano" },
  ];

  const tags: string[] = [];
  if (answers.p_ideal_night === "vinho") tags.push("Conversas profundas");
  if (answers.p_ideal_night === "jogos") tags.push("Ambiente lúdico");
  if (answers.p_ideal_night === "criativo") tags.push("Exploração criativa");
  if (answers.p_ideal_night === "natureza") tags.push("Natureza");
  if (answers.p_opinions === "logica") tags.push("Lógica");
  if (answers.p_opinions === "emocoes") tags.push("Emoção");
  if (energiaSocial !== null && energiaSocial >= 65) tags.push("Alta sociabilidade");
  if (energiaSocial !== null && energiaSocial <= 35) tags.push("Ritmo calmo");
  if (c.introversionScore !== null && c.introversionScore >= 0.65) tags.push("Introversão marcada");
  if (c.introversionScore !== null && c.introversionScore <= 0.35) tags.push("Extroversão");

  let shortLabel = "Perfil em construção";
  const es = energiaSocial ?? 50;
  const pr = profundidadeConexao ?? 50;
  if (es >= 60 && pr >= 55) shortLabel = "Conector social com profundidade";
  else if (es >= 60) shortLabel = "Explorador social";
  else if (pr >= 60) shortLabel = "Conexão com cuidado";
  else if ((c.introversionScore ?? 0.5) >= 0.55) shortLabel = "Observador seletivo";
  else shortLabel = "Equilíbrio social";

  let mesaSuggestion = "Mesa MOV Clássico — curadoria padrão, 6–8 lugares.";
  let eventSuggestion = "Speed Dating Clássico ou evento de comunidade (quando houver turma).";

  if (energiaSocial !== null && energiaSocial >= 70 && (c.introversionScore ?? 1) <= 0.45) {
    mesaSuggestion = "Mesa mais animada — rodízio de conversas, MOV Clássico.";
    eventSuggestion = "Evento de comunidade com roda leve ou Speed Dating Clássico em salão movimentado.";
  } else if ((c.introversionScore ?? 0) >= 0.6 || (energiaSocial !== null && energiaSocial < 40)) {
    mesaSuggestion = "Mesa reduzida (4–5) ou formato Sensorial — facilitação explícita.";
    eventSuggestion = "MOV Sensorial / jantar às cegas sensorial; evitar aglomeração inicial.";
  } else if ((c.cityNaturePreferenceScore ?? 0) <= 0.35) {
    mesaSuggestion = "Preferência por ambiente mais tranquilo; mesa perto de área verde se possível.";
    eventSuggestion = "Rolê ao ar livre / trilha + café (comunidade) ou formato com natureza.";
  } else {
    mesaSuggestion = "MOV Clássico em espaço urbano confortável — bar/restaurante parceiro.";
    eventSuggestion = "Speed Dating Clássico em data alinhada ao perfil urbano.";
  }

  const recommendation = `${mesaSuggestion} ${eventSuggestion}`;

  return {
    axes,
    tags: [...new Set(tags)].slice(0, 12),
    shortLabel,
    recommendation,
    mesaSuggestion,
    eventSuggestion,
    compatibility: c,
  };
}
