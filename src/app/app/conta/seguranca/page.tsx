import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { ContaSubpageHeader } from "@/components/conta/conta-subpage-header";
import { prisma } from "@/lib/prisma";

export default async function ContaSegurancaPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/");
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { email: true },
  });
  if (!user) redirect("/");

  const masked = "••••••••";

  return (
    <div className="px-1 sm:px-0">
      <ContaSubpageHeader backHref="/app/conta" title="Login e segurança" />

      <div className="space-y-3 rounded-2xl border border-movApp-border bg-movApp-paper p-1 shadow-sm ring-1 ring-movApp-border/60">
        <div className="flex items-center justify-between gap-3 rounded-xl px-4 py-3">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-movApp-muted">E-mail</p>
            <p className="mt-1 truncate text-sm text-movApp-ink">{user.email}</p>
          </div>
          <button
            type="button"
            disabled
            title="Alteração de e-mail em breve"
            className="shrink-0 rounded-lg px-2 py-1 text-xs font-semibold text-movApp-muted"
          >
            Modificar
          </button>
        </div>
        <div className="h-px bg-movApp-border/80" />
        <div className="flex items-center justify-between gap-3 rounded-xl px-4 py-3">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-movApp-muted">Senha</p>
            <p className="mt-1 font-mono text-sm text-movApp-ink">{masked}</p>
          </div>
          <Link
            href="/forgot-password"
            className="shrink-0 rounded-lg px-2 py-1 text-xs font-semibold text-movApp-accent hover:underline"
          >
            Modificar
          </Link>
        </div>
      </div>

      <p className="mt-4 text-xs leading-relaxed text-movApp-muted">
        A redefinição de senha usa o fluxo público de recuperação (envio de e-mail). O e-mail de login continua o mesmo
        até existir fluxo dedicado para alteração.
      </p>

      <button
        type="button"
        disabled
        title="Em breve — contacte o suporte MOV"
        className="mt-8 w-full rounded-2xl border border-red-200 bg-red-50/80 py-3.5 text-center text-sm font-semibold text-red-700 opacity-90"
      >
        Excluir minha conta
      </button>
      <p className="mt-2 text-center text-[10px] text-movApp-muted">Pedido de exclusão: disponível em breve.</p>
    </div>
  );
}
