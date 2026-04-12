import { DIETARY_OPTIONS, LANGUAGE_OPTIONS } from "@/lib/dinner-prefs";
import { SP_DINNER_REGIONS } from "@/lib/sp-regions";
import type { JantarDraft } from "@/lib/jantar-draft";

export function regionLabel(regionKey: string) {
  return SP_DINNER_REGIONS.find((r) => r.id === regionKey)?.label ?? regionKey;
}

export function formatLanguageSummary(ids: string[]) {
  const labels = LANGUAGE_OPTIONS.filter((o) => ids.includes(o.id)).map((o) => o.label);
  if (labels.length === 0) return "—";
  return new Intl.ListFormat("pt-BR", { style: "long", type: "conjunction" }).format(labels);
}

export function formatBudgetSummary(tiers: string[]) {
  if (tiers.length === 0) return "—";
  return [...tiers].sort().join(", ");
}

export function formatDietarySummary(draft: Pick<JantarDraft, "dietaryRestrictions" | "dietaryTypes">) {
  if (!draft.dietaryRestrictions) return "Sem restrições";
  const labels = DIETARY_OPTIONS.filter((o) => draft.dietaryTypes.includes(o.id)).map(
    (o) => o.label,
  );
  if (labels.length === 0) return "—";
  return new Intl.ListFormat("pt-BR", { style: "long", type: "conjunction" }).format(labels);
}
