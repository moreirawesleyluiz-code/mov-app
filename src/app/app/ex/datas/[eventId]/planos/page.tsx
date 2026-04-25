import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { ExperienciasBackButton } from "@/components/experiencias-back-button";
import { SpeedDatingPagamentoPanel } from "@/components/speed-dating-pagamento-panel";
import { formatDinnerTime, formatDinnerWeekdayDate } from "@/lib/dinner-format";
import { formatBRL } from "@/lib/planos-mov";
import { SP_DINNER_REGIONS, isValidRegionKey } from "@/lib/sp-regions";
import {
  getSpeedDatingEventById,
  speedDatingDatasListHrefForEventType,
  speedDatingVariationLabel,
} from "@/lib/speed-dating-public-events";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ eventId: string }>;
  searchParams: Promise<{ regionKey?: string }>;
};

export default async function SpeedDatingPlanosPage({ params, searchParams }: Props) {
  const { eventId } = await params;
  const { regionKey } = await searchParams;

  if (!regionKey || !isValidRegionKey(regionKey)) {
    redirect(`/app/ex/datas/${eventId}/regiao`);
  }

  const ev = await getSpeedDatingEventById(eventId);
  if (!ev) notFound();

  const session = await auth();
  const userId = session?.user?.id;
  const existingReg = userId
    ? await prisma.eventRegistration.findUnique({
        where: { userId_eventId: { userId, eventId: ev.id } },
      })
    : null;
  const alreadyRegistered = existingReg?.status === "confirmed" || existingReg?.status === "waitlist";
  const asaasEnabled = Boolean(process.env.ASAAS_API_KEY?.trim());

  const region = SP_DINNER_REGIONS.find((r) => r.id === regionKey);
  const regionLabel = region?.label ?? regionKey;
  const start = new Date(ev.startsAt);
  const variation = speedDatingVariationLabel(ev.type);

  return (
    <div className="mx-auto w-full max-w-lg pb-8">
      <ExperienciasBackButton fallbackHref={`/app/ex/datas/${eventId}/pagamento?regionKey=${encodeURIComponent(regionKey)}`} />
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
        Pagamento
      </h1>
      <p className="mt-2 text-sm text-movApp-muted">
        Reveja o valor, preencha o CPF/CNPJ do pagador (exigido pelo Asaas) e gere o Pix. O ambiente (sandbox vs
        produção) depende da chave definida em <code className="text-xs">ASAAS_API_KEY</code>.
      </p>

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
          <p className="text-sm font-medium text-movApp-muted">Total a pagar</p>
          <p className="font-display text-2xl font-semibold tabular-nums text-movApp-gold">{formatBRL(ev.priceCents)}</p>
        </div>
      </div>

      {ev.priceCents > 0 && !asaasEnabled ? (
        <p
          className="mt-4 rounded-lg border border-amber-200 bg-amber-50/80 p-3 text-sm text-amber-950"
          role="status"
        >
          O ambiente ainda não tem a chave Asaas. Define <code className="rounded bg-amber-100 px-1">ASAAS_API_KEY</code>{" "}
          no <code className="rounded bg-amber-100 px-1">.env</code> (sandbox ou produção) para ativar o Pix.
        </p>
      ) : null}

      <div className="mt-6">
        <SpeedDatingPagamentoPanel
          eventId={ev.id}
          regionKey={regionKey}
          priceCents={ev.priceCents}
          asaasEnabled={asaasEnabled}
          alreadyRegistered={Boolean(alreadyRegistered)}
          listHref={speedDatingDatasListHrefForEventType(ev.type)}
        />
      </div>
    </div>
  );
}
