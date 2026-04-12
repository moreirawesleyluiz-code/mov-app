export type OnboardingPersistedState = {
  /**
   * v4 = jornada oficial (personalidade → 96% → identidade → 82% → auth).
   * Progresso v3 não é reutilizado (perguntas diferentes).
   */
  v: 4;
  /** Índice em ONBOARDING_STEPS */
  stepIndex: number;
  answers: Record<string, string>;
  city: { id: string; name: string } | null;
  updatedAt: string;
};
