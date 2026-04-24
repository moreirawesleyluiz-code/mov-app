/**
 * Jornada oficial MOV — qualificação (personalidade) → telas de resultado → identidade → auth.
 * Edite este ficheiro para ajustar textos e opções; tipos em `OnboardingStep`.
 */

export type OnboardingStepKind =
  | "location"
  | "single"
  | "scale"
  | "interstitial"
  | "birthday"
  | "auth";

/** Telas estáticas de “matching” (sem cálculo real ainda) */
export type OnboardingInterstitialVariant = "score_96" | "search_82";

export type OnboardingOption = {
  value: string;
  label: string;
  hint?: string;
};

export type OnboardingStep = {
  id: string;
  kind: OnboardingStepKind;
  section?: string;
  title?: string;
  subtitle?: string;
  options?: OnboardingOption[];
  scaleLeftLabel?: string;
  scaleRightLabel?: string;
  interstitialVariant?: OnboardingInterstitialVariant;
};

/**
 * Ordem fixa: localização → 21 personalidade → 96% → identidade (data e restantes) → 82% → auth.
 * Índice 0 = localização; último = entrada (cadastro/login).
 */
export const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: "location",
    kind: "location",
    /** Textos da UI estão em `OnboardingLocationShell` / modal — aqui só metadados do passo. */
  },

  /* —— Bloco 1: Personalidade (21) —— */
  {
    id: "p_opinions",
    kind: "single",
    section: "Personalidade",
    title: "Suas opiniões geralmente são guiadas por:",
    options: [
      { value: "logica", label: "Lógica e fatos" },
      { value: "emocoes", label: "Emoções e sentimentos" },
    ],
  },
  {
    id: "p_cinema",
    kind: "single",
    section: "Personalidade",
    title: "Você se considera mais um...",
    options: [
      { value: "cinema", label: "Entusiasta de cinema" },
      { value: "bilheteria", label: "Amante de sucessos de bilheteria" },
    ],
  },
  {
    id: "p_smart_funny",
    kind: "single",
    section: "Personalidade",
    title: "Você se considera mais um...",
    options: [
      { value: "inteligente", label: "Pessoa inteligente" },
      { value: "engracada", label: "Pessoa engraçada" },
    ],
  },
  {
    id: "p_fashion",
    kind: "single",
    section: "Personalidade",
    title: "Se sua vida fosse um estilo de moda, seria:",
    options: [
      { value: "classica", label: "Clássica e atemporal" },
      { value: "moderna", label: "Moderno e expressivo" },
    ],
  },
  {
    id: "p_ideal_night",
    kind: "single",
    section: "Personalidade",
    title: "O que melhor descreve uma noite ideal?",
    options: [
      { value: "vinho", label: "Tendo conversas profundas enquanto toma vinho" },
      { value: "jogos", label: "Rindo e jogando jogos" },
      { value: "criativo", label: "Explorando novos espaços criativos" },
      { value: "natureza", label: "Desfrutando da natureza" },
    ],
  },
  {
    id: "p_music",
    kind: "single",
    section: "Personalidade",
    title: "Você prefere ouvir rock ou rap?",
    options: [
      { value: "rap", label: "Rap" },
      { value: "rock", label: "Rock" },
      { value: "nenhum", label: "Nenhum" },
    ],
  },
  {
    id: "p_introvert",
    kind: "scale",
    section: "Personalidade",
    title: "Eu sou uma pessoa introvertida",
    scaleLeftLabel: "Discordo totalmente",
    scaleRightLabel: "Concordo totalmente",
  },
  {
    id: "p_proactive",
    kind: "scale",
    section: "Personalidade",
    title: "Eu sou uma pessoa proativa",
    scaleLeftLabel: "Discordo totalmente",
    scaleRightLabel: "Concordo totalmente",
  },
  {
    id: "p_creative",
    kind: "scale",
    section: "Personalidade",
    title: "Sou uma pessoa criativa",
    scaleLeftLabel: "Discordo totalmente",
    scaleRightLabel: "Concordo totalmente",
  },
  {
    id: "p_stressed",
    kind: "scale",
    section: "Personalidade",
    title: "Eu sou uma pessoa estressada",
    scaleLeftLabel: "Discordo totalmente",
    scaleRightLabel: "Concordo totalmente",
  },
  {
    id: "p_great_job",
    kind: "scale",
    section: "Personalidade",
    title: "Eu tenho um trabalho incrível",
    scaleLeftLabel: "Discordo totalmente",
    scaleRightLabel: "Concordo totalmente",
  },
  {
    id: "p_family",
    kind: "scale",
    section: "Personalidade",
    title: "Quão importante é a família para você?",
    scaleLeftLabel: "Não é importante",
    scaleRightLabel: "Muito importante",
  },
  {
    id: "p_spirituality",
    kind: "scale",
    section: "Personalidade",
    title: "Quão importante é a espiritualidade para você?",
    scaleLeftLabel: "Não é importante",
    scaleRightLabel: "Muito importante",
  },
  {
    id: "p_humor_importance",
    kind: "scale",
    section: "Personalidade",
    title: "Quão importante é o humor para você?",
    scaleLeftLabel: "Não é importante",
    scaleRightLabel: "Muito importante",
  },
  {
    id: "p_lonely",
    kind: "scale",
    section: "Personalidade",
    title: "Com que frequência você se sente sozinho?",
    scaleLeftLabel: "Nunca",
    scaleRightLabel: "Todos os dias",
  },
  {
    id: "p_friends_out",
    kind: "scale",
    section: "Personalidade",
    title: "Eu gosto de sair com amigos",
    scaleLeftLabel: "Nunca",
    scaleRightLabel: "Quase sempre",
  },
  {
    id: "p_train",
    kind: "scale",
    section: "Personalidade",
    title: "Eu gosto de treinar",
    scaleLeftLabel: "Raramente",
    scaleRightLabel: "Regularmente",
  },
  {
    id: "p_academic",
    kind: "scale",
    section: "Personalidade",
    title: "O sucesso acadêmico é importante para você?",
    scaleLeftLabel: "Eu não me importo",
    scaleRightLabel: "Muito importante",
  },
  {
    id: "p_nature_city",
    kind: "scale",
    section: "Personalidade",
    title: "Eu gosto mais de passar o tempo...",
    scaleLeftLabel: "Na natureza",
    scaleRightLabel: "Na cidade",
  },
  {
    id: "p_dark_humor",
    kind: "scale",
    section: "Personalidade",
    title: "Eu gosto de humor politicamente incorreto",
    scaleLeftLabel: "Discordo totalmente",
    scaleRightLabel: "Concordo totalmente",
  },
  {
    id: "p_politics_news",
    kind: "scale",
    section: "Personalidade",
    title: "Gosto de discutir política/notícias",
    scaleLeftLabel: "Discordo totalmente",
    scaleRightLabel: "Concordo totalmente",
  },

  {
    id: "interstitial_96",
    kind: "interstitial",
    section: "Compatibilidade",
    interstitialVariant: "score_96",
  },

  /* —— Bloco 2: Identidade —— */
  {
    id: "id_children",
    kind: "single",
    section: "Identidade",
    title: "Você tem filhos?",
    options: [
      { value: "sim", label: "Sim" },
      { value: "nao", label: "Não" },
      { value: "prefiro-nao-dizer", label: "Eu prefiro não dizer" },
    ],
  },
  {
    id: "id_sector",
    kind: "single",
    section: "Identidade",
    title: "Se você está trabalhando, em qual setor você trabalha?",
    options: [
      { value: "nao-trabalhando", label: "Não estou trabalhando" },
      { value: "saude", label: "Área da Saúde" },
      { value: "tecnologia", label: "Tecnologia" },
      { value: "manual", label: "Trabalho manual" },
      { value: "varejo", label: "Varejo" },
      { value: "comida", label: "Comida" },
      { value: "servicos", label: "Serviços" },
      { value: "artes", label: "Artes" },
      { value: "politica", label: "Política" },
    ],
  },
  {
    id: "id_birthday",
    kind: "birthday",
    section: "Identidade",
    title: "Quando é seu aniversário?",
  },
  {
    id: "id_gender",
    kind: "single",
    section: "Identidade",
    title: "Como você se define?",
    options: [
      { value: "homem", label: "Homem" },
      { value: "mulher", label: "Mulher" },
      { value: "nao-binario", label: "Não-binário" },
    ],
  },
  {
    id: "id_relationship",
    kind: "single",
    section: "Identidade",
    title: "Qual é o seu status de relacionamento?",
    options: [
      { value: "solteiro", label: "Solteiro" },
      { value: "casado", label: "Casado(a)" },
      { value: "complicado", label: "É complicado" },
      { value: "relacionamento", label: "Em um relacionamento" },
      { value: "prefiro-nao-dizer", label: "Eu prefiro não dizer" },
    ],
  },

  {
    id: "interstitial_82",
    kind: "interstitial",
    section: "Compatibilidade",
    interstitialVariant: "search_82",
  },

  {
    id: "auth_entry",
    kind: "auth",
    section: "Conta",
    title: "Último passo: sua conta",
    subtitle: "Crie o acesso para sincronizar suas respostas e entrar na experiência MOV.",
  },
];

/** IDs que podem ter resposta persistida (exclui interstitiais e auth). */
export function getPersistableQuestionStepIds(): string[] {
  return ONBOARDING_STEPS.filter((s) => s.kind !== "interstitial" && s.kind !== "auth").map((s) => s.id);
}

export const ONBOARDING_TOTAL_STEPS = ONBOARDING_STEPS.length;
