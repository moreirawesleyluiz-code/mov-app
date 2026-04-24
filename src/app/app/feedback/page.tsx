import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { submitExperienceFeedback } from "@/app/app/feedback/actions";
import { getEligibleSeMovFeedbackTargets } from "@/lib/se-mov-feedback-eligibility";

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function fmtDate(date: Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export default async function FeedbackPage({ searchParams }: Props) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) redirect("/login?callbackUrl=/app/feedback");

  const targets = await getEligibleSeMovFeedbackTargets(userId);
  const pendingTargets = targets.filter((target) => !target.hasSubmittedFeedback);
  const params = await searchParams;
  const success = params.success === "1";
  const error = typeof params.error === "string" ? params.error : null;

  return (
    <div className="mx-auto max-w-2xl pb-6">
      <div className="mb-5">
        <Link
          href="/app/eventos"
          className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-movApp-border bg-movApp-paper px-3 text-sm font-medium text-movApp-ink"
        >
          <span aria-hidden>←</span>
          Voltar para eventos
        </Link>
      </div>

      <h1 className="font-display text-3xl text-movApp-ink">Compartilhar minha experiência</h1>
      <p className="mt-2 text-sm leading-relaxed text-movApp-muted">
        Este formulário aparece apenas para participantes confirmados de eventos Se Mov concluídos.
      </p>

      {success ? (
        <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          Feedback enviado com sucesso. Obrigado por fortalecer a qualidade da comunidade MOV.
        </div>
      ) : null}
      {error ? (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      ) : null}

      {pendingTargets.length === 0 ? (
        <section className="mt-6 rounded-2xl border border-movApp-border bg-movApp-paper p-5 shadow-sm">
          <h2 className="font-display text-xl text-movApp-ink">Nenhum feedback pendente</h2>
          <p className="mt-2 text-sm leading-relaxed text-movApp-muted">
            No momento você não tem eventos Se Mov elegíveis para nova avaliação.
          </p>
        </section>
      ) : (
        <section className="mt-6 rounded-2xl border border-movApp-border bg-movApp-paper p-5 shadow-sm">
          <h2 className="font-display text-xl text-movApp-ink">Enviar avaliação</h2>
          <form action={submitExperienceFeedback} className="mt-4 space-y-4">
            <div>
              <label htmlFor="eventId" className="text-sm font-semibold text-movApp-ink">
                Evento Se Mov
              </label>
              <select
                id="eventId"
                name="eventId"
                required
                className="mt-1 h-10 w-full rounded-xl border border-movApp-border bg-white px-3 text-sm text-movApp-ink"
              >
                {pendingTargets.map((target) => (
                  <option key={target.eventId} value={target.eventId}>
                    {target.eventTitle} — {fmtDate(target.startsAt)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="rating" className="text-sm font-semibold text-movApp-ink">
                Nota da experiência
              </label>
              <select
                id="rating"
                name="rating"
                required
                defaultValue="5"
                className="mt-1 h-10 w-full rounded-xl border border-movApp-border bg-white px-3 text-sm text-movApp-ink"
              >
                <option value="5">5 - Excelente</option>
                <option value="4">4 - Muito boa</option>
                <option value="3">3 - Boa</option>
                <option value="2">2 - A melhorar</option>
                <option value="1">1 - Ruim</option>
              </select>
            </div>

            <fieldset>
              <legend className="text-sm font-semibold text-movApp-ink">Recomendaria essa experiência?</legend>
              <div className="mt-2 flex gap-4">
                <label className="inline-flex items-center gap-2 text-sm text-movApp-ink">
                  <input type="radio" name="wouldRecommend" value="yes" required className="h-4 w-4" />
                  Sim
                </label>
                <label className="inline-flex items-center gap-2 text-sm text-movApp-ink">
                  <input type="radio" name="wouldRecommend" value="no" required className="h-4 w-4" />
                  Não
                </label>
              </div>
            </fieldset>

            <div>
              <label htmlFor="comments" className="text-sm font-semibold text-movApp-ink">
                Como foi sua experiência?
              </label>
              <textarea
                id="comments"
                name="comments"
                required
                minLength={10}
                maxLength={2000}
                rows={6}
                className="mt-1 w-full rounded-xl border border-movApp-border bg-white px-3 py-2.5 text-sm text-movApp-ink"
                placeholder="Conte de forma objetiva o que funcionou bem e o que pode melhorar."
              />
            </div>

            <button
              type="submit"
              className="inline-flex h-10 items-center justify-center rounded-xl bg-movApp-accent px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-movApp-accentHover active:scale-[0.995]"
            >
              Enviar feedback
            </button>
          </form>
        </section>
      )}

      {targets.some((target) => target.hasSubmittedFeedback) ? (
        <section className="mt-6 rounded-2xl border border-movApp-border bg-movApp-paper p-5 shadow-sm">
          <h2 className="font-display text-xl text-movApp-ink">Feedback já registrado</h2>
          <ul className="mt-3 space-y-2 text-sm text-movApp-muted">
            {targets
              .filter((target) => target.hasSubmittedFeedback)
              .map((target) => (
                <li key={target.eventId} className="rounded-xl border border-movApp-border/70 bg-movApp-subtle/40 px-3 py-2">
                  {target.eventTitle} ({fmtDate(target.startsAt)})
                </li>
              ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
