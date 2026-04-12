import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { ContaSubpageHeader } from "@/components/conta/conta-subpage-header";
import { prisma } from "@/lib/prisma";

export default async function ContaAssinaturaPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/");
  const sub = await prisma.subscription.findUnique({ where: { userId: session.user.id } });
  const active = sub?.status === "active";

  return (
    <div className="px-1 sm:px-0">
      <ContaSubpageHeader backHref="/app/conta" title="Assinatura e pagamentos" />
      <div className="rounded-2xl border border-movApp-border bg-movApp-paper p-6 shadow-sm ring-1 ring-movApp-border/60">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-movApp-muted">Se Mov</p>
        <p className="mt-2 font-display text-xl text-movApp-ink">{active ? "Ativa" : "Não ativa"}</p>
        <p className="mt-3 text-sm leading-relaxed text-movApp-muted">
          A assinatura liberta o fluxo do jantar curado e da comunidade conforme o estado em{" "}
          <Link href="/app" className="font-medium text-movApp-accent underline underline-offset-2">
            Início
          </Link>
          .
        </p>
        {active ? (
          <Link
            href="/app/planos"
            className="mt-6 inline-flex h-11 min-h-[44px] items-center justify-center rounded-xl border border-movApp-border bg-movApp-subtle px-4 text-sm font-semibold text-movApp-ink hover:bg-movApp-border/20"
          >
            Ver planos
          </Link>
        ) : null}
      </div>
      <p className="mt-8 text-center text-xs text-movApp-muted">
        Pagamento com cartão integrado aqui: próxima etapa do produto.
      </p>
    </div>
  );
}
