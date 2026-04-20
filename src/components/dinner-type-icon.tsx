/** Ícones em círculo — alinhado ao app interno claro. */
import type { SeMovEventKind } from "@/lib/se-mov-event-kind";

export function DinnerTypeIcon({ kind }: { kind: SeMovEventKind }) {
  if (kind === "cafe") {
    return (
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-amber-50 ring-1 ring-amber-200/80" aria-hidden>
        <CoffeeIcon />
      </div>
    );
  }

  if (kind === "exodo") {
    return (
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-sky-50 ring-1 ring-sky-200/80" aria-hidden>
        <ExodoIcon />
      </div>
    );
  }

  return (
    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-movApp-accentSoft ring-1 ring-movApp-accent/25" aria-hidden>
      <ForkKnifeIcon />
    </div>
  );
}

function ForkKnifeIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path
        d="M11 3v9c0 1.5-.5 2-2 2M11 3c0 2.5 2 4.5 4 4.5M11 3c0-2 2-3 4-3M15 21v-6M19 11V3M19 3c-1.5 0-3 .5-3 2v6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        className="text-movApp-accent"
      />
    </svg>
  );
}

function CoffeeIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path
        d="M6 9h10v4a4 4 0 0 1-4 4h-2a4 4 0 0 1-4-4V9Zm10 1h1.2a2.3 2.3 0 1 1 0 4.6H16M8 5.8c0-.8.7-1.2 1.2-1.7M11 5.8c0-.8.7-1.2 1.2-1.7M6 20h10"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-amber-700"
      />
    </svg>
  );
}

function ExodoIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path
        d="M5 18c1.8-2.1 3.7-3.2 5.8-3.2S14.8 15.9 17 18M8.5 10.5l2.3 2.3 4.7-4.8M4 20h16"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-sky-700"
      />
    </svg>
  );
}
