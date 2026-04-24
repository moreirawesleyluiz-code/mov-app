import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { submitSafetyReport } from "@/app/app/conta/seguranca/denuncia/actions";
import { ContaSubpageHeader } from "@/components/conta/conta-subpage-header";
import { prisma } from "@/lib/prisma";

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function fmtDate(date: Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

export default async function ContaDenunciaPage({ searchParams }: Props) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) redirect("/login?callbackUrl=/app/conta/seguranca/denuncia");

  const [registrations, params] = await Promise.all([
    prisma.eventRegistration.findMany({
      where: { userId, status: { not: "cancelled" } },
      select: {
        eventId: true,
        event: {
          select: { title: true, startsAt: true },
        },
      },
      orderBy: {
        event: {
          startsAt: "desc",
        },
      },
    }),
    searchParams,
  ]);

  const success = params.success === "1";
  const error = typeof params.error === "string" ? params.error : null;

  return (
    <div className="px-1 pb-5 sm:px-0">
      <ContaSubpageHeader backHref="/app/conta/seguranca" title="Denunciar má conduta" />

      <section className="rounded-2xl border border-movApp-border bg-movApp-paper p-5 shadow-sm">
        <h2 className="font-display text-xl text-movApp-ink">Segurança e confiança MOV</h2>
        <p className="mt-2 text-sm leading-relaxed text-movApp-muted">
          Use este canal para relatar comportamento inadequado, assédio, desrespeito ou qualquer risco à segurança.
          Toda denúncia fica vinculada ao seu login para tratamento responsável.
        </p>

        {success ? (
          <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            Denúncia registrada. Nossa equipe de confiança irá analisar com prioridade.
          </div>
        ) : null}
        {error ? (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        ) : null}

        <form action={submitSafetyReport} className="mt-5 space-y-4">
          <div>
            <label htmlFor="category" className="text-sm font-semibold text-movApp-ink">
              Categoria
            </label>
            <select
              id="category"
              name="category"
              required
              className="mt-1 h-10 w-full rounded-xl border border-movApp-border bg-white px-3 text-sm text-movApp-ink"
              defaultValue="comportamento_inadequado"
            >
              <option value="comportamento_inadequado">Comportamento inadequado</option>
              <option value="assedio">Assédio</option>
              <option value="desrespeito">Desrespeito</option>
              <option value="seguranca">Problema de segurança</option>
              <option value="outro">Outro</option>
            </select>
          </div>

          <div>
            <label htmlFor="eventId" className="text-sm font-semibold text-movApp-ink">
              Evento relacionado (opcional)
            </label>
            <select
              id="eventId"
              name="eventId"
              className="mt-1 h-10 w-full rounded-xl border border-movApp-border bg-white px-3 text-sm text-movApp-ink"
              defaultValue=""
            >
              <option value="">Não vincular evento</option>
              {registrations.map((registration) => (
                <option key={registration.eventId} value={registration.eventId}>
                  {registration.event.title} — {fmtDate(registration.event.startsAt)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="reportedPersonRef" className="text-sm font-semibold text-movApp-ink">
              Pessoa envolvida (opcional)
            </label>
            <input
              id="reportedPersonRef"
              name="reportedPersonRef"
              maxLength={180}
              className="mt-1 h-10 w-full rounded-xl border border-movApp-border bg-white px-3 text-sm text-movApp-ink"
              placeholder="Informe e-mail, identificador ou nome para referência"
            />
          </div>

          <div>
            <label htmlFor="description" className="text-sm font-semibold text-movApp-ink">
              Descrição do ocorrido
            </label>
            <textarea
              id="description"
              name="description"
              required
              minLength={20}
              maxLength={4000}
              rows={8}
              className="mt-1 w-full rounded-xl border border-movApp-border bg-white px-3 py-2.5 text-sm text-movApp-ink"
              placeholder="Descreva objetivamente o que aconteceu, quando aconteceu e qualquer detalhe relevante."
            />
          </div>

          <div>
            <label htmlFor="evidenceLinks" className="text-sm font-semibold text-movApp-ink">
              Links de evidência (opcional)
            </label>
            <textarea
              id="evidenceLinks"
              name="evidenceLinks"
              rows={3}
              maxLength={1200}
              className="mt-1 w-full rounded-xl border border-movApp-border bg-white px-3 py-2.5 text-sm text-movApp-ink"
              placeholder="Cole até 5 links (um por linha), ex.: https://..."
            />
            <p className="mt-1 text-xs text-movApp-muted">Aceita apenas URLs http/https.</p>
          </div>

          <button
            type="submit"
            className="inline-flex h-10 items-center justify-center rounded-xl bg-movApp-accent px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-movApp-accentHover active:scale-[0.995]"
          >
            Enviar denúncia
          </button>
        </form>
      </section>
    </div>
  );
}
