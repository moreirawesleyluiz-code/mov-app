/**
 * Curadoria operacional e sugestão de montagem de mesa — derivado apenas do Perfil MOV já calculado.
 * Texto administrativo / sugestivo; decisão final é humana.
 */

import type { MovAdminAxisKey, MovAdminProfile } from "@/lib/mov-admin-profile";

export type MovAdminTableAssembly = {
  /** Mesa pequena / média / grande */
  tableSizeLabel: string;
  tableSizeDetail: string;
  /** Calmo / equilibrado / expansivo */
  environmentStyle: string;
  environmentLine: string;
  /** Evento mais guiado vs livre */
  eventGuidance: string;
  eventLine: string;
  /** Frase útil para decisão rápida */
  operationalSummary: string;
  compatibilityHint: string;
  /** Quando aplicável: combinação a evitar ou mismatch típico */
  avoidAlert: string | null;
};

export type MovAdminCuratorshipBlock = {
  profileSummary: string;
  mainTags: string[];
  operationalRead: string;
  idealTable: string;
  idealEvent: string;
  compatibilityNotes: string;
  attentionPoints: string[];
  tableAssembly: MovAdminTableAssembly;
};

function axisScore(p: MovAdminProfile, key: MovAdminAxisKey): number | null {
  return p.axes.find((a) => a.key === key)?.score ?? null;
}

/**
 * Sugestão de montagem de mesa e ambiente a partir dos eixos e compatibilidade já derivados das respostas.
 */
export function buildMovAdminTableAssembly(profile: MovAdminProfile): MovAdminTableAssembly {
  const es = axisScore(profile, "energiaSocial");
  const pr = axisScore(profile, "profundidadeConexao");
  const expr = axisScore(profile, "expressividade");
  const intro = profile.compatibility?.introversionScore ?? null;

  let tableSizeLabel = "Média";
  let tableSizeDetail = "6–8 lugares; formato MOV Clássico habitual.";
  if (intro !== null && intro >= 0.58) {
    tableSizeLabel = "Pequena";
    tableSizeDetail = "4–5 lugares; roda mais contida e facilitação visível.";
  } else if (es !== null && es < 40) {
    tableSizeLabel = "Pequena";
    tableSizeDetail = "4–6 lugares; ritmo mais pausado e acolhimento explícito.";
  } else if (es !== null && es >= 72 && intro !== null && intro <= 0.42) {
    tableSizeLabel = "Grande";
    tableSizeDetail = "7–10 lugares; energia de grupo compatível com sociabilidade alta.";
  }

  let environmentStyle = "Equilibrado";
  let environmentLine =
    "Ambiente com conversa fluida, sem excesso de ruído nem silêncio forçado — bom para maioria dos perfis MOV.";
  if ((es !== null && es < 45) || (intro !== null && intro >= 0.55)) {
    environmentStyle = "Calmo";
    environmentLine =
      "Prefere ambiente mais contido, menos estímulo competitivo; boa profundidade de conversa quando há confiança.";
  } else if (es !== null && es >= 68 && (intro === null || intro <= 0.4)) {
    environmentStyle = "Expansivo";
    environmentLine =
      "Combina com grupo de energia média/alta, boa expressividade; espaço com movimento e rodízio leve funciona bem.";
  }

  let eventGuidance = "Equilibrado";
  let eventLine = "Tanto eventos com roteiro claro quanto dinâmicas mais abertas podem funcionar com facilitação moderada.";
  if ((intro !== null && intro >= 0.55) || (es !== null && es < 42)) {
    eventGuidance = "Mais guiado";
    eventLine =
      "Ideal para evento mais guiado, com aquecimento explícito e regras claras — não para dinâmica muito acelerada logo de início.";
  } else if (es !== null && es >= 65 && (intro === null || intro <= 0.45)) {
    eventGuidance = "Mais livre";
    eventLine = "Tolera (e costuma preferir) dinâmicas mais soltas, desde que o grupo não seja homogeneamente introspectivo.";
  }

  const operationalSummary = [
    `Perfil ${profile.shortLabel.toLowerCase()}: mesa ${tableSizeLabel.toLowerCase()} (${tableSizeDetail.split("—")[0]?.trim() ?? tableSizeDetail}).`,
    `Ambiente recomendado: ${environmentStyle.toLowerCase()} — ${environmentLine}`,
  ].join(" ");

  const compatibilityHint = [
    pr !== null && pr >= 58
      ? "Boa profundidade de conexão: combina bem com mesas onde há tempo para troca real, não só apresentação rápida."
      : null,
    expr !== null && expr >= 60
      ? "Expressividade relevante: favorece grupos onde humor e criatividade são bem-vindos."
      : null,
    es !== null && es >= 60 && (intro === null || intro <= 0.45)
      ? "Energia social alta: em mesas muito caladas pode sentir falta de ritmo — equilibrar com 1–2 perfis mais calmos, não só introspectivos profundos."
      : null,
  ]
    .filter(Boolean)
    .join(" ");

  let avoidAlert: string | null = null;
  if (intro !== null && intro >= 0.6 && es !== null && es >= 68) {
    avoidAlert =
      "Tensão entre introversão marcada e energia social alta nas respostas: na montagem, evitar empurrar para mesa só extrovertida/acelerada sem combinado com o facilitador.";
  } else if (es !== null && es < 38 && intro !== null && intro <= 0.38) {
    avoidAlert =
      "Perfil mais acelerado na interação: evitar mesa excessivamente introspectiva ou silenciosa sem quebra-gelo estruturado.";
  } else if ((es !== null && es < 40) && (intro !== null && intro >= 0.58)) {
    avoidAlert =
      "Combinação calma + introversão: evitar emparelhar só com perfis muito dominantes ou competitivos sem mediação.";
  }

  return {
    tableSizeLabel,
    tableSizeDetail,
    environmentStyle,
    environmentLine,
    eventGuidance,
    eventLine,
    operationalSummary,
    compatibilityHint: compatibilityHint || "Ajustar mesa conforme mix do grupo e briefing do facilitador.",
    avoidAlert,
  };
}

