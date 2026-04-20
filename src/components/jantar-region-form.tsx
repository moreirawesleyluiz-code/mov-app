"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { SpRegion } from "@/lib/sp-regions";

function hrefWithRegionKey(base: string, regionKey: string) {
  const sep = base.includes("?") ? "&" : "?";
  return `${base}${sep}regionKey=${encodeURIComponent(regionKey)}`;
}

export function JantarRegionForm({
  eventId,
  regions,
  backHref = "/app/agenda",
  headerTitle = "Jantar",
  /** Largura da barra de progresso (0–1). Predefinição 0,5 = etapa do meio (jantar). */
  progressFraction = 0.5,
  /**
   * Caminho base pós-região (sem query). No client acrescenta `regionKey`.
   * Ex.: `/app/ex/datas/abc/pagamento` → `...?regionKey=...`
   * Se omitido, usa o fluxo jantar: `/app/agenda/{eventId}/preferencias?regionKey=...`
   */
  continueHrefBase,
}: {
  eventId: string;
  regions: SpRegion[];
  backHref?: string;
  headerTitle?: string;
  progressFraction?: number;
  continueHrefBase?: string;
}) {
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);

  const selectedRegion = regions.find((r) => r.id === selected);
  const canContinue = selectedRegion?.enabled === true && selected !== null;

  function onContinue() {
    if (!canContinue || !selected) return;
    const href = continueHrefBase
      ? hrefWithRegionKey(continueHrefBase, selected)
      : `/app/agenda/${eventId}/preferencias?regionKey=${encodeURIComponent(selected)}`;
    router.push(href);
  }

  const progressPct = Math.round(Math.min(1, Math.max(0, progressFraction)) * 100);

  return (
    <div className="mx-auto flex min-h-[min(100vh-8rem,900px)] max-w-lg flex-col pb-8">
      <div className="relative mb-4 flex h-12 shrink-0 items-center justify-center">
        <Link
          href={backHref}
          className="absolute left-0 flex h-10 w-10 items-center justify-center rounded-lg text-movApp-ink transition hover:bg-movApp-subtle"
          aria-label="Voltar"
        >
          <span className="text-xl" aria-hidden>
            ←
          </span>
        </Link>
        <h1 className="text-base font-semibold text-movApp-ink">{headerTitle}</h1>
      </div>

      <div className="mb-6 h-1 w-full overflow-hidden rounded-full bg-movApp-border">
        <div
          className="h-full rounded-full bg-gradient-to-r from-movApp-accent via-orange-400 to-pink-500"
          style={{ width: `${progressPct}%` }}
          role="progressbar"
          aria-valuenow={progressPct}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>

      <h2 className="font-display text-2xl font-semibold leading-tight text-movApp-ink">
        Onde você gostaria de ir?
      </h2>

      <div className="mt-5 flex flex-1 flex-col gap-3 sm:mt-6">
        {regions.map((r) => {
          const isSelected = selected === r.id;
          const disabled = !r.enabled;
          return (
            <button
              key={r.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              disabled={disabled}
              onClick={() => !disabled && setSelected(r.id)}
              className={cn(
                "flex w-full min-h-[3.25rem] items-center justify-between rounded-2xl border px-4 py-4 text-left transition",
                disabled && "cursor-not-allowed opacity-45",
                !disabled && !isSelected && "border-movApp-border bg-movApp-paper hover:border-movApp-muted/60",
                !disabled &&
                  isSelected &&
                  "border-movApp-accent/80 bg-movApp-accentSoft ring-1 ring-movApp-accent/25",
              )}
            >
              <span
                className={cn(
                  "text-sm font-medium",
                  disabled ? "text-movApp-muted" : "text-movApp-ink",
                )}
              >
                {r.label}
              </span>
              <span
                className={cn(
                  "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 bg-transparent",
                  disabled ? "border-movApp-border" : "border-movApp-muted",
                  isSelected && !disabled && "border-movApp-accent",
                )}
                aria-hidden
              >
                {isSelected && !disabled ? (
                  <span className="h-2.5 w-2.5 rounded-full bg-movApp-accent" />
                ) : null}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-auto pt-8">
        <Button
          type="button"
          disabled={!canContinue}
          onClick={onContinue}
          className="h-12 w-full text-base font-semibold"
        >
          Continuar
        </Button>
      </div>
    </div>
  );
}
