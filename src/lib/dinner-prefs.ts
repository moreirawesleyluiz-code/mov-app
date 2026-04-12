export const LANGUAGE_OPTIONS = [
  { id: "en" as const, label: "Inglês" },
  { id: "pt" as const, label: "Português" },
];

export const BUDGET_OPTIONS = [
  { id: "$" as const, label: "$" },
  { id: "$$" as const, label: "$$" },
  { id: "$$$" as const, label: "$$$" },
];

/** Opções quando “Tenho restrições alimentares” está ativo */
export const DIETARY_OPTIONS = [
  { id: "vegetariano" as const, label: "Vegetariano" },
  { id: "vegano" as const, label: "Vegano" },
  { id: "sem_gluten" as const, label: "Sem glúten" },
  { id: "halal" as const, label: "Halal" },
  { id: "kosher" as const, label: "Kosher" },
];

export type LangId = (typeof LANGUAGE_OPTIONS)[number]["id"];
export type BudgetId = (typeof BUDGET_OPTIONS)[number]["id"];
export type DietaryId = (typeof DIETARY_OPTIONS)[number]["id"];

export function parseJsonArray(raw: string | null | undefined): string[] {
  if (!raw) return [];
  try {
    const v = JSON.parse(raw) as unknown;
    return Array.isArray(v) ? v.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}
