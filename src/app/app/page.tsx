import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AgendaEntryFromInicio } from "@/components/agenda-entry-from-inicio";
import { MovAppHomeMovEssencia } from "@/components/mov-app-home-essencia";
import { MovAppHomeHero, MovAppHomeSpeedDating } from "@/components/mov-app-home";
import { Button } from "@/components/ui/button";
import { loadUserOnboardingProfile } from "@/lib/load-user-onboarding-profile";
import { prisma } from "@/lib/prisma";
import { isSeMovDemoActive } from "@/lib/se-mov-demo";
import { activateSeMov } from "./actions";

export default async function AppHomePage() {
  const session = await auth();
  const data = await loadUserOnboardingProfile();
  if (!data) {
    redirect("/login?callbackUrl=/app");
  }

  const userId = session?.user?.id;
  const sub = userId
    ? await prisma.subscription.findUnique({ where: { userId } })
    : null;

  const demoActive = isSeMovDemoActive(await cookies());
  const isSubscriber = sub?.status === "active" || demoActive;

  const firstName = session?.user?.name?.split(" ")[0];
  const hasAnswers = data.answerCount > 0;
  const hasAxes = data.axes !== null;

  return (
    <main
      id="mov-app-inicio"
      className="mx-auto w-full max-w-3xl space-y-8 pb-4 font-sans text-movApp-ink sm:space-y-10 sm:pb-6"
    >
      <MovAppHomeHero firstName={firstName} hasAnswers={hasAnswers} hasAxes={hasAxes} />

      <section className="border-t border-movApp-border/80 pt-8 sm:pt-10">
        <div className="rounded-2xl border border-movApp-border bg-movApp-paper p-6 shadow-sm sm:p-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-movApp-muted">Assinatura</p>
          <h2 className="mt-2 font-display text-xl leading-tight tracking-[-0.02em] text-movApp-ink sm:text-[1.35rem]">
            Se Mov
          </h2>
          <p className="mt-3 max-w-2xl border-l-2 border-movApp-gold/40 pl-4 text-[13px] leading-relaxed text-movApp-muted sm:text-sm">
            <strong className="font-medium text-movApp-ink">Se Mov</strong> é a assinatura para a{" "}
            <strong className="font-medium text-movApp-ink">comunidade e o jantar curado</strong> (você escolhe data,
            região e preferências na agenda). Isso é <strong className="font-medium text-movApp-ink">diferente</strong> do{" "}
            <strong className="font-medium text-movApp-ink">Speed Dating</strong> com ingresso avulso — acesse pelo botão{" "}
            <strong className="font-medium text-movApp-ink">Speed Dating</strong> mais abaixo nesta página.
          </p>
          <p className="mt-4 text-sm leading-relaxed text-movApp-muted">
            Mensalidade com referência de R$ 39,90/mês no plano comercial. Com a assinatura ativa, o próximo passo é
            percorrer o jantar em etapas: data, região, preferências e confirmação.
          </p>
          {isSubscriber ? (
            <div className="mt-6 space-y-3">
              <p className="text-sm font-medium text-movApp-success">
                {demoActive && sub?.status !== "active" ? "Modo demo ativo" : "Assinatura ativa"}
              </p>
              <div className="flex w-full justify-stretch sm:justify-start">
                <AgendaEntryFromInicio
                  href="/app/agenda"
                  className="inline-flex h-12 w-full min-h-[48px] items-center justify-center rounded-xl bg-movApp-accent px-5 text-center text-sm font-semibold text-white shadow-sm transition hover:bg-movApp-accentHover active:scale-[0.99] sm:w-auto sm:min-w-[15rem]"
                >
                  Ir para o jantar — escolher data
                </AgendaEntryFromInicio>
              </div>
            </div>
          ) : (
            <form action={activateSeMov} className="mt-6 flex w-full flex-col sm:block">
              <Button type="submit" className="h-12 min-h-[48px] w-full px-6 sm:w-auto sm:min-w-[15rem]">
                Ativar Se Mov — modo demonstração
              </Button>
            </form>
          )}
        </div>
      </section>

      <div className="border-t border-movApp-border/80 pt-8 sm:pt-10">
        <MovAppHomeSpeedDating />
      </div>

      <div className="border-t border-movApp-border/80 pt-8 sm:pt-10">
        <MovAppHomeMovEssencia />
      </div>

      <div className="pt-1">
        <div className="mx-auto w-full max-w-lg rounded-xl border border-dashed border-movApp-border/90 bg-movApp-subtle/80 px-4 py-4 text-center sm:px-5 sm:py-5">
          <p className="text-sm leading-relaxed text-movApp-muted">
            Pagamento com cartão poderá ser integrado aqui em uma próxima etapa.
          </p>
          {!isSubscriber && (
            <p className="mt-2 text-xs leading-relaxed text-movApp-muted/90">
              Por enquanto, &quot;Ativar Se Mov — modo demonstração&quot; libera o fluxo para você testar o
              produto.
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
