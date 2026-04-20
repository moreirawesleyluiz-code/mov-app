import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { ContaAvatar } from "@/components/conta/conta-avatar";
import { ContaMenuRow } from "@/components/conta/conta-menu-row";
import { ContaSairRow } from "@/components/conta/conta-sair-row";
import { ChevronRightIcon } from "@/components/conta/conta-icons";
import { parseAppProfileExtra, splitDisplayName } from "@/lib/app-profile-extra";
import { prisma } from "@/lib/prisma";

type ContaUserRow = {
  name: string | null;
  email: string;
  image: string | null;
  city: string | null;
  appProfileJson: string | null;
};

export default async function ContaPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/");
  const userId = session.user.id;

  let user: ContaUserRow | null = null;
  let eventsCount = 0;
  let sub: Awaited<ReturnType<typeof prisma.subscription.findUnique>> = null;
  let loadFailed = false;
  try {
    user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        name: true,
        email: true,
        image: true,
        city: true,
        appProfileJson: true,
      },
    });
    if (user) {
      const counts = await Promise.all([
        prisma.eventRegistration.count({
          where: { userId, status: { not: "cancelled" } },
        }),
        prisma.subscription.findUnique({ where: { userId } }),
      ]);
      eventsCount = counts[0];
      sub = counts[1];
    }
  } catch (err) {
    console.error("[MOV] ContaPage:", err);
    loadFailed = true;
  }
  if (loadFailed) redirect("/login?callbackUrl=/app/conta");
  if (!user) redirect("/");

  const extra = parseAppProfileExtra(user.appProfileJson);
  const split = splitDisplayName(user.name);
  const displayFirst = extra.firstName ?? split.first;
  const displayLast = extra.lastName ?? split.last;
  const headlineName = [displayFirst, displayLast].filter(Boolean).join(" ").trim() || user.name || "Perfil";

  return (
    <div className="px-1 sm:px-0">
      <div className="flex flex-col items-center pt-2">
        <ContaAvatar name={headlineName} imageUrl={user.image} size="xl" />
        <h1 className="mt-4 text-center font-display text-2xl tracking-tight text-movApp-ink sm:text-3xl">{headlineName}</h1>
        <Link
          href="/app/conta/editar"
          className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-movApp-accent hover:underline"
        >
          Editar perfil
          <ChevronRightIcon className="h-4 w-4" />
        </Link>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-movApp-border bg-movApp-paper p-4 text-center shadow-sm ring-1 ring-movApp-border/50">
          <p className="text-2xl font-semibold tabular-nums text-movApp-ink">{eventsCount}</p>
          <p className="mt-1 text-[11px] font-medium uppercase tracking-wide text-movApp-muted">Eventos</p>
        </div>
        <div className="rounded-2xl border border-movApp-border bg-movApp-paper p-4 text-center shadow-sm ring-1 ring-movApp-border/50">
          <p className="text-2xl font-semibold tabular-nums text-movApp-muted">—</p>
          <p className="mt-1 text-[11px] font-medium uppercase tracking-wide text-movApp-muted">Pessoas encontradas</p>
        </div>
      </div>
      <p className="mt-2 text-center text-[10px] text-movApp-muted">Indicador de pessoas: em breve no produto.</p>

      <div className="mt-8 space-y-3">
        <ContaMenuRow href="/app/conta/editar" label="Conta" description="Dados pessoais" />
        <ContaMenuRow
          href="/app/conta/assinatura"
          label="Assinatura e pagamentos"
          description={sub?.status === "active" ? "Se Mov ativa" : "Ver estado da assinatura"}
        />
        <ContaMenuRow href="/app/conta/seguranca" label="Login e segurança" description="E-mail e senha" />
      </div>

      <div className="mt-6">
        <ContaSairRow />
      </div>

      <p className="mt-8 text-center text-[11px] text-movApp-muted">
        E-mail: <span className="text-movApp-ink/90">{user.email}</span>
      </p>
    </div>
  );
}