/**
 * Bloco único para o detalhe do utilizador — curadoria + montagem sugerida.
 */
export function buildMovAdminCuratorshipBlock(profile: MovAdminProfile): MovAdminCuratorshipBlock {
  const tableAssembly = buildMovAdminTableAssembly(profile);
  const mainTags = profile.tags.slice(0, 8);

  const operationalRead = [
    profile.shortLabel,
    mainTags.length ? `Tags: ${mainTags.join(", ")}.` : null,
    tableAssembly.operationalSummary,
  ]
    .filter(Boolean)
    .join(" ");

  const attentionPoints: string[] = [];
  if (tableAssembly.avoidAlert) attentionPoints.push(tableAssembly.avoidAlert);
  const es = axisScore(profile, "energiaSocial");
  const intro = profile.compatibility?.introversionScore;
  if (es !== null && es < 35) attentionPoints.push("Energia social baixa nas métricas: confirmar conforto com tamanho da mesa e ritmo do evento.");
  if (intro != null && intro >= 0.62) attentionPoints.push("Introversão alta: priorizar quebra-gelo e não superestimar rodízio rápido.");

  return {
    profileSummary: profile.shortLabel,
    mainTags,
    operationalRead,
    idealTable: `${tableAssembly.tableSizeLabel} — ${tableAssembly.tableSizeDetail} ${profile.mesaSuggestion}`,
    idealEvent: `${tableAssembly.eventLine} Sugestão: ${profile.eventSuggestion}`,
    compatibilityNotes: tableAssembly.compatibilityHint,
    attentionPoints,
    tableAssembly,
  };
}

/** Resumo uma linha para lista admin */
export function movAdminListSummaryLines(profile: MovAdminProfile, tableAssembly: MovAdminTableAssembly) {
  const tagsPreview = profile.tags.slice(0, 4).join(" · ") || "—";
  const mesaShort = profile.mesaSuggestion.length > 90 ? `${profile.mesaSuggestion.slice(0, 87)}…` : profile.mesaSuggestion;
  const eventShort =
    profile.eventSuggestion.length > 80 ? `${profile.eventSuggestion.slice(0, 77)}…` : profile.eventSuggestion;
  return {
    tagsPreview,
    mesaShort,
    eventShort,
    environment: tableAssembly.environmentStyle,
    tableSize: tableAssembly.tableSizeLabel,
  };
}
