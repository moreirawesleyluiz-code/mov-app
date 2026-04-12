import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-mov-border bg-mov-bg">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="font-display text-lg text-mov-cream">MOV</p>
            <p className="mt-2 max-w-sm text-sm text-mov-muted">
              Comunidade de conexões reais. O encontro é só o começo.
            </p>
          </div>
          <div className="flex gap-8 text-sm">
            <div className="flex flex-col gap-2">
              <span className="font-medium text-mov-cream">Conta</span>
              <Link href="/login" className="text-mov-muted hover:text-mov-cream">
                Entrar
              </Link>
              <Link href="/register" className="text-mov-muted hover:text-mov-cream">
                Registrar
              </Link>
            </div>
            <div className="flex flex-col gap-2">
              <span className="font-medium text-mov-cream">App</span>
              <Link href="/app/agenda" className="text-mov-muted hover:text-mov-cream">
                Painel
              </Link>
            </div>
          </div>
        </div>
        <p className="mt-10 text-xs text-mov-muted">
          © {new Date().getFullYear()} MOV. São Paulo.
        </p>
      </div>
    </footer>
  );
}
