"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin", label: "Utilizadores" },
  { href: "/admin/mesas", label: "Mesas" },
  { href: "/admin/eventos", label: "Eventos" },
  { href: "/admin/denuncias", label: "Denúncias" },
  { href: "/admin/restaurantes", label: "Restaurantes" },
  { href: "/admin/montagem", label: "Montagem" },
] as const;

function isActive(pathname: string, href: string): boolean {
  if (href === "/admin") return pathname === "/admin" || pathname === "/admin/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function IconUsers({ className }: { className?: string }) {
  return (
    <svg className={className} width={24} height={24} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M16 19v-1.2A3.8 3.8 0 0012.2 14H6.8A3.8 3.8 0 003 17.8V19m17 0v-1a3 3 0 00-2.2-2.9M14 5.2a3.2 3.2 0 110 6.4 3.2 3.2 0 010-6.4zm-7 0a3.2 3.2 0 110 6.4 3.2 3.2 0 010-6.4z"
        stroke="currentColor"
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconTables({ className }: { className?: string }) {
  return (
    <svg className={className} width={24} height={24} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 8h16M7 8V5h10v3m-8 0v11m6-11v11M5 19h14"
        stroke="currentColor"
        strokeWidth={1.7}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconRestaurant({ className }: { className?: string }) {
  return (
    <svg className={className} width={24} height={24} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M6 4v5a2 2 0 01-2 2V4m4 0v7m0 0v9m8-16c2 1.6 3 4 3 7s-1 5.4-3 7m0-14v14m0-8h-3"
        stroke="currentColor"
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconCuration({ className }: { className?: string }) {
  return (
    <svg className={className} width={24} height={24} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 12h6m4 0h6M12 4v6m0 4v6M8 8l8 8M16 8l-8 8"
        stroke="currentColor"
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconEvents({ className }: { className?: string }) {
  return (
    <svg className={className} width={24} height={24} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M7 3v3m10-3v3M4 9h16M6.5 5h11A1.5 1.5 0 0119 6.5v12a1.5 1.5 0 01-1.5 1.5h-11A1.5 1.5 0 015 18.5v-12A1.5 1.5 0 016.5 5zm2.5 7h2v2H9v-2zm4 0h2v2h-2v-2z"
        stroke="currentColor"
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconReports({ className }: { className?: string }) {
  return (
    <svg className={className} width={24} height={24} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 8v5m0 3h.01M10.3 4.7l-7 12.1A1 1 0 004.2 18h15.6a1 1 0 00.87-1.52l-7-12.1a1 1 0 00-1.74 0z"
        stroke="currentColor"
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const NAV_ICONS = {
  "/admin": IconUsers,
  "/admin/mesas": IconTables,
  "/admin/eventos": IconEvents,
  "/admin/denuncias": IconReports,
  "/admin/restaurantes": IconRestaurant,
  "/admin/montagem": IconCuration,
} as const;

export function AdminMainNav() {
  const pathname = usePathname() ?? "";

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-[120] border-t border-movApp-border/70 bg-movApp-paper/95 shadow-[0_-4px_18px_rgba(28,25,23,0.05)] backdrop-blur-md supports-[backdrop-filter]:bg-movApp-paper/90"
      aria-label="Áreas administrativas"
      style={{ paddingBottom: "max(0.35rem, env(safe-area-inset-bottom, 0px))" }}
    >
      <ul className="mx-auto grid w-full max-w-6xl list-none grid-cols-6 p-0">
        {NAV.map((item) => {
          const active = isActive(pathname, item.href);
          const Icon = NAV_ICONS[item.href];
          return (
            <li key={item.href} className="min-w-0">
              <Link
                href={item.href}
                className={cn(
                  "flex min-h-[3.75rem] w-full flex-col items-center justify-center gap-1 px-1 py-2 text-center no-underline transition active:opacity-90 lg:min-h-[4rem]",
                  active ? "text-movApp-accent" : "text-movApp-muted",
                )}
                aria-current={active ? "page" : undefined}
              >
                <span
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl transition-colors",
                    active ? "bg-movApp-accentSoft text-movApp-accent" : "bg-transparent text-movApp-muted",
                  )}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                </span>
                <span
                  className={cn(
                    "w-full truncate px-0.5 text-[11px] leading-[1.1] tracking-tight lg:text-xs",
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
  );
}
