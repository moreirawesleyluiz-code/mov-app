"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { JANTAR_FROM_INICIO_KEY } from "@/lib/jantar-nav-inicio";
import { syncPendingOnboardingAfterAuth } from "@/lib/onboarding-client-sync";
import { cn } from "@/lib/utils";

const NAV_CORE = [
  { href: "/app", label: "Início" },
  { href: "/app/comunidade", label: "Comunidade" },
  { href: "/app/eventos", label: "Eventos" },
  { href: "/app/conta", label: "Conta" },
] as const;

function IconInicio({ className }: { className?: string }) {
  return (
    <svg className={className} width={24} height={24} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 10.5L12 4l8 6.5V20a1 1 0 01-1 1h-5v-6H10v6H5a1 1 0 01-1-1v-9.5z"
        stroke="currentColor"
        strokeWidth={1.75}
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconComunidade({ className }: { className?: string }) {
  return (
    <svg className={className} width={24} height={24} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"
        stroke="currentColor"
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconEventos({ className }: { className?: string }) {
  return (
    <svg className={className} width={24} height={24} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M8 6V4m8 2V4M5 10h14M5 8a2 2 0 012-2h10a2 2 0 012 2v10a2 2 0 01-2 2H7a2 2 0 01-2-2V8z"
        stroke="currentColor"
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconConta({ className }: { className?: string }) {
  return (
    <svg className={className} width={24} height={24} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 12a3.5 3.5 0 100-7 3.5 3.5 0 000 7zm-7 8.5c0-3.5 3-6.5 7-6.5s7 3 7 6.5"
        stroke="currentColor"
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const NAV_ICONS = {
  "/app": IconInicio,
  "/app/comunidade": IconComunidade,
  "/app/eventos": IconEventos,
  "/app/conta": IconConta,
} as const;

function clearJantarNavOrigin() {
  try {
    sessionStorage.removeItem(JANTAR_FROM_INICIO_KEY);
  } catch {
    /* ignore */
  }
}

function isNavActive(pathname: string, href: string, jantarFromInicio: boolean) {
  if (href === "/app") {
    return pathname === "/app" || (pathname.startsWith("/app/agenda") && jantarFromInicio);
  }
  if (href === "/app/eventos") {
    return pathname === href || pathname.startsWith(`${href}/`);
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const authed = status === "authenticated" && !!session?.user;

  const [jantarFromInicio, setJantarFromInicio] = useState(false);
  const onboardingSynced = useRef(false);

  useEffect(() => {
    try {
      setJantarFromInicio(sessionStorage.getItem(JANTAR_FROM_INICIO_KEY) === "1");
    } catch {
      setJantarFromInicio(false);
    }
  }, [pathname]);

  useEffect(() => {
    if (status === "unauthenticated") onboardingSynced.current = false;
  }, [status]);

  useEffect(() => {
    if (status !== "authenticated" || onboardingSynced.current) return;
    onboardingSynced.current = true;
    void syncPendingOnboardingAfterAuth().catch(() => {});
  }, [status]);

  function onNavClick() {
    clearJantarNavOrigin();
    setJantarFromInicio(false);
  }

  return (
    <div className="relative isolate min-h-[100dvh] bg-movApp-bg text-movApp-ink antialiased [color-scheme:light]">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 pb-6 pt-4 sm:px-6 lg:flex-row lg:px-8 lg:pb-10 lg:pt-10">
        <aside className="hidden w-52 shrink-0 flex-col rounded-2xl border border-movApp-border bg-movApp-paper p-4 shadow-sm lg:flex lg:min-h-[calc(100dvh-5rem)]">
          <Link href="/app" className="shrink-0 font-display text-xl font-medium tracking-tight text-movApp-ink">
            MOV
          </Link>
          <nav className="mt-8 flex min-h-0 flex-1 flex-col gap-1" aria-label="Principal">
            {NAV_CORE.map((item) => {
              const active = isNavActive(pathname, item.href, jantarFromInicio);
              const Icon = NAV_ICONS[item.href as keyof typeof NAV_ICONS];
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onNavClick}
                  className={cn(
                    "flex min-h-11 items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition",
                    active
                      ? "bg-movApp-accentSoft font-semibold text-movApp-accent"
                      : "text-movApp-muted hover:bg-movApp-subtle hover:text-movApp-ink",
                  )}
                >
                  <Icon className="h-[22px] w-[22px] shrink-0 opacity-90" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          {authed && (
            <div className="mt-auto shrink-0 border-t border-movApp-border/80 pt-6">
              <Button
                type="button"
                variant="ghost"
                className="h-11 w-full justify-start px-3"
                onClick={() => signOut({ callbackUrl: "/" })}
              >
                Sair
              </Button>
            </div>
          )}
        </aside>

        <div
          className={cn(
            "min-w-0 w-full flex-1 max-lg:w-full",
            /* espaço para a tab bar fixa + safe area (mobile apenas) */
            "max-lg:pb-[calc(4.75rem+env(safe-area-inset-bottom,0px))] lg:pb-0",
            /* respiro sob notch / status bar — sem barra de topo extra */
            "max-lg:pt-[max(0.5rem,env(safe-area-inset-top,0px))]",
          )}
        >
          {children}
        </div>
      </div>

      {/* Tab bar mobile: largura total, 4 colunas iguais, ícone acima + label — sem duplicar navegação no topo */}
      <nav
        className="fixed inset-x-0 bottom-0 z-[100] border-t border-movApp-border/70 bg-white/95 shadow-[0_-4px_24px_rgba(28,25,23,0.06)] backdrop-blur-md supports-[backdrop-filter]:bg-white/85 lg:hidden"
        style={{
          paddingBottom: "max(0.35rem, env(safe-area-inset-bottom, 0px))",
        }}
        aria-label="Principal"
      >
        <ul className="mx-auto flex w-full list-none p-0">
          {NAV_CORE.map((item) => {
            const active = isNavActive(pathname, item.href, jantarFromInicio);
            const Icon = NAV_ICONS[item.href as keyof typeof NAV_ICONS];
            return (
              <li key={item.href} className="min-w-0 flex-1">
                <Link
                  href={item.href}
                  onClick={onNavClick}
                  className={cn(
                    "flex min-h-[3.75rem] w-full flex-col items-center justify-center gap-1 px-0.5 py-2 text-center no-underline transition active:opacity-90",
                    active ? "text-movApp-accent" : "text-movApp-muted",
                  )}
                >
                  <span
                    className={cn(
                      "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl transition-colors",
                      active
                        ? "bg-movApp-accentSoft text-movApp-accent"
                        : "bg-transparent text-movApp-muted",
                    )}
                  >
                    <Icon className="h-6 w-6 shrink-0" aria-hidden />
                  </span>
                  <span
                    className={cn(
                      "w-full max-w-full px-0.5 text-[11px] leading-[1.1] tracking-tight",
                      active ? "font-semibold text-movApp-accent" : "font-medium text-movApp-muted",
                    )}
                  >
                    {item.label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
