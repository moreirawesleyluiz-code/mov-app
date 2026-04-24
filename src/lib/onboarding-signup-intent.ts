/** Query na landing para iniciar onboarding antes do cadastro (`/?intent=signup`). */
export const ONBOARDING_INTENT_PARAM = "intent";
export const ONBOARDING_SIGNUP_INTENT = "signup";

const REGISTER_CB_STORAGE_KEY = "mov_onboarding_register_cb";

function isSafeAppCallback(path: string): boolean {
  return (path === "/app" || path.startsWith("/app/")) && !path.startsWith("//");
}

/** Grava o destino pós-registo quando o utilizador entra pela landing com `callbackUrl` (ex.: vindo do login). */
export function persistRegisterCallbackFromSearch(callbackUrl: string | null): void {
  try {
    if (callbackUrl && isSafeAppCallback(callbackUrl)) {
      sessionStorage.setItem(REGISTER_CB_STORAGE_KEY, callbackUrl);
    } else {
      sessionStorage.removeItem(REGISTER_CB_STORAGE_KEY);
    }
  } catch {
    /* ignore */
  }
}

/** Destino para `register?callbackUrl=` após concluir o questionário. */
export function getRegisterCallbackAfterOnboarding(): string {
  try {
    const s = sessionStorage.getItem(REGISTER_CB_STORAGE_KEY);
    if (s && isSafeAppCallback(s)) return s;
  } catch {
    /* ignore */
  }
  return "/app";
}

export function clearRegisterCallbackStorage(): void {
  try {
    sessionStorage.removeItem(REGISTER_CB_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

/**
 * Link para a landing que dispara o mesmo fluxo que "Começar", com retomada se existir estado guardado.
 * @param callbackPath opcional, ex. `/app/conta` quando o utilizador veio de `login?callbackUrl=...`
 */
export function buildSignupOnboardingHref(callbackPath?: string | null): string {
  const params = new URLSearchParams();
  params.set(ONBOARDING_INTENT_PARAM, ONBOARDING_SIGNUP_INTENT);
  if (callbackPath && isSafeAppCallback(callbackPath)) {
    params.set("callbackUrl", callbackPath);
  }
  return `/?${params.toString()}`;
}
