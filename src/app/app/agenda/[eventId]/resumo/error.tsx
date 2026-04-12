"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function JantarResumoError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[jantar/resumo]", error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[min(100vh-8rem,900px)] max-w-lg flex-col items-center justify-center px-4 py-16 text-center">
      <h1 className="text-lg font-semibold text-movApp-ink">Não foi possível carregar o resumo</h1>
      <p className="mt-3 text-sm text-movApp-muted">
        Pode ser bloqueio de ficheiros (OneDrive), base SQLite ou sessão. Em desenvolvimento, o
        detalhe aparece abaixo.
      </p>
      {process.env.NODE_ENV === "development" ? (
        <pre className="mt-4 max-h-40 w-full overflow-auto rounded-lg border border-movApp-border bg-movApp-subtle p-3 text-left text-xs text-red-700">
          {error.message}
        </pre>
      ) : null}
      <div className="mt-8 flex w-full max-w-sm flex-col gap-3 sm:flex-row sm:justify-center">
        <Button type="button" onClick={() => reset()} className="h-12 w-full sm:w-auto">
          Tentar de novo
        </Button>
        <Link
          href="/app/agenda"
          className={cn(
            "inline-flex h-12 items-center justify-center gap-2 rounded-xl px-5 text-sm font-medium transition",
            "border border-movApp-border bg-transparent text-movApp-ink hover:border-movApp-accent/50",
          )}
        >
          Voltar à agenda
        </Link>
      </div>
    </div>
  );
}
