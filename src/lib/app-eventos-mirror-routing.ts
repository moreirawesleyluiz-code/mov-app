import { deriveSeMovEventKind, seMovEventKindLabel } from "@/lib/se-mov-event-kind";
import { speedDatingVariationLabel } from "@/lib/speed-dating-public-events";

export type AppEventosOrigin = "SE_MOV" | "SPEED_DATING" | "MOV_ESSENCIA" | "COMUNIDADE";

/** Nome exibido no card — alinhado a agenda Se Mov e a `SpeedDatingDatasList` (não o título cru do admin). */
export function appEventosCardDisplayName(
  origin: AppEventosOrigin,
  event: { type: string; title: string; slug: string },
): string {
  if (origin === "SE_MOV") return seMovEventKindLabel(deriveSeMovEventKind(event));
  if (origin === "SPEED_DATING") return speedDatingVariationLabel(event.type);
  return event.title;
}

/**
 * Destino do clique no card de `/app/eventos`.
 * Speed Dating: mesma 1.ª etapa do fluxo público (`/app/ex/datas/[id]/regiao`).
 * Se Mov: mesma entrada da agenda (`/app/agenda/[id]/regiao`).
 * Demais: página espelho/preview (evita 404) até existir rota dedicada.
 */
export function appEventosCardDestination(origin: AppEventosOrigin, eventId: string): string {
  if (origin === "SPEED_DATING") return `/app/ex/datas/${eventId}/regiao`;
  if (origin === "SE_MOV") return `/app/eventos/${eventId}`;
  return `/app/eventos/${eventId}`;
}
