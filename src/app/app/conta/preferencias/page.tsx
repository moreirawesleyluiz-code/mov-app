import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { ContaMenuRow } from "@/components/conta/conta-menu-row";
import { ContaSubpageHeader } from "@/components/conta/conta-subpage-header";

export default async function ContaPreferenciasPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/");

  return (
    <div className="px-1 sm:px-0">
      <ContaSubpageHeader backHref="/app/conta" title="Preferências" />
      <p className="mb-6 text-sm leading-relaxed text-movApp-muted">
        Preferências de jornada e de matching ligam-se às áreas já existentes no app.
      </p>
      <div className="space-y-3">
        <ContaMenuRow href="/app/perfil-mov" label="Perfil MOV" description="Eixos e jornada" />
        <ContaMenuRow href="/app/compatibilidade" label="Compatibilidade" description="Preferências de matching" />
      </div>
      <p className="mt-8 text-center text-xs text-movApp-muted">
        <Link href="/app/conta" className="font-medium text-movApp-accent hover:underline">
          Voltar à conta
        </Link>
      </p>
    </div>
  );
}
