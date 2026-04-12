export type JantarDraft = {
  regionKey: string;
  languages: string[];
  budgetTiers: string[];
  dietaryRestrictions: boolean;
  dietaryTypes: string[];
};

export function draftStorageKey(eventId: string) {
  return `mov-jantar-draft:${eventId}`;
}

export function saveJantarDraft(eventId: string, draft: JantarDraft) {
  if (typeof sessionStorage === "undefined") return;
  sessionStorage.setItem(draftStorageKey(eventId), JSON.stringify(draft));
}

export function loadJantarDraft(eventId: string): JantarDraft | null {
  if (typeof sessionStorage === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(draftStorageKey(eventId));
    if (!raw) return null;
    const v = JSON.parse(raw) as JantarDraft;
    if (
      typeof v.regionKey === "string" &&
      Array.isArray(v.languages) &&
      Array.isArray(v.budgetTiers) &&
      typeof v.dietaryRestrictions === "boolean" &&
      Array.isArray(v.dietaryTypes)
    ) {
      return v;
    }
    return null;
  } catch {
    return null;
  }
}

export function clearJantarDraft(eventId: string) {
  if (typeof sessionStorage === "undefined") return;
  sessionStorage.removeItem(draftStorageKey(eventId));
}
