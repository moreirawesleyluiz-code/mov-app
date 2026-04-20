export type SeMovEventKind = "jantar" | "cafe" | "exodo";

const kindLabel: Record<SeMovEventKind, string> = {
  jantar: "Jantar",
  cafe: "Café",
  exodo: "Êxodo",
};

function normalizeToken(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export function deriveSeMovEventKind(input: { type?: string | null; title?: string | null; slug?: string | null }): SeMovEventKind {
  const type = normalizeToken(input.type ?? "");
  if (type.includes("cafe")) return "cafe";
  if (type.includes("exodo")) return "exodo";
  if (type.includes("jantar")) return "jantar";

  const title = normalizeToken(input.title ?? "");
  if (title.includes("cafe")) return "cafe";
  if (title.includes("exodo")) return "exodo";

  const slug = normalizeToken(input.slug ?? "");
  if (slug.includes("cafe")) return "cafe";
  if (slug.includes("exodo")) return "exodo";

  return "jantar";
}

export function seMovEventKindLabel(kind: SeMovEventKind): string {
  return kindLabel[kind];
}
