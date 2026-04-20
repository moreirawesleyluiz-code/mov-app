import { notFound } from "next/navigation";
import { JantarRegionForm } from "@/components/jantar-region-form";
import { SP_DINNER_REGIONS } from "@/lib/sp-regions";
import { getSpeedDatingEventById, speedDatingDatasListHrefForEventType } from "@/lib/speed-dating-public-events";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ eventId: string }> };

export default async function SpeedDatingRegiaoPage({ params }: Props) {
  const { eventId } = await params;
  const event = await getSpeedDatingEventById(eventId);
  if (!event) notFound();

  return (
    <JantarRegionForm
      eventId={event.id}
      regions={SP_DINNER_REGIONS}
      backHref={speedDatingDatasListHrefForEventType(event.type)}
      headerTitle="Speed Dating"
      progressFraction={2 / 3}
      continueHrefBase={`/app/ex/datas/${event.id}/pagamento`}
    />
  );
}
