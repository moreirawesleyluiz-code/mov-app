"use client";

import { useRouter } from "next/navigation";

function ArrowIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M9 18l6-6-6-6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-white"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M20 6L9 17l-5-5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-emerald-700"
      />
    </svg>
  );
}

export function DinnerSlotActions({
  eventId,
  registered,
  waitlist,
  demoFlow = false,
}: {
  eventId: string;
  registered: boolean;
  waitlist: boolean;
  /** Se true, mantém o botão de entrar no fluxo mesmo com reserva (modo programação/demo). */
  demoFlow?: boolean;
}) {
  const router = useRouter();
  const canOpenFlow = demoFlow || !registered;

  if (!canOpenFlow) {
    return (
      <div className="flex flex-col items-end gap-1">
        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-emerald-200 bg-emerald-50"
          title={waitlist ? "Lista de espera" : "Reservado"}
        >
          <CheckIcon />
        </div>
        <span className="max-w-[7rem] text-right text-[10px] leading-tight text-movApp-muted">
          {waitlist ? "Lista de espera" : "Reservado"}
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1">
      {registered && demoFlow ? (
        <span className="mb-0.5 max-w-[9rem] text-right text-[10px] leading-tight text-movApp-warn">
          Demo: explorar fluxo
        </span>
      ) : null}
      <button
        type="button"
        onClick={() => router.push(`/app/agenda/${eventId}/regiao`)}
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-movApp-accent text-white shadow-sm transition hover:bg-movApp-accentHover"
        aria-label={
          registered && demoFlow
            ? "Abrir fluxo da experiência (modo demonstração)"
            : "Escolher região para esta experiência"
        }
      >
        <ArrowIcon />
      </button>
      {registered && demoFlow ? (
        <span className="max-w-[7rem] text-right text-[10px] leading-tight text-movApp-muted">
          {waitlist ? "Lista de espera" : "Reservado"} · preview
        </span>
      ) : null}
    </div>
  );
}
