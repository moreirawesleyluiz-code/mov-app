import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { ContaMenuRow } from "@/components/conta/conta-menu-row";
import { ContaSubpageHeader } from "@/components/conta/conta-subpage-header";

export default async function ContaRecursosPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/");

  return (
    <div className="px-1 sm:px-0">
      <ContaSubpageHeader backHref="/app/conta" title="Recursos" />
      <div className="space-y-3">
        <ContaMenuRow href="/app" label="Início" description="Se Mov, Speed Dating, MOV Essência" />
        <ContaMenuRow href="/app/experiencias" label="Speed Dating" description="Formatos e ingresso avulso" />
        <ContaMenuRow href="/app/comunidade" label="Comunidade" description="Como funciona o WhatsApp" />
        <ContaMenuRow href="/app/eventos" label="Eventos" description="Agenda do ecossistema" />
      </div>
    </div>
  );
}
