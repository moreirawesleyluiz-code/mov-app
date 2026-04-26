"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { MovAppWelcomeBackdrop } from "@/components/auth/auth-screen";
import { IconBack } from "@/components/onboarding/welcome-chrome";
import { cn } from "@/lib/utils";

/** Mesma regra que o login — destino seguro após auth. */
function isSafeAppPath(raw: string): boolean {
  return raw === "/app" || raw.startsWith("/app/");
}

function safeAppCallbackUrl(raw: string | null): string {
  const fallback = "/app";
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return fallback;
  if (!isSafeAppPath(raw)) return fallback;
  return raw;
}

const focusRingWelcome =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-movApp-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-movApp-bg";

type Props = {
  googleAuthEnabled: boolean;
};

export function AuthChoiceInner({ googleAuthEnabled }: Props) {
  const searchParams = useSearchParams();
  const [googleLoading, setGoogleLoading] = useState(false);

  const loginHref = useMemo(() => {
    const path = safeAppCallbackUrl(searchParams.get("callbackUrl"));
    return `/login?callbackUrl=${encodeURIComponent(path)}`;
  }, [searchParams]);

  async function onGoogle() {
    if (!googleAuthEnabled) {
      if (process.env.NODE_ENV === "development") {
        console.info("[MOV] Google OAuth indisponível: defina AUTH_GOOGLE_ID e AUTH_GOOGLE_SECRET no servidor.");
      }
      return;
    }
    setGoogleLoading(true);
    try {
      const { signIn } = await import("next-auth/react");
      await signIn("google", { callbackUrl: "/app" });
    } catch (err) {
      console.warn("[MOV] Falha ao iniciar login Google:", err);
      setGoogleLoading(false);
    }
  }

  return (
    <MovAppWelcomeBackdrop>
      <main className="relative z-10 mx-auto flex min-h-[100dvh] max-w-md flex-col px-5 pb-[max(1.75rem,env(safe-area-inset-bottom))] pt-[max(1.25rem,env(safe-area-inset-top))] sm:px-6">
        <div className="flex shrink-0 items-center">
          <button
            type="button"
            onClick={() => {
              window.location.href = new URL("/", window.location.origin).href;
            }}
            className={cn(
              "-ml-1 inline-flex rounded-full border border-movApp-border bg-movApp-paper p-2 text-movApp-ink shadow-sm transition hover:bg-movApp-subtle active:scale-[0.98]",
              focusRingWelcome,
            )}
            aria-label="Voltar para a página inicial"
          >
            <IconBack className="h-6 w-6" />
          </button>
        </div>

        {/* Respiro superior — empurra CTAs para a zona inferior útil do ecrã */}
        <div
          className="pointer-events-none min-h-0 w-full shrink-0 grow basis-0 max-h-[min(48dvh,400px)] sm:max-h-[min(52dvh,440px)]"
          aria-hidden
        />

        <div className="flex min-h-0 w-full flex-1 flex-col justify-end pb-1 pt-3">
          <div className="mx-auto w-full max-w-md space-y-3">
            <Link
              href={loginHref}
              className={cn(
                "flex min-h-[48px] w-full items-center justify-center rounded-xl bg-movApp-accent py-3 text-center text-[15px] font-semibold text-white shadow-[0_10px_32px_rgba(196,92,74,0.22)] transition hover:bg-movApp-accentHover hover:shadow-[0_14px_36px_rgba(196,92,74,0.28)] active:scale-[0.99]",
                focusRingWelcome,
              )}
            >
              Continuar com e-mail
            </Link>
            <button
              type="button"
              onClick={() => void onGoogle()}
              disabled={googleLoading}
              className={cn(
                "flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl border border-movApp-border bg-movApp-paper py-3 text-center text-[15px] font-semibold text-movApp-ink shadow-sm transition enabled:hover:border-movApp-accent/35 enabled:hover:bg-movApp-subtle enabled:active:scale-[0.99] disabled:opacity-60",
                focusRingWelcome,
              )}
            >
              <svg className="h-[18px] w-[18px] shrink-0 text-movApp-ink" viewBox="0 0 24 24" aria-hidden>
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              {googleLoading ? "Conectando…" : "Continuar com Google"}
            </button>
          </div>
        </div>
      </main>
    </MovAppWelcomeBackdrop>
  );
}
