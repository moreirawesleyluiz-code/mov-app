"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  clearJantarDraft,
  loadJantarDraft,
  type JantarDraft,
} from "@/lib/jantar-draft";
import {
  formatBudgetSummary,
  formatDietarySummary,
  formatLanguageSummary,
  regionLabel,
} from "@/lib/jantar-display";
import { isValidRegionKey } from "@/lib/sp-regions";

export function JantarResumo({ eventId, headerTitle = "Jantar" }: { eventId: string; headerTitle?: string }) {
  const router = useRouter();
  const [draft, setDraft] = useState<JantarDraft | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const d = loadJantarDraft(eventId);
    if (!d || !d.regionKey || !isValidRegionKey(d.regionKey)) {
      router.replace("/app/agenda");
      return;
    }
    if (d.languages.length === 0 || d.budgetTiers.length === 0) {
      router.replace(
        `/app/agenda/${eventId}/preferencias?regionKey=${encodeURIComponent(d.regionKey)}`,
      );
      return;
    }
    if (d.dietaryRestrictions && d.dietaryTypes.length === 0) {
      router.replace(
        `/app/agenda/${eventId}/preferencias?regionKey=${encodeURIComponent(d.regionKey)}`,
      );
      return;
    }
    setDraft(d);
  }, [eventId, router]);

  async function onConfirm() {
    const d = loadJantarDraft(eventId);
    if (!d) {
      router.push("/app/agenda");
      return;
    }
    setLoading(true);
    setError(null);
    router.push("/app/planos");
    router.refresh();
  }

  if (!draft) {
    return (
      <div className="mx-auto max-w-lg py-16 text-center text-sm text-movApp-muted">
        Carregando…
      </div>
    );
  }

  const editHref = `/app/agenda/${eventId}/preferencias?regionKey=${encodeURIComponent(draft.regionKey)}`;

  return (
    <div className="mx-auto flex min-h-[min(100vh-8rem,900px)] max-w-lg flex-col pb-8">
      <div className="relative mb-4 flex h-12 shrink-0 items-center justify-center">
        <Link
          href={editHref}
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
          className="h-full w-[92%] rounded-full bg-gradient-to-r from-movApp-accent via-orange-400 to-pink-500"
          role="progressbar"
          aria-valuenow={92}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>

      <div className="rounded-3xl border border-movApp-border bg-movApp-paper px-5 py-6 text-movApp-ink shadow-sm">
        <SummaryRow label="Zona" value={regionLabel(draft.regionKey)} />
        <SummaryRow label="Valor" value={formatBudgetSummary(draft.budgetTiers)} />
        <SummaryRow
          label="Opções de jantar"
          value={formatDietarySummary(draft)}
        />
        <SummaryRow label="Idioma" value={formatLanguageSummary(draft.languages)} />
      </div>

      <div className="mt-6 flex justify-center">
        <Link
          href={editHref}
          className="inline-flex h-12 items-center justify-center rounded-full border border-movApp-border bg-movApp-subtle px-8 text-center text-sm font-semibold leading-none text-movApp-ink transition hover:bg-movApp-border/40"
        >
          Editar minhas preferências
        </Link>
      </div>

      {error && (
        <p className="mt-6 text-center text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      <div className="mt-10">
        <button
          type="button"
          disabled={loading}
          onClick={onConfirm}
          className="h-12 w-full rounded-xl bg-movApp-accent py-3 text-base font-semibold text-white transition hover:bg-movApp-accentHover disabled:opacity-50"
        >
          {loading ? "Confirmando…" : "Confirmar"}
        </button>
      </div>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-movApp-border/80 py-4 first:pt-0 last:border-b-0 last:pb-0">
      <p className="text-xs font-medium text-movApp-muted">{label}</p>
      <p className="mt-1 text-base font-semibold text-movApp-ink">{value}</p>
    </div>
  );
}
