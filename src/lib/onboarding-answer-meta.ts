import {
  ONBOARDING_STEPS,
  type OnboardingStep,
} from "@/components/onboarding/onboarding-config";

export function getStepByQuestionId(questionId: string): OnboardingStep | undefined {
  return ONBOARDING_STEPS.find((s) => s.id === questionId);
}

export function getSectionForQuestionId(questionId: string): string | null {
  return getStepByQuestionId(questionId)?.section ?? null;
}

/**
 * Label legível para exibição / matching futuro.
 * `cityName` é usado quando questionId === "location" e o valor é um id de cidade.
 */
export function resolveAnswerLabel(
  questionId: string,
  value: string,
  ctx?: { cityName?: string | null },
): string {
  if (questionId === "location") {
    const name = ctx?.cityName?.trim();
    if (name) return name;
    return value;
  }
  const step = getStepByQuestionId(questionId);
  if (!step) return value;
  if (step.kind === "birthday") {
    try {
      const d = new Date(`${value}T12:00:00`);
      if (!Number.isNaN(d.getTime())) return d.toLocaleDateString("pt-BR");
    } catch {
      /* ignore */
    }
    return value;
  }
  if (step.kind === "scale") return value;
  if (step.kind === "single" && step.options) {
    const o = step.options.find((x) => x.value === value);
    return o?.label ?? value;
  }
  return value;
}
