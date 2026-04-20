import { SpeedDatingDatasList } from "@/components/speed-dating-datas-list";
import { getSpeedDatingUpcomingEventsUniqueByDay } from "@/lib/speed-dating-public-events";

export const dynamic = "force-dynamic";

export default async function SpeedDatingSensorialDatasPage() {
  const events = await getSpeedDatingUpcomingEventsUniqueByDay({ types: ["SENSORIAL"] });

  return <SpeedDatingDatasList events={events} fallbackHref="/app/ex" />;
}
