export type OnboardingPersistedState = {
  /**
   * v4 = jornada oficial legada; migrado ao carregar para v5 (remoção do passo país).
   * v5 = jornada atual (sem `id_country`).
   */
  v: 4 | 5;
  /** Índice em ONBOARDING_STEPS */
  stepIndex: number;
  answers: Record<string, string>;
  city: { id: string; name: string } | null;
  updatedAt: string;
};
