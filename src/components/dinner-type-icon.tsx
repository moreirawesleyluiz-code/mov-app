/** Ícones em círculo — alinhado ao app interno claro. */
import type { SeMovEventKind } from "@/lib/se-mov-event-kind";

export function DinnerTypeIcon({ kind }: { kind: SeMovEventKind }) {
  if (kind === "cafe") {
    return (
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-violet-50 ring-1 ring-violet-200/90" aria-hidden>
        <CoffeeIcon />
      </div>
    );
  }

  if (kind === "exodo") {
    return (
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-50 ring-1 ring-emerald-200/90" aria-hidden>
        <DrinksIcon />
      </div>
    );
  }

  return (
    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-orange-50 ring-1 ring-orange-200/90" aria-hidden>
      <ForkKnifeIcon />
    </div>
  );
}

function ForkKnifeIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path
        d="M6.5 3v6.8M9.4 3v6.8M6.5 6.5h2.9M8 9.8v11.2M14.8 3v10M14.8 13c1.8 0 2.8-1.1 2.8-3.1V3M14.8 13V21"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-rose-600"
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
        className="text-violet-600"
      />
    </svg>
  );
}

function DrinksIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path
        d="M5 4h6l-3 4v8.5a1.5 1.5 0 0 0 .4 1l1.1 1.3M17 4l2.2 3.5a1.5 1.5 0 0 1 .2.8V18m-5-14h5m-4 14h5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-emerald-600"
      />
    </svg>
  );
}
