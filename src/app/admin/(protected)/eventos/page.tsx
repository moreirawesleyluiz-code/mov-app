import { deleteAdminEvent, setEventPublished, upsertAdminEvent } from "@/app/admin/event-actions";
import { AdminDeleteEventButton } from "@/components/admin/admin-delete-event-button";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type ProductLine = "SE_MOV" | "SPEED_DATING" | "OUTROS";

function classifyEvent(event: { memberOnly: boolean; type: string }): ProductLine {
  if (event.memberOnly) return "SE_MOV";
  if (event.type === "CLASSICO" || event.type === "SENSORIAL" || event.type === "EXCLUSIVO") return "SPEED_DATING";
  return "OUTROS";
}

function formatDateBr(date: Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function formatTime24(date: Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

const TYPE_LABEL: Record<string, string> = {
  SE_MOV_JANTAR: "Se Mov — Jantar",
  SE_MOV_CAFE: "Se Mov — Café",
  SE_MOV_EXODO: "Se Mov — Êxodo",
  CLASSICO: "Speed Dating — Clássico",
  SENSORIAL: "Speed Dating — Sensorial",
  EXCLUSIVO: "Speed Dating — Exclusivo",
};

export default async function AdminEventosPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string; success?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const error = resolvedSearchParams?.error;
  const success = resolvedSearchParams?.success;
  const events = await prisma.event.findMany({
    orderBy: [{ startsAt: "asc" }, { createdAt: "desc" }],
  });

  const groups = {
    SE_MOV: events.filter((e) => classifyEvent(e) === "SE_MOV"),
    SPEED_DATING: events.filter((e) => classifyEvent(e) === "SPEED_DATING"),
    OUTROS: events.filter((e) => classifyEvent(e) === "OUTROS"),
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-semibold text-movApp-ink">Eventos</h1>
        <p className="mt-1 text-sm text-movApp-muted">
          Crie, edite e publique eventos por linha de produto. O app reflete automaticamente os eventos ativos. Se Mov
          aparece em <span className="font-medium text-movApp-ink">/app/agenda</span>; Speed Dating e o espelho geral
          em <span className="font-medium text-movApp-ink">/app/eventos</span>.
        </p>
      </div>

      <section className="rounded-2xl border border-movApp-border bg-movApp-paper p-5 shadow-sm">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-movApp-muted">Novo evento</h2>
        {error === "slug-duplicado" ? (
          <p className="mt-3 rounded-lg border border-red-200 bg-red-50/80 p-3 text-sm text-red-800">
            Já existe um evento com este slug. Use outro slug.
          </p>
        ) : null}
        {error === "evento-com-dependencias" ? (
          <p className="mt-3 rounded-lg border border-red-200 bg-red-50/80 p-3 text-sm text-red-800">
            Não foi possível excluir: o evento possui inscrições, pagamentos ou outros vínculos.
          </p>
        ) : null}
        {error === "evento-nao-encontrado" ? (
          <p className="mt-3 rounded-lg border border-red-200 bg-red-50/80 p-3 text-sm text-red-800">
            Evento não encontrado para exclusão.
          </p>
        ) : null}
        {success === "evento-excluido" ? (
          <p className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50/80 p-3 text-sm text-emerald-800">
            Evento excluído com sucesso.
          </p>
        ) : null}
        <form action={upsertAdminEvent} className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <label className="text-xs font-medium text-movApp-muted">
            Nome
            <input
              name="title"
              required
              className="mt-1 h-10 w-full rounded-lg border border-movApp-border bg-white px-3 text-sm"
            />
          </label>
          <label className="text-xs font-medium text-movApp-muted">
            Slug
            <input
              name="slug"
              required
              placeholder="se-mov-cafe-maio"
              className="mt-1 h-10 w-full rounded-lg border border-movApp-border bg-white px-3 text-sm"
            />
          </label>
          <label className="text-xs font-medium text-movApp-muted">
            Linha
            <select name="productLine" defaultValue="SE_MOV" className="mt-1 h-10 w-full rounded-lg border border-movApp-border bg-white px-3 text-sm">
              <option value="SE_MOV">Se Mov</option>
              <option value="SPEED_DATING">Speed Dating</option>
            </select>
          </label>
          <label className="text-xs font-medium text-movApp-muted">
            Tipo da experiência
            <select name="eventType" defaultValue="SE_MOV_JANTAR" className="mt-1 h-10 w-full rounded-lg border border-movApp-border bg-white px-3 text-sm">
              <optgroup label="Se Mov">
                <option value="SE_MOV_JANTAR">Jantar</option>
                <option value="SE_MOV_CAFE">Café</option>
                <option value="SE_MOV_EXODO">Êxodo</option>
              </optgroup>
              <optgroup label="Speed Dating">
                <option value="CLASSICO">Clássico</option>
                <option value="SENSORIAL">Sensorial</option>
                <option value="EXCLUSIVO">Exclusivo</option>
              </optgroup>
            </select>
          </label>
          <label className="text-xs font-medium text-movApp-muted">
            Data (Brasil)
            <input
              type="text"
              name="startDateBr"
              required
              inputMode="numeric"
              placeholder="dd/mm/aaaa"
              pattern="\d{2}/\d{2}/\d{4}"
              maxLength={10}
              className="mt-1 h-10 w-full rounded-lg border border-movApp-border bg-white px-3 text-sm"
            />
          </label>
          <label className="text-xs font-medium text-movApp-muted">
            Hora (24h)
            <input
              type="text"
              name="startTime24"
              required
              inputMode="numeric"
              placeholder="HH:mm"
              pattern="([01]\d|2[0-3]):[0-5]\d"
              maxLength={5}
              className="mt-1 h-10 w-full rounded-lg border border-movApp-border bg-white px-3 text-sm"
            />
          </label>
          <label className="text-xs font-medium text-movApp-muted">
            Local (nome)
            <input
              name="venueName"
              className="mt-1 h-10 w-full rounded-lg border border-movApp-border bg-white px-3 text-sm"
            />
          </label>
          <label className="text-xs font-medium text-movApp-muted">
            Endereço
            <input
              name="venueAddress"
              className="mt-1 h-10 w-full rounded-lg border border-movApp-border bg-white px-3 text-sm"
            />
          </label>
          <label className="text-xs font-medium text-movApp-muted">
            Capacidade
            <input
              type="number"
              min={0}
              name="capacity"
              className="mt-1 h-10 w-full rounded-lg border border-movApp-border bg-white px-3 text-sm"
            />
          </label>
          <label className="text-xs font-medium text-movApp-muted">
            Preço (centavos)
            <input
              type="number"
              min={0}
              name="priceCents"
              defaultValue={0}
              className="mt-1 h-10 w-full rounded-lg border border-movApp-border bg-white px-3 text-sm"
            />
          </label>
          <label className="sm:col-span-2 lg:col-span-3 text-xs font-medium text-movApp-muted">
            Descrição curta
            <textarea
              name="description"
              rows={2}
              className="mt-1 w-full rounded-lg border border-movApp-border bg-white px-3 py-2 text-sm"
            />
          </label>
          <label className="flex min-h-10 items-end gap-2 pb-1 text-xs font-medium text-movApp-muted sm:col-span-2 lg:col-span-3">
            <input type="hidden" name="published" value="off" />
            <input type="checkbox" name="published" value="on" defaultChecked className="rounded" />
            Mostrar no app (ativo/publicado)
          </label>
          <div className="sm:col-span-2 lg:col-span-3">
            <button type="submit" className="rounded-lg bg-movApp-accent px-4 py-2 text-sm font-medium text-white">
              Criar evento
            </button>
          </div>
        </form>
      </section>

      {(["SE_MOV", "SPEED_DATING", "OUTROS"] as const).map((group) => (
        <section key={group} className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-movApp-muted">
            {group === "SE_MOV" ? "Se Mov" : group === "SPEED_DATING" ? "Speed Dating" : "Outros"}
            {" "}({groups[group].length})
          </h2>
          {groups[group].length === 0 ? (
            <p className="rounded-xl border border-movApp-border/70 bg-movApp-paper/70 px-4 py-3 text-sm text-movApp-muted">
              Sem eventos nesta linha.
            </p>
          ) : (
            <div className="space-y-3">
              {groups[group].map((event) => (
                <article key={event.id} className="rounded-2xl border border-movApp-border bg-white p-4 shadow-sm">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="font-display text-base font-semibold text-movApp-ink">{event.title}</h3>
                      <p className="text-xs text-movApp-muted">
                        {TYPE_LABEL[event.type] ?? event.type} · {new Date(event.startsAt).toLocaleString("pt-BR")} ·{" "}
                        {event.published ? "ativo" : "inativo"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <form
                        action={async () => {
                          "use server";
                          await setEventPublished(event.id, !event.published);
                        }}
                      >
                        <button
                          type="submit"
                          className="rounded-lg border border-movApp-border px-3 py-1.5 text-xs font-medium text-movApp-ink"
                        >
                          {event.published ? "Desativar" : "Ativar"}
                        </button>
                      </form>
                      <AdminDeleteEventButton eventId={event.id} />
                    </div>
                  </div>

                  <details className="mt-3 rounded-xl border border-movApp-border/70 bg-movApp-subtle/35 p-3">
                    <summary className="cursor-pointer list-none text-sm font-semibold text-movApp-ink [&::-webkit-details-marker]:hidden">
                      Editar evento
                    </summary>
                    <form action={upsertAdminEvent} className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      <input type="hidden" name="id" value={event.id} />
                      <label className="text-xs font-medium text-movApp-muted">
                        Nome
                        <input
                          name="title"
                          required
                          defaultValue={event.title}
                          className="mt-1 h-10 w-full rounded-lg border border-movApp-border bg-white px-3 text-sm"
                        />
                      </label>
                      <label className="text-xs font-medium text-movApp-muted">
                        Slug
                        <input
                          name="slug"
                          required
                          defaultValue={event.slug}
                          className="mt-1 h-10 w-full rounded-lg border border-movApp-border bg-white px-3 text-sm"
                        />
                      </label>
                      <label className="text-xs font-medium text-movApp-muted">
                        Linha
                        <select
                          name="productLine"
                          defaultValue={event.memberOnly ? "SE_MOV" : "SPEED_DATING"}
                          className="mt-1 h-10 w-full rounded-lg border border-movApp-border bg-white px-3 text-sm"
                        >
                          <option value="SE_MOV">Se Mov</option>
                          <option value="SPEED_DATING">Speed Dating</option>
                        </select>
                      </label>
                      <label className="text-xs font-medium text-movApp-muted">
                        Tipo da experiência
                        <select name="eventType" defaultValue={event.type} className="mt-1 h-10 w-full rounded-lg border border-movApp-border bg-white px-3 text-sm">
                          <optgroup label="Se Mov">
                            <option value="SE_MOV_JANTAR">Jantar</option>
                            <option value="SE_MOV_CAFE">Café</option>
                            <option value="SE_MOV_EXODO">Êxodo</option>
                          </optgroup>
                          <optgroup label="Speed Dating">
                            <option value="CLASSICO">Clássico</option>
                            <option value="SENSORIAL">Sensorial</option>
                            <option value="EXCLUSIVO">Exclusivo</option>
                          </optgroup>
                        </select>
                      </label>
                      <label className="text-xs font-medium text-movApp-muted">
                        Data (Brasil)
                        <input
                          type="text"
                          name="startDateBr"
                          required
                          inputMode="numeric"
                          placeholder="dd/mm/aaaa"
                          pattern="\d{2}/\d{2}/\d{4}"
                          maxLength={10}
                          defaultValue={formatDateBr(new Date(event.startsAt))}
                          className="mt-1 h-10 w-full rounded-lg border border-movApp-border bg-white px-3 text-sm"
                        />
                      </label>
                      <label className="text-xs font-medium text-movApp-muted">
                        Hora (24h)
                        <input
                          type="text"
                          name="startTime24"
                          required
                          inputMode="numeric"
                          placeholder="HH:mm"
                          pattern="([01]\d|2[0-3]):[0-5]\d"
                          maxLength={5}
                          defaultValue={formatTime24(new Date(event.startsAt))}
                          className="mt-1 h-10 w-full rounded-lg border border-movApp-border bg-white px-3 text-sm"
                        />
                      </label>
                      <label className="text-xs font-medium text-movApp-muted">
                        Local
                        <input
                          name="venueName"
                          defaultValue={event.venueName ?? ""}
                          className="mt-1 h-10 w-full rounded-lg border border-movApp-border bg-white px-3 text-sm"
                        />
                      </label>
                      <label className="text-xs font-medium text-movApp-muted">
                        Endereço
                        <input
                          name="venueAddress"
                          defaultValue={event.venueAddress ?? ""}
                          className="mt-1 h-10 w-full rounded-lg border border-movApp-border bg-white px-3 text-sm"
                        />
                      </label>
                      <label className="text-xs font-medium text-movApp-muted">
                        Capacidade
                        <input
                          type="number"
                          min={0}
                          name="capacity"
                          defaultValue={event.capacity ?? ""}
                          className="mt-1 h-10 w-full rounded-lg border border-movApp-border bg-white px-3 text-sm"
                        />
                      </label>
                      <label className="text-xs font-medium text-movApp-muted">
                        Preço (centavos)
                        <input
                          type="number"
                          min={0}
                          name="priceCents"
                          defaultValue={event.priceCents}
                          className="mt-1 h-10 w-full rounded-lg border border-movApp-border bg-white px-3 text-sm"
                        />
                      </label>
                      <label className="sm:col-span-2 lg:col-span-3 text-xs font-medium text-movApp-muted">
                        Descrição curta
                        <textarea
                          name="description"
                          defaultValue={event.description ?? ""}
                          rows={2}
                          className="mt-1 w-full rounded-lg border border-movApp-border bg-white px-3 py-2 text-sm"
                        />
                      </label>
                      <label className="flex min-h-10 items-end gap-2 pb-1 text-xs font-medium text-movApp-muted sm:col-span-2 lg:col-span-3">
                        <input type="hidden" name="published" value="off" />
                        <input type="checkbox" name="published" value="on" defaultChecked={event.published} className="rounded" />
                        Mostrar no app (ativo/publicado)
                      </label>
                      <div className="sm:col-span-2 lg:col-span-3">
                        <button type="submit" className="rounded-lg bg-movApp-accent px-4 py-2 text-sm font-medium text-white">
                          Guardar alterações
                        </button>
                      </div>
                    </form>
                  </details>
                </article>
              ))}
            </div>
          )}
        </section>
      ))}
    </div>
  );
}
