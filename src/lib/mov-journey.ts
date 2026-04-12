import type { UserOnboardingProfileData } from "@/lib/load-user-onboarding-profile";

export type MovJourneyStepUi = {
  id: string;
  title: string;
  body: string;
  /** done = concluído; active = etapa atual honesta; pending = ainda não; soon = placeholder explícito */
  state: "done" | "active" | "pending" | "soon";
};

export type MovJourneySummary = {
  headline: string;
  subline: string;
  /** Onde o utilizador está no fluxo até à mesa (sem simular matching). */
  phaseLabel: string;
  steps: MovJourneyStepUi[];
  primaryCta: { href: string; label: string };
  secondaryCta?: { href: string; label: string };
};

/**
 * Estados honestos até existir motor de matching e convites reais.
 * Não inventa mesas nem pessoas — “em breve” / “em processamento” onde aplicável.
 */
export function buildMovJourney(data: UserOnboardingProfileData): MovJourneySummary {
  const hasAnswers = data.answerCount > 0;
  const hasAxes = data.axes !== null;

  let headline = "Bem-vindo à MOV";
  let subline =
    "Aqui acompanha o seu percurso desde o questionário até ao convite para uma mesa compatível.";
  let phaseLabel = "Conta ativa";

  if (!hasAnswers) {
    headline = "Perfil ainda não sincronizado";
    subline =
      "Não encontrámos respostas do onboarding nesta conta. Conclua o questionário na página inicial e inicie sessão de novo para enviar os dados.";
    phaseLabel = "Aguardando respostas";
  } else if (!hasAxes) {
    headline = "Respostas recebidas";
    subline =
      "Os seus dados chegaram ao servidor. O processamento dos eixos de compatibilidade pode demorar alguns instantes após a sincronização.";
    phaseLabel = "Processamento do perfil";
  } else {
    headline = "Perfil processado";
    subline =
      "O seu perfil derivado está guardado. A curadoria de compatibilidade e a montagem de mesas serão ligadas ao motor de matching — ainda em evolução no produto.";
    phaseLabel = "Curadoria e mesa";
  }

  const steps: MovJourneyStepUi[] = [
    {
      id: "received",
      title: "Perfil recebido",
      body: "Respostas do onboarding guardadas no servidor, associadas à sua conta.",
      state: hasAnswers ? "done" : "pending",
    },
    {
      id: "processed",
      title: "Perfil processado",
      body: "Eixos numéricos calculados a partir das respostas (introversão, humor, etc.).",
      state: !hasAnswers ? "pending" : hasAxes ? "done" : "active",
    },
    {
      id: "compatibility",
      title: "Compatibilidade em curadoria",
      body:
        "A MOV cruza perfis para equilibrar mesas. O algoritmo final de agrupamento ainda não está ativo — não há recomendações automáticas nesta fase.",
      state: hasAxes ? "active" : "pending",
    },
    {
      id: "table_build",
      title: "Mesa em montagem",
      body: "Quando o matching estiver ligado, encaixaremos o seu perfil com outros convidados e com o estilo do restaurante.",
      state: "soon",
    },
    {
      id: "table_ready",
      title: "Mesa pronta / convite",
      body: "Convite, data e local serão apresentados aqui e na agenda — em breve.",
      state: "soon",
    },
  ];

  const primaryCta = hasAnswers
    ? { href: "/app/compatibilidade", label: "Ver jornada até à mesa" }
    : { href: "/", label: "Ir ao onboarding" };

  const secondaryCta = hasAnswers
    ? { href: "/app/agenda", label: "Explorar agenda (Se Mov)" }
    : undefined;

  return {
    headline,
    subline,
    phaseLabel,
    steps,
    primaryCta,
    secondaryCta,
  };
}
