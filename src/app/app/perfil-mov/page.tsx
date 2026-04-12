import Link from "next/link";
import { redirect } from "next/navigation";
import { buildMovJourney } from "@/lib/mov-journey";
import { loadUserOnboardingProfile } from "@/lib/load-user-onboarding-profile";
import type { CompatibilityAxesPayload } from "@/lib/compatibility-axes";

function pct(n: number | null | undefined): string {
  if (n === null || n === undefined) return "—";
  return `${Math.round(n * 100)}%`;
}

const AXIS_ROWS: { key: keyof CompatibilityAxesPayload; label: string; hint?: string }[] = [
  { key: "introversionScore", label: "Introversão / energia social", hint: "Mais alto = mais introvertido" },
  { key: "logicEmotionScore", label: "Lógica ↔ Emoção", hint: "0 lógica · 1 emoção" },
  { key: "humorScore", label: "Peso do humor" },
  { key: "creativityScore", label: "Criatividade (autopercepção)" },
  { key: "stressScore", label: "Nível de stress (autopercepção)" },
  { key: "sociabilityScore", label: "Sociabilidade (composto)" },
  { key: "familyImportanceScore", label: "Importância da família" },
  { key: "spiritualityImportanceScore", label: "Importância da espiritualidade" },
  { key: "politicsToleranceOrInterestScore", label: "Interesse em política / temas fortes" },
  { key: "cityNaturePreferenceScore", label: "Natureza ↔ Cidade", hint: "0 natureza · 1 cidade" },
  { key: "academicAmbitionScore", label: "Ambição acadêmica" },
  { key: "activityLifestyleScore", label: "Estilo de vida ativo", hint: "Treino + saídas" },
];

