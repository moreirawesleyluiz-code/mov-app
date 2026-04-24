export type MatchingQuestionGroup =
  | "demographic"
  | "operational"
  | "relational_compatibility"
  | "social_compatibility"
  | "lifestyle"
  | "practical_filter"
  | "restriction"
  | "curation_signal"
  | "risk_signal"
  | "strong_affinity_signal";

export type MatchingRuleMode = "hard_rule" | "score" | "both" | "not_used";

export type MatchingQuestionMapItem = {
  questionId: string;
  label: string;
  dataType: "enum" | "scale_1_10" | "date" | "city_id";
  groups: MatchingQuestionGroup[];
  ruleMode: MatchingRuleMode;
  suggestedWeight: number;
  tableImpact: string;
  adminFilter: boolean;
};

/**
 * Inventário auditável do onboarding para matching/curadoria.
 * Mantido separado da UI para facilitar governança de regra e peso.
 */
export const MOV_MATCHING_QUESTION_MAP: MatchingQuestionMapItem[] = [
  {
    questionId: "location",
    label: "Cidade base",
    dataType: "city_id",
    groups: ["operational", "practical_filter"],
    ruleMode: "both",
    suggestedWeight: 0.8,
    tableImpact: "Viabilidade logística da mesa e contexto local.",
    adminFilter: true,
  },

  { questionId: "p_opinions", label: "Lógica x Emoção", dataType: "enum", groups: ["relational_compatibility", "curation_signal"], ruleMode: "score", suggestedWeight: 0.5, tableImpact: "Tom da conversa e visão de mundo.", adminFilter: true },
  { questionId: "p_cinema", label: "Cinema x Bilheteria", dataType: "enum", groups: ["lifestyle", "strong_affinity_signal"], ruleMode: "score", suggestedWeight: 0.3, tableImpact: "Afinidade leve para quebra-gelo.", adminFilter: false },
  { questionId: "p_smart_funny", label: "Inteligente x Engraçada", dataType: "enum", groups: ["social_compatibility", "curation_signal"], ruleMode: "score", suggestedWeight: 0.3, tableImpact: "Estilo de interação em grupo.", adminFilter: false },
  { questionId: "p_fashion", label: "Clássica x Moderna", dataType: "enum", groups: ["lifestyle"], ruleMode: "score", suggestedWeight: 0.2, tableImpact: "Sinal leve de estilo pessoal.", adminFilter: false },
  { questionId: "p_ideal_night", label: "Noite ideal", dataType: "enum", groups: ["lifestyle", "strong_affinity_signal"], ruleMode: "score", suggestedWeight: 0.7, tableImpact: "Afinidade de agenda e formato social.", adminFilter: true },
  { questionId: "p_music", label: "Preferência musical", dataType: "enum", groups: ["lifestyle"], ruleMode: "score", suggestedWeight: 0.2, tableImpact: "Afinidade leve de repertório.", adminFilter: false },
  { questionId: "p_introvert", label: "Introversão", dataType: "scale_1_10", groups: ["social_compatibility", "risk_signal"], ruleMode: "both", suggestedWeight: 0.9, tableImpact: "Ritmo social e necessidade de facilitação.", adminFilter: true },
  { questionId: "p_proactive", label: "Proatividade", dataType: "scale_1_10", groups: ["social_compatibility"], ruleMode: "score", suggestedWeight: 0.4, tableImpact: "Engajamento espontâneo na roda.", adminFilter: false },
  { questionId: "p_creative", label: "Criatividade", dataType: "scale_1_10", groups: ["social_compatibility", "curation_signal"], ruleMode: "score", suggestedWeight: 0.3, tableImpact: "Estímulo de conversa e humor.", adminFilter: false },
  { questionId: "p_stressed", label: "Nível de stress", dataType: "scale_1_10", groups: ["risk_signal", "relational_compatibility"], ruleMode: "both", suggestedWeight: 0.6, tableImpact: "Cuidado com composição muito acelerada.", adminFilter: true },
  { questionId: "p_great_job", label: "Percepção sobre trabalho", dataType: "scale_1_10", groups: ["demographic", "curation_signal"], ruleMode: "score", suggestedWeight: 0.2, tableImpact: "Sinal contextual de momento profissional.", adminFilter: false },
  { questionId: "p_family", label: "Importância da família", dataType: "scale_1_10", groups: ["relational_compatibility", "strong_affinity_signal"], ruleMode: "score", suggestedWeight: 0.7, tableImpact: "Valores de vínculo e cuidado.", adminFilter: true },
  { questionId: "p_spirituality", label: "Importância da espiritualidade", dataType: "scale_1_10", groups: ["relational_compatibility", "strong_affinity_signal"], ruleMode: "score", suggestedWeight: 0.6, tableImpact: "Profundidade de visão de mundo.", adminFilter: true },
  { questionId: "p_humor_importance", label: "Importância do humor", dataType: "scale_1_10", groups: ["social_compatibility", "curation_signal"], ruleMode: "score", suggestedWeight: 0.6, tableImpact: "Leveza e diversão da mesa.", adminFilter: true },
  { questionId: "p_lonely", label: "Frequência de solidão", dataType: "scale_1_10", groups: ["risk_signal", "relational_compatibility"], ruleMode: "score", suggestedWeight: 0.4, tableImpact: "Sensibilidade de acolhimento.", adminFilter: false },
  { questionId: "p_friends_out", label: "Gosto por sair com amigos", dataType: "scale_1_10", groups: ["social_compatibility", "lifestyle"], ruleMode: "score", suggestedWeight: 0.6, tableImpact: "Energia social esperada no encontro.", adminFilter: true },
  { questionId: "p_train", label: "Gosto por treinar", dataType: "scale_1_10", groups: ["lifestyle"], ruleMode: "score", suggestedWeight: 0.2, tableImpact: "Afinidade de rotina e estilo de vida.", adminFilter: false },
  { questionId: "p_academic", label: "Ambição acadêmica", dataType: "scale_1_10", groups: ["relational_compatibility"], ruleMode: "score", suggestedWeight: 0.3, tableImpact: "Direção de conversa e objetivos.", adminFilter: false },
  { questionId: "p_nature_city", label: "Natureza x Cidade", dataType: "scale_1_10", groups: ["lifestyle", "practical_filter"], ruleMode: "score", suggestedWeight: 0.4, tableImpact: "Preferência de ambiente para experiência.", adminFilter: true },
  { questionId: "p_dark_humor", label: "Humor ácido", dataType: "scale_1_10", groups: ["social_compatibility", "risk_signal"], ruleMode: "score", suggestedWeight: 0.4, tableImpact: "Sensibilidade de tom em grupo.", adminFilter: true },
  { questionId: "p_politics_news", label: "Discussão política/notícias", dataType: "scale_1_10", groups: ["relational_compatibility", "risk_signal"], ruleMode: "score", suggestedWeight: 0.4, tableImpact: "Potencial de debate intenso.", adminFilter: true },

  { questionId: "id_children", label: "Filhos", dataType: "enum", groups: ["demographic", "curation_signal"], ruleMode: "score", suggestedWeight: 0.4, tableImpact: "Momento de vida e repertório.", adminFilter: true },
  { questionId: "id_sector", label: "Setor profissional", dataType: "enum", groups: ["demographic", "lifestyle", "curation_signal"], ruleMode: "score", suggestedWeight: 0.5, tableImpact: "Afinidade e diversidade profissional saudável.", adminFilter: true },
  { questionId: "id_birthday", label: "Data de nascimento", dataType: "date", groups: ["demographic", "operational", "risk_signal"], ruleMode: "both", suggestedWeight: 0.8, tableImpact: "Faixa etária e equilíbrio geracional.", adminFilter: true },
  { questionId: "id_gender", label: "Gênero", dataType: "enum", groups: ["demographic", "curation_signal"], ruleMode: "score", suggestedWeight: 0.2, tableImpact: "Diversidade e conforto do grupo (sem uso como bloqueio rígido padrão).", adminFilter: true },
  { questionId: "id_relationship", label: "Status de relacionamento", dataType: "enum", groups: ["demographic", "relational_compatibility"], ruleMode: "score", suggestedWeight: 0.6, tableImpact: "Alinhamento de intenção e momento relacional.", adminFilter: true },
];

export function getMatchingQuestionMapById(questionId: string): MatchingQuestionMapItem | undefined {
  return MOV_MATCHING_QUESTION_MAP.find((q) => q.questionId === questionId);
}
