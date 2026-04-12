/**
 * Partição simples de participantes em mesas (máx. 6) para curadoria admin.
 * Heurística: ordena por energia social e distribui em “serpentina” para equilibrar médias entre mesas.
 */

export const MAX_MESA_SIZE = 6;

export type UserEnergyRow = { userId: string; energy: number };

/** Agrupa ids em mesas de até `maxSize`; round-robin após ordenar por energia para equilibrar cada mesa. */
export function partitionIntoMesas(rows: UserEnergyRow[], maxSize: number = MAX_MESA_SIZE): string[][] {
  if (rows.length === 0) return [];
  const sorted = [...rows].sort((a, b) => a.energy - b.energy);
  const nMesas = Math.max(1, Math.ceil(sorted.length / maxSize));
  const mesas: string[][] = Array.from({ length: nMesas }, () => []);
  sorted.forEach((r, i) => {
    mesas[i % nMesas]!.push(r.userId);
  });
  return mesas.filter((m) => m.length > 0);
}

export function summarizeMesaComposition(energies: (number | null)[]): { line: string; alert: string | null } {
  const ok = energies.filter((e): e is number => e !== null && !Number.isNaN(e));
  if (ok.length === 0) return { line: "Composição heterogénea — rever perfis no detalhe.", alert: null };
  const avg = ok.reduce((a, b) => a + b, 0) / ok.length;
  const min = Math.min(...ok);
  const max = Math.max(...ok);
  const spread = max - min;
  let line = "";
  if (avg >= 62) line = "Mesa com energia social média-alta — boa para dinâmica mais expansiva.";
  else if (avg <= 42) line = "Mesa mais contida — melhor em ambiente calmo e conversa guiada.";
  else line = "Mesa equilibrada, boa profundidade de conversa e energia social média.";

  let alert: string | null = null;
  if (spread > 45) alert = "Dispersão alta entre perfis — considerar mediação ou subdividir.";

  return { line, alert };
}
