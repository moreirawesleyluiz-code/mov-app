import { redirect } from "next/navigation";

/** Compatibilidade: detalhe antigo redireciona para escolha de região. */
type Props = { params: Promise<{ eventId: string }> };

export default async function SpeedDatingDataDetailRedirect({ params }: Props) {
  const { eventId } = await params;
  redirect(`/app/ex/datas/${eventId}/regiao`);
}
