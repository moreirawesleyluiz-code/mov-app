import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-mov-border bg-mov-bg">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="font-display text-xl tracking-tight text-mov-cream">
          MOV
        </Link>
        <nav className="flex items-center gap-3 sm:gap-4">
          <Link
            href="/login"
            className="text-sm text-mov-muted transition hover:text-mov-cream"
          >
            Entrar
          </Link>
          <Link
            href="/register"
            className="inline-flex items-center justify-center rounded-xl bg-mov-accent px-4 py-2 text-sm font-medium text-white transition hover:bg-mov-accentHover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mov-accent"
          >
            Criar conta
          </Link>
        </nav>
      </div>
    </header>
  );
}
