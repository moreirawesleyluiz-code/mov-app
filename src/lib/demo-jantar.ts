/** Modo demo: permite abrir o fluxo do jantar mesmo já tendo reserva (para testar as páginas). */
export function isDemoJantarFlowEnabled(): boolean {
  const v = process.env.NEXT_PUBLIC_DEMO_JANTAR_FLOW;
  return v === "true" || v === "1";
}
