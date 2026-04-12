/** Cookie HTTP-only: utilizador ativou Se Mov em modo demo sem conta (acesso ao fluxo jantar). */
export const SE_MOV_DEMO_COOKIE = "mov_se_mov_demo";

export function isSeMovDemoActive(cookieStore: {
  get: (name: string) => { value: string } | undefined;
}): boolean {
  return cookieStore.get(SE_MOV_DEMO_COOKIE)?.value === "1";
}
