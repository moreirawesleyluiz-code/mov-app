import Link from "next/link";
import { redirect } from "next/navigation";
import { buildMovJourney } from "@/lib/mov-journey";
import { loadUserOnboardingProfile } from "@/lib/load-user-onboarding-profile";

function stepIcon(state: "done" | "active" | "pending" | "soon") {
  if (state === "done") return "✓";
  if (state === "active") return "●";
  if (state === "soon") return "◌";
  return "○";
}

export default async function CompatibilidadePage() {
  const data = await loadUserOnboardingProfile();
  if (!data) redirect("/login?callbackUrl=/app/compatibilidade");

  const journey = buildMovJourney(data);

  return (
    <div>
      <p className="text-sm uppercase tracking-[0.15em] text-movApp-accent">Sua jornada</p>
      <h1 className="mt-2 font-display text-3xl text-movApp-ink md:text-4xl">Compatibilidade e mesa</h1>
      <p className="mt-3 max-w-2xl text-movApp-muted">{journey.subline}</p>

      <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-movApp-border bg-movApp-subtle px-4 py-2 text-xs text-movApp-ink">
        <span className="text-movApp-muted">Estado atual:</span>
        <span className="font-medium text-movApp-accent">{journey.phaseLabel}</span>
      </div>

      <div className="mt-12 max-w-2xl">
        <h2 className="font-display text-lg text-movApp-ink">Linha do tempo</h2>
        <p className="mt-1 text-sm text-movApp-muted">
          Transparência sobre o que já aconteceu e o que ainda é placeholder até o matching e os convites
          estarem ligados.
        </p>
        <ol className="relative mt-8 border-l border-movApp-border pl-8">
          {journey.steps.map((step, i) => (
            <li key={step.id} className="mb-10 last:mb-0">
              <span
                className="absolute -left-[9px] flex h-[18px] w-[18px] items-center justify-center rounded-full border border-movApp-border bg-movApp-paper text-[10px] text-movApp-ink"
                aria-hidden
              >
                {stepIcon(step.state)}
              </span>
              <p className="text-xs font-semibold uppercase tracking-wide text-movApp-muted">
                {step.state === "done" && "Concluído"}
                {step.state === "active" && "Em curso"}
                {step.state === "pending" && "Pendente"}
                {step.state === "soon" && "Em breve"}
              </p>
              <h3 className="mt-1 font-display text-lg text-movApp-ink">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-movApp-muted">{step.body}</p>
              {i === journey.steps.length - 1 && (
                <div className="mt-4 rounded-xl border border-dashed border-movApp-border/80 bg-movApp-subtle/80 p-4 text-xs text-movApp-muted">
                  <strong className="text-movApp-ink">Recomendação futura:</strong> aqui poderão aparecer
                  sugestões de restaurante e composição da mesa quando o produto ligar o motor de matching.
                </div>
              )}
            </li>
          ))}
        </ol>
      </div>

      <div className="mt-12 flex flex-wrap gap-3">
        <Link
          href="/app/perfil-mov"
          className="inline-flex h-12 items-center justify-center rounded-xl bg-movApp-accent px-5 text-sm font-medium text-white transition hover:bg-movApp-accentHover"
        >
          Ver eixos e cidade no Perfil MOV
        </Link>
        <Link
          href="/app"
          className="inline-flex h-12 items-center justify-center rounded-xl border border-movApp-border px-5 text-sm font-medium text-movApp-ink transition hover:bg-movApp-subtle"
        >
          Início do app
        </Link>
        {journey.secondaryCta && (
          <Link
            href={journey.secondaryCta.href}
            className="inline-flex h-12 items-center justify-center rounded-xl border border-movApp-border px-5 text-sm text-movApp-muted transition hover:text-movApp-ink"
          >
            {journey.secondaryCta.label}
          </Link>
        )}
      </div>
    </div>
  );
}