export default async function PerfilMovPage() {
  const data = await loadUserOnboardingProfile();
  if (!data) redirect("/login?callbackUrl=/app/perfil-mov");

  const journey = buildMovJourney(data);
  const hasAnswers = data.answerCount > 0;
  const hasAxes = data.axes !== null;
  const city = data.user?.city ?? "—";

  return (
    <div>
      <div className="relative overflow-hidden rounded-2xl border border-movApp-accent/25 bg-gradient-to-br from-movApp-paper to-movApp-subtle px-6 py-8 sm:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-movApp-accent">Perfil MOV</p>
        <h1 className="mt-3 font-display text-3xl leading-tight text-movApp-ink sm:text-4xl">{journey.headline}</h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-movApp-muted">{journey.subline}</p>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <span className="rounded-full border border-movApp-border bg-movApp-subtle px-3 py-1 text-xs text-movApp-ink">
            Estado: <strong className="text-movApp-accent">{journey.phaseLabel}</strong>
          </span>
          {hasAnswers && (
            <span className="text-xs text-movApp-muted">
              {data.answerCount} respostas · {hasAxes ? "eixos calculados" : "eixos em atualização"}
            </span>
          )}
        </div>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-movApp-border bg-movApp-paper p-6 shadow-sm lg:col-span-1">
          <h2 className="font-display text-lg text-movApp-ink">Cidade</h2>
          <p className="mt-3 text-2xl font-semibold text-movApp-ink">{city}</p>
          <p className="mt-2 text-sm text-movApp-muted">Sincronizada a partir da sua jornada inicial.</p>
        </div>
        <div className="rounded-2xl border border-movApp-border bg-movApp-paper p-6 shadow-sm lg:col-span-2">
          <h2 className="font-display text-lg text-movApp-ink">O que a MOV está a fazer</h2>
          <p className="mt-3 text-sm leading-relaxed text-movApp-muted">
            As suas respostas alimentam um perfil numérico (eixos) usado para, no futuro, equilibrar mesas —
            ritmo, humor, contexto urbano vs. tranquilo, e mais. Não há decisão automática de mesa nesta fase:
            o próximo passo é curadoria e matching, ainda em construção no produto.
          </p>
        </div>
      </div>

      <div className="mt-8 rounded-2xl border border-movApp-border bg-movApp-subtle/70 p-6">
        <h2 className="font-display text-lg text-movApp-ink">Respostas e processamento</h2>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          <li className="flex items-start justify-between gap-4 rounded-xl bg-movApp-paper px-4 py-3 shadow-sm">
            <span className="text-sm text-movApp-muted">Respostas no servidor</span>
            <span className={`text-sm font-medium ${hasAnswers ? "text-emerald-700" : "text-amber-700"}`}>
              {hasAnswers ? "Recebidas" : "Pendente"}
            </span>
          </li>
          <li className="flex items-start justify-between gap-4 rounded-xl bg-movApp-paper px-4 py-3 shadow-sm">
            <span className="text-sm text-movApp-muted">Eixos derivados</span>
            <span className={`text-sm font-medium ${hasAxes ? "text-emerald-700" : "text-amber-700"}`}>
              {hasAxes ? "Processados" : "Aguardando"}
            </span>
          </li>
          <li className="flex items-start justify-between gap-4 rounded-xl bg-movApp-paper px-4 py-3 shadow-sm sm:col-span-2">
            <span className="text-sm text-movApp-muted">Última atualização do perfil</span>
            <span className="text-sm text-movApp-ink">
              {data.profileUpdatedAt
                ? data.profileUpdatedAt.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })
                : "—"}
            </span>
          </li>
        </ul>
      </div>

      <div className="mt-10">
        <h2 className="font-display text-xl text-movApp-ink">Próximo passo no fluxo MOV</h2>
        <p className="mt-2 max-w-2xl text-sm text-movApp-muted">
          Acompanhe a linha do tempo até ao convite para uma mesa — com estados honestos (sem mesas ou pessoas
          simuladas).
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href={journey.primaryCta.href}
            className="inline-flex h-12 min-w-[10rem] items-center justify-center rounded-xl bg-movApp-accent px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-movApp-accentHover"
          >
            {journey.primaryCta.label}
          </Link>
          {journey.secondaryCta && (
            <Link
              href={journey.secondaryCta.href}
              className="inline-flex h-12 min-w-[10rem] items-center justify-center rounded-xl border border-movApp-border px-6 text-sm font-medium text-movApp-ink transition hover:bg-movApp-subtle"
            >
              {journey.secondaryCta.label}
            </Link>
          )}
        </div>
      </div>

      {hasAxes && data.axes ? (
        <div className="mt-14">
          <h2 className="font-display text-xl text-movApp-ink">Os seus eixos (resumo)</h2>
          <p className="mt-1 text-sm text-movApp-muted">Escala aproximada 0–100% para leitura rápida.</p>
          <ul className="mt-6 space-y-3">
            {AXIS_ROWS.map(({ key, label, hint }) => {
              const raw = data.axes![key];
              const v = typeof raw === "number" ? raw : null;
              return (
                <li key={key} className="rounded-xl border border-movApp-border bg-movApp-paper px-4 py-3 shadow-sm">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <span className="text-sm font-medium text-movApp-ink">{label}</span>
                    <span className="text-sm tabular-nums text-movApp-accent">{pct(v)}</span>
                  </div>
                  {hint && <p className="mt-1 text-xs text-movApp-muted">{hint}</p>}
                  {v !== null && (
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-movApp-border">
                      <div
                        className="h-full rounded-full bg-movApp-accent/90"
                        style={{ width: `${Math.round(v * 100)}%` }}
                      />
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
          <p className="mt-6 text-xs text-movApp-muted">
            Schema v{data.axes.schemaVersion} · {new Date(data.axes.computedAt).toLocaleString("pt-BR")}
          </p>
        </div>
      ) : (
        <div className="mt-14 rounded-2xl border border-dashed border-movApp-border bg-movApp-subtle/50 p-8 text-center">
          <p className="text-sm text-movApp-muted">
            Ainda não há eixos nesta conta. Complete a jornada inicial (página de entrada do produto), faça
            login ou cadastro e sincronize.
          </p>
          <Link href="/" className="mt-4 inline-block text-sm font-semibold text-movApp-accent hover:underline">
            Ir à jornada inicial
          </Link>
        </div>
      )}

      <div className="mt-12 border-t border-movApp-border pt-8">
        <Link href="/app/debug/onboarding" className="text-sm text-movApp-muted hover:text-movApp-accent">
          Validação técnica (debug) →
        </Link>
      </div>
    </div>
  );
}
