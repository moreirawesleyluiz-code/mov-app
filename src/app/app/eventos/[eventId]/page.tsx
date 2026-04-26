import { redirect } from "next/navigation";

type Props = { params: Promise<{ eventId: string }> };

export default async function AppEventoTemporaryPage({ params }: Props) {
  const { eventId } = await params;
  redirect(`/app/agenda/${eventId}/regiao`);
}
