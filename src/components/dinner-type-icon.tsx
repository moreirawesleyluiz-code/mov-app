/** Ícones em círculo — alinhado ao app interno claro. */

export function DinnerTypeIcon({ index }: { index: number }) {
  const warm = index % 2 === 0;
  return (
    <div
      className={
        warm
          ? "flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-movApp-accentSoft ring-1 ring-movApp-accent/25"
          : "flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-teal-50 ring-1 ring-teal-200/80"
      }
      aria-hidden
    >
      {warm ? <ForkKnifeIcon /> : <GlassIcon />}
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

function GlassIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path
        d="M8 22h8M12 11v11M8 6l4-4 4 4M8 6h8v5c0 2-1.5 3-4 3s-4-1-4-3V6z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-teal-700"
      />
    </svg>
  );
}
