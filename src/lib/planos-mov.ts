export type PlanoMov = {
  id: string;
  label: string;
  months: number;
  totalCents: number;
  originalCents: number | null;
  savePercent: number | null;
  /** Preço por semana (aprox.) */
  weeklyCents: number;
};

/** Valores alinhados ao Se Mov (R$ 39,90/mês referência) — demo sem gateway. */
export const PLANOS_MOV: PlanoMov[] = [
  {
    id: "1m",
    label: "1 mês",
    months: 1,
    totalCents: 3990,
    originalCents: null,
    savePercent: null,
    weeklyCents: 1000,
  },
  {
    id: "3m",
    label: "3 meses",
    months: 3,
    totalCents: 9990,
    originalCents: 11970,
    savePercent: 17,
    weeklyCents: 833,
  },
  {
    id: "6m",
    label: "6 meses",
    months: 6,
    totalCents: 17990,
    originalCents: 23940,
    savePercent: 25,
    weeklyCents: 750,
  },
];

export function formatBRL(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}
