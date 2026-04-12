/**
 * Número de passos com resposta persistida (exclui interstitiais e auth).
 * Deve coincidir com `getPersistableQuestionStepIds().length` em `onboarding-config.ts`.
 * Definido aqui sem importar `components/onboarding` para o RSC do admin não puxar essa árvore de módulos
 * (evita falhas de chunk / `undefined` em fábricas webpack no browser).
 */
export const EXPECTED_ONBOARDING_ANSWERS = 28;

export type AdminOperationalState = "no_answers" | "incomplete" | "ready";

export function getOperationalState(answerCount: number): AdminOperationalState {
  if (answerCount === 0) return "no_answers";
  if (answerCount < EXPECTED_ONBOARDING_ANSWERS) return "incomplete";
  return "ready";
}

export function operationalStateLabel(s: AdminOperationalState): string {
  switch (s) {
    case "no_answers":
      return "Sem respostas";
    case "incomplete":
      return "Perfil incompleto";
    case "ready":
      return "Pronto para curadoria";
    default:
      return "—";
  }
}
