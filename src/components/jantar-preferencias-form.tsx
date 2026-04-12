"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  BUDGET_OPTIONS,
  DIETARY_OPTIONS,
  LANGUAGE_OPTIONS,
} from "@/lib/dinner-prefs";
import { loadJantarDraft, saveJantarDraft } from "@/lib/jantar-draft";
import { cn } from "@/lib/utils";

function CheckSquare({ checked }: { checked: boolean }) {
  return (
    <span
      className={cn(
        "flex h-6 w-6 shrink-0 items-center justify-center rounded border-2 transition",
        checked ? "border-movApp-accent bg-movApp-accent" : "border-movApp-muted bg-transparent",
      )}
      aria-hidden
    >
      {checked ? (
        <svg
          className="h-3.5 w-3.5 text-white"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
        >
          <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : null}
    </span>
  );
}

const initialDietaryMap = (): Record<string, boolean> =>
  Object.fromEntries(DIETARY_OPTIONS.map((o) => [o.id, false]));

export function JantarPreferenciasForm({
  eventId,
  regionKey,
}: {
  eventId: string;
  regionKey: string;
}) {
  const router = useRouter();
  const [lang, setLang] = useState<Record<string, boolean>>({
    pt: true,
    en: false,
  });
  const [budget, setBudget] = useState<Record<string, boolean>>({
    "$": true,
    "$$": true,
    "$$$": false,
  });
  const [dietary, setDietary] = useState(false);
  const [dietaryMap, setDietaryMap] = useState<Record<string, boolean>>(initialDietaryMap);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const d = loadJantarDraft(eventId);
    if (!d || d.regionKey !== regionKey) return;
    const nextLang: Record<string, boolean> = {};
    LANGUAGE_OPTIONS.forEach((o) => {
      nextLang[o.id] = d.languages.includes(o.id);
    });
    setLang(nextLang);
    const nextBudget: Record<string, boolean> = {};
    BUDGET_OPTIONS.forEach((o) => {
      nextBudget[o.id] = d.budgetTiers.includes(o.id);
    });
    setBudget(nextBudget);
    setDietary(d.dietaryRestrictions);
    const nextDiet = initialDietaryMap();
    DIETARY_OPTIONS.forEach((o) => {
      nextDiet[o.id] = d.dietaryTypes.includes(o.id);
    });
    setDietaryMap(nextDiet);
  }, [eventId, regionKey]);

  const languagesSelected = useMemo(
    () => LANGUAGE_OPTIONS.filter((o) => lang[o.id]).map((o) => o.id),
    [lang],
  );
  const budgetSelected = useMemo(
    () => BUDGET_OPTIONS.filter((o) => budget[o.id]).map((o) => o.id),
    [budget],
  );
  const dietaryTypesSelected = useMemo(
    () => DIETARY_OPTIONS.filter((o) => dietaryMap[o.id]).map((o) => o.id),
    [dietaryMap],
  );

  const canContinue =
    languagesSelected.length > 0 &&
    budgetSelected.length > 0 &&
    (!dietary || dietaryTypesSelected.length > 0);

  function toggleLang(id: string) {
    setLang((s) => ({ ...s, [id]: !s[id] }));
  }
  function toggleBudget(id: string) {
    setBudget((s) => ({ ...s, [id]: !s[id] }));
  }
  function toggleDietaryType(id: string) {
    setDietaryMap((s) => ({ ...s, [id]: !s[id] }));
  }

  function setDietaryEnabled(on: boolean) {
    setDietary(on);
    if (!on) {
      setDietaryMap(initialDietaryMap());
    }
  }

  function onContinue() {
    if (!canContinue) return;
    setError(null);
    saveJantarDraft(eventId, {
      regionKey,
      languages: languagesSelected,
      budgetTiers: budgetSelected,
      dietaryRestrictions: dietary,
      dietaryTypes: dietary ? dietaryTypesSelected : [],
    });
    router.push(`/app/agenda/${eventId}/resumo`);
  }

  return (
    <div className="mx-auto flex min-h-[min(100vh-8rem,900px)] max-w-lg flex-col pb-8">
      <div className="relative mb-4 flex h-12 shrink-0 items-center justify-center">
        <Link
          href={`/app/agenda/${eventId}/regiao`}
          className="absolute left-0 flex h-10 w-10 items-center justify-center rounded-lg text-movApp-ink transition hover:bg-movApp-subtle"
          aria-label="Voltar"
        >
          <span className="text-xl" aria-hidden>
            ←
          </span>
        </Link>
        <h1 className="text-base font-semibold text-movApp-ink">Jantar</h1>
      </div>

      <div className="mb-6 h-1 w-full overflow-hidden rounded-full bg-movApp-border">
        <div
          className="h-full w-[75%] rounded-full bg-gradient-to-r from-movApp-accent via-orange-400 to-pink-500"
          role="progressbar"
          aria-valuenow={75}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>

      <section className="mt-2">
        <h2 className="text-sm font-medium leading-snug text-movApp-ink">
          Que idioma(s) você está disposto a falar no jantar?{" "}
          <span className="text-movApp-muted">( Obrigatório )</span>
        </h2>
        <div className="mt-4 flex flex-col gap-3">
          {LANGUAGE_OPTIONS.map((o) => {
            const checked = !!lang[o.id];
            return (
              <button
                key={o.id}
                type="button"
                onClick={() => toggleLang(o.id)}
                className={cn(
                  "flex w-full min-h-[3.25rem] items-center justify-between rounded-2xl border px-4 py-4 text-left transition",
                  checked
                    ? "border-movApp-accent/70 bg-movApp-accentSoft ring-1 ring-movApp-accent/20"
                    : "border-movApp-border bg-movApp-paper hover:border-movApp-muted/60",
                )}
              >
                <span className="text-sm font-medium text-movApp-ink">{o.label}</span>
                <CheckSquare checked={checked} />
              </button>
            );
          })}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-sm font-medium leading-snug text-movApp-ink">
          Quanto você está disposto a gastar no jantar?{" "}
          <span className="text-movApp-muted">( Obrigatório )</span>
        </h2>
        <div className="mt-4 flex flex-col gap-3">
          {BUDGET_OPTIONS.map((o) => {
            const checked = !!budget[o.id];
            return (
              <button
                key={o.id}
                type="button"
                onClick={() => toggleBudget(o.id)}
                className={cn(
                  "flex w-full min-h-[3.25rem] items-center justify-between rounded-2xl border px-4 py-4 text-left transition",
                  checked
                    ? "border-movApp-accent/70 bg-movApp-accentSoft ring-1 ring-movApp-accent/20"
                    : "border-movApp-border bg-movApp-paper hover:border-movApp-muted/60",
                )}
              >
                <span className="text-base font-semibold text-movApp-ink">{o.label}</span>
                <CheckSquare checked={checked} />
              </button>
            );
          })}
        </div>
      </section>

      <section className="mt-8">
        <div className="flex min-h-[3.25rem] items-center justify-between gap-4 rounded-2xl border border-movApp-border bg-movApp-subtle/80 px-4 py-4">
          <h2 className="text-sm font-semibold leading-snug text-movApp-ink">
            Tenho restrições alimentares{" "}
            <span className="font-normal text-movApp-muted">( Opcional )</span>
          </h2>
          <button
            type="button"
            role="switch"
            aria-checked={dietary}
            onClick={() => setDietaryEnabled(!dietary)}
            className={cn(
              "relative h-8 w-14 shrink-0 rounded-full transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500",
              dietary ? "bg-emerald-600" : "bg-movApp-border",
            )}
          >
            <span
              className={cn(
                "absolute top-1 h-6 w-6 rounded-full bg-white shadow transition",
                dietary ? "left-7" : "left-1",
              )}
            />
          </button>
        </div>

        {dietary && (
          <div className="mt-3 flex flex-col gap-3">
            {DIETARY_OPTIONS.map((o) => {
              const checked = !!dietaryMap[o.id];
              return (
                <button
                  key={o.id}
                  type="button"
                  onClick={() => toggleDietaryType(o.id)}
                  className={cn(
                    "flex w-full min-h-[3.25rem] items-center justify-between rounded-2xl border px-4 py-4 text-left transition",
                    checked
                      ? "border-movApp-accent/70 bg-movApp-accentSoft ring-1 ring-movApp-accent/20"
                      : "border-movApp-border bg-movApp-paper hover:border-movApp-muted/60",
                  )}
                >
                  <span className="text-sm font-semibold text-movApp-ink">{o.label}</span>
                  <CheckSquare checked={checked} />
                </button>
              );
            })}
          </div>
        )}
      </section>

      {error && (
        <p className="mt-6 text-center text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      <div className="mt-10">
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
