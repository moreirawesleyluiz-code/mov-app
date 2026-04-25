import type { Session } from "next-auth";
import Link from "next/link";
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

/** Sessão + Prisma: sempre dinâmico; evita cache RSC inconsistente com JWT. */
export const dynamic = "force-dynamic";

export default async function AppHomePage() {
  let session: Session | null;
  try {
    session = await auth();
  } catch (err) {
    console.error("[MOV] AppHomePage auth:", err);
    redirect("/login?callbackUrl=/app");
  }

  const userId = session?.user?.id;
  if (!userId || typeof userId !== "string" || userId.trim() === "") {
    redirect("/login?callbackUrl=/app");
  }

  const data = await loadUserOnboardingProfile();
  if (!data) {
    redirect("/login?callbackUrl=/app");
  }

  let sub: Awaited<ReturnType<typeof prisma.subscription.findUnique>> = null;
  let subscriptionQueryFailed = false;
  try {
    sub = await prisma.subscription.findUnique({ where: { userId } });
  } catch (err) {
    console.error("[MOV] AppHomePage subscription:", err);
    subscriptionQueryFailed = true;
  }
  if (subscriptionQueryFailed) {
    redirect("/login?callbackUrl=/app");
  }

  const demoActive = isSeMovDemoActive(await cookies());
  const isSubscriber = sub?.status === "active" || demoActive;

  const firstName = session?.user?.name?.split(" ")[0];

  return (
    <main
      id="mov-app-inicio"
      className="mx-auto w-full max-w-3xl space-y-8 pb-4 font-sans text-movApp-ink sm:space-y-10 sm:pb-6"
    >
      <MovAppHomeHero firstName={firstName} />

      <section className="border-t border-movApp-border/80 pt-8 sm:pt-10">
        <div className="rounded-2xl border border-movApp-border bg-movApp-paper p-6 shadow-sm sm:p-8">
          <h2 className="font-display text-xl leading-tight tracking-[-0.02em] text-movApp-ink sm:text-[1.35rem]">
            Se Mov
          </h2>
          <p className="mt-4 max-w-2xl text-balance font-display text-[1.2rem] leading-[1.25] tracking-[-0.02em] text-movApp-ink sm:text-[1.35rem]">
            Para ter amigos, seja um primeiro.
          </p>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-movApp-muted sm:text-[15px]">
            Você escolhe sua disponibilidade e a MOV conecta você a novas amizades.
          </p>
          {isSubscriber ? (
            <div className="mt-8">
              <div className="flex w-full justify-stretch sm:justify-start">
                <AgendaEntryFromInicio
                  href="/app/agenda"
                  className="inline-flex h-12 w-full min-h-[48px] items-center justify-center rounded-xl bg-movApp-accent px-5 text-center text-sm font-semibold text-white shadow-sm transition hover:bg-movApp-accentHover active:scale-[0.99] sm:w-auto sm:min-w-[15rem]"
                >
                  Escolha sua Experiência
                </AgendaEntryFromInicio>
              </div>
            </div>
          ) : (
            <div className="mt-8 flex w-full flex-col sm:block">
              <Link
                href="/app/eventos"
                className="inline-flex h-12 min-h-[48px] w-full items-center justify-center rounded-xl bg-movApp-accent px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-movApp-accentHover sm:w-auto sm:min-w-[15rem]"
              >
                Ver planos do Se Mov
              </Link>
            </div>
          )}
        </div>
      </section>

      <div className="border-t border-movApp-border/80 pt-8 sm:pt-10">
        <MovAppHomeSpeedDating />
      </div>

      <div className="border-t border-movApp-border/80 pt-8 sm:pt-10">
        <MovAppHomeMovEssencia />
      </div>

    </main>
  );
}
