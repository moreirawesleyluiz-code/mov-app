import { DinnerSlotActions } from "@/components/dinner-slot-actions";
import { DinnerTypeIcon } from "@/components/dinner-type-icon";
import { formatDinnerTime, formatDinnerWeekdayDate } from "@/lib/dinner-format";

export type SeMovAgendaSlotEvent = {
  id: string;
  startsAt: Date;
};

type Reg = { eventId: string; status: string };

type Props = {
  events: SeMovAgendaSlotEvent[];
  registrations: Reg[];
  demoJantarFlow: boolean;
  /** Ex.: `mb-4 mt-10` (após o bloco “O que é o Se Mov”) ou `mb-4 mt-8` (aba Eventos). */
  datesHeadingClassName?: string;
};

/**
 * Lista de datas/cards/CTA idêntica à secção “Datas disponíveis” da agenda do Se Mov (`/app/agenda`).
 * Reutilizada na aba Eventos como espelho visual e comportamental.
 */
export function SeMovAgendaSlotsList({
  events,
  registrations,
  demoJantarFlow,
  datesHeadingClassName = "mb-4 mt-10",
}: Props) {
  const regMap = new Map(registrations.map((r) => [r.eventId, r.status]));

  return (
    <>
      <h2 className={`font-display text-xl text-movApp-ink ${datesHeadingClassName}`}>Datas disponíveis</h2>

      {demoJantarFlow ? (
        <p className="mb-4 rounded-xl border border-amber-200/80 bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-900">
          <strong className="font-semibold text-amber-950">Modo demonstração:</strong> você pode abrir o fluxo (região →
          preferências → resumo) mesmo com data já reservada, para revisar as telas.
        </p>
      ) : null}

      <ul className="flex flex-col gap-3">
        {events.length === 0 && (
          <li className="rounded-2xl border border-movApp-border bg-movApp-subtle/80 p-8 text-center text-sm text-movApp-muted">
            Nenhuma data disponível no momento. Volte em breve.
          </li>
        )}
        {events.map((ev, index) => {
          const registered = regMap.has(ev.id);
          const waitlist = regMap.get(ev.id) === "waitlist";
          const start = new Date(ev.startsAt);
          return (
            <li
              key={ev.id}
              className="flex items-center gap-3 rounded-2xl border border-movApp-border bg-movApp-paper p-4 shadow-sm"
            >
              <DinnerTypeIcon index={index} />
              <div className="min-w-0 flex-1">
                <p className="text-sm text-movApp-muted">Jantar</p>
                <p className="truncate text-base font-bold text-movApp-ink">{formatDinnerWeekdayDate(start)}</p>
                <p className="text-sm text-movApp-muted">{formatDinnerTime(start)}</p>
              </div>
              <DinnerSlotActions
                eventId={ev.id}
                registered={registered}
                waitlist={waitlist}
                demoFlow={demoJantarFlow}
              />
            </li>
          );
        })}
      </ul>
    </>
  );
}
