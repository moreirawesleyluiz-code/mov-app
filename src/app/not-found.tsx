import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-movApp-bg px-4 text-center text-movApp-ink [color-scheme:light]">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-movApp-accent">404</p>
      <h1 className="mt-3 font-display text-2xl tracking-tight sm:text-3xl">Página não encontrada</h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-movApp-muted">
        O endereço pode ter mudado ou o link está incorreto.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href="/"
          className="inline-flex min-h-11 items-center rounded-xl border border-movApp-border bg-movApp-paper px-5 py-2.5 text-sm font-semibold text-movApp-ink shadow-sm transition hover:border-movApp-accent/35"
        >
          Ir ao início
        </Link>
        <Link
          href="/login"
          className="inline-flex min-h-11 items-center rounded-xl bg-movApp-accent px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-movApp-accentHover"
        >
          Entrar
        </Link>
      </div>
    </div>
  );
}
