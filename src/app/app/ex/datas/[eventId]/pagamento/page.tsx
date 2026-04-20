import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ExperienciasBackButton } from "@/components/experiencias-back-button";
import { Button } from "@/components/ui/button";
import { formatDinnerTime, formatDinnerWeekdayDate } from "@/lib/dinner-format";
import { formatBRL } from "@/lib/planos-mov";
import { SP_DINNER_REGIONS, isValidRegionKey } from "@/lib/sp-regions";
import {
  getSpeedDatingEventById,
  speedDatingDatasListHrefForEventType,
  speedDatingVariationLabel,
} from "@/lib/speed-dating-public-events";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ eventId: string }>;
  searchParams: Promise<{ regionKey?: string }>;
};

export default async function SpeedDatingPagamentoPage({ params, searchParams }: Props) {
  const { eventId } = await params;
  const { regionKey } = await searchParams;

  if (!regionKey || !isValidRegionKey(regionKey)) {
    redirect(`/app/ex/datas/${eventId}/regiao`);
  }

  const ev = await getSpeedDatingEventById(eventId);
  if (!ev) notFound();

  const region = SP_DINNER_REGIONS.find((r) => r.id === regionKey);
  const regionLabel = region?.label ?? regionKey;
  const start = new Date(ev.startsAt);
  const variation = speedDatingVariationLabel(ev.type);

  return (
    <div className="mx-auto w-full max-w-lg pb-8">
      <ExperienciasBackButton fallbackHref={`/app/ex/datas/${eventId}/regiao`} />
      <div className="mb-6 mt-2 h-1 w-full overflow-hidden rounded-full bg-movApp-border">
        <div
          className="h-full w-full rounded-full bg-gradient-to-r from-movApp-accent via-orange-400 to-pink-500"
          role="progressbar"
          aria-valuenow={100}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>

      <h1 className="font-display text-2xl font-semibold leading-tight tracking-[-0.02em] text-movApp-ink md:text-3xl">
        Confirmação de pagamento
      </h1>

      <div className="mt-5 space-y-4 rounded-2xl border border-movApp-border bg-movApp-paper p-5 shadow-sm sm:mt-6">
        <div className="flex flex-col gap-1 border-b border-movApp-border/80 pb-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-movApp-muted">Tipo</p>
          <p className="text-sm font-medium text-movApp-ink">Speed Dating</p>
        </div>
        <div className="flex flex-col gap-1 border-b border-movApp-border/80 pb-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-movApp-muted">Experiência</p>
          <p className="text-base font-semibold text-movApp-ink">{variation}</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-movApp-muted">Data</p>
            <p className="mt-1 text-sm font-medium text-movApp-ink">{formatDinnerWeekdayDate(start)}</p>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-movApp-muted">Horário</p>
            <p className="mt-1 text-sm font-medium text-movApp-ink">{formatDinnerTime(start)}</p>
          </div>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-movApp-muted">Região</p>
          <p className="mt-1 text-sm font-medium text-movApp-ink">{regionLabel}</p>
        </div>
        <div className="flex items-baseline justify-between border-t border-movApp-border/80 pt-4">
          <p className="text-sm font-medium text-movApp-muted">Total</p>
          <p className="font-display text-2xl font-semibold tabular-nums text-movApp-gold">{formatBRL(ev.priceCents)}</p>
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-3">
        <Button type="button" disabled className="h-12 w-full text-base font-semibold" title="Integração de pagamento em breve">
          Pagar agora
        </Button>
        <Link
          href={speedDatingDatasListHrefForEventType(ev.type)}
          className="inline-flex h-11 w-full items-center justify-center rounded-xl border border-movApp-border bg-movApp-paper px-4 text-sm font-semibold text-movApp-ink transition hover:bg-movApp-subtle"
        >
          Escolher outra data
        </Link>
      </div>
    </div>
  );
}
