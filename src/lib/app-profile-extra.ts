/** Campos persistidos em `User.appProfileJson` (JSON). */
export type AppProfileExtra = {
  firstName?: string;
  lastName?: string;
  phone?: string;
  gender?: string;
  relationshipStatus?: string;
  industry?: string;
  birthCountry?: string;
  /** ISO date string YYYY-MM-DD */
  birthDate?: string;
};

export function parseAppProfileExtra(raw: string | null | undefined): AppProfileExtra {
  if (!raw) return {};
  try {
    const o = JSON.parse(raw) as Record<string, unknown>;
    return {
      firstName: typeof o.firstName === "string" ? o.firstName : undefined,
      lastName: typeof o.lastName === "string" ? o.lastName : undefined,
      phone: typeof o.phone === "string" ? o.phone : undefined,
      gender: typeof o.gender === "string" ? o.gender : undefined,
      relationshipStatus: typeof o.relationshipStatus === "string" ? o.relationshipStatus : undefined,
      industry: typeof o.industry === "string" ? o.industry : undefined,
      birthCountry: typeof o.birthCountry === "string" ? o.birthCountry : undefined,
      birthDate: typeof o.birthDate === "string" ? o.birthDate : undefined,
    };
  } catch {
    return {};
  }
}

export function mergeAppProfileExtra(
  current: AppProfileExtra,
  patch: Partial<AppProfileExtra>,
): AppProfileExtra {
  return { ...current, ...patch };
}

/** Deriva primeiro/último nome a partir de `User.name` quando não há JSON. */
export function splitDisplayName(full: string | null | undefined): { first: string; last: string } {
  const s = (full ?? "").trim();
  if (!s) return { first: "", last: "" };
  const parts = s.split(/\s+/);
  if (parts.length === 1) return { first: parts[0]!, last: "" };
  return { first: parts[0]!, last: parts.slice(1).join(" ") };
}
