"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

type HeroProps = {
  firstName?: string;
  hasAnswers: boolean;
  hasAxes: boolean;
};

const linkFocus =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-movApp-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-movApp-bg";

function pickHeroSubline(firstName: string | undefined, hasAnswers: boolean, hasAxes: boolean): string {
  if (!hasAnswers) {
    return `${firstName ? `${firstName}, ` : ""}o questionário da jornada inicial fica na página inicial da MOV (antes do login). Conclua por lá e entre de novo para seus dados aparecerem aqui.`;
  }
  if (!hasAxes) {
    return "Recebemos suas respostas e estamos finalizando seu perfil — em breve tudo aparece neste app.";
  }
  return "Próximo passo: com Se Mov ativo, a Agenda para o jantar; Speed Dating e MOV Essência (profundidade) abaixo; Comunidade e Conta na barra inferior.";
}

export function MovAppHomeHero({ firstName, hasAnswers, hasAxes }: HeroProps) {
  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-2xl border border-movApp-border/90",
        "bg-gradient-to-br from-movApp-paper via-movApp-subtle to-[#ebe6df]",
        "shadow-[0_2px_0_0_rgba(196,92,74,0.08),0_20px_48px_rgba(28,25,23,0.08)]",
        "px-5 py-8 sm:px-8 sm:py-10",
      )}
    >
      <div
        className="pointer-events-none absolute inset-0 bg-grid-pattern-light opacity-50 [background-size:24px_24px]"
        aria-hidden
      />
      <div className="pointer-events-none absolute -right-20 -top-28 h-64 w-64 rounded-full bg-movApp-accent/15 blur-3xl" aria-hidden />
      <div className="pointer-events-none absolute -bottom-24 -left-16 h-48 w-48 rounded-full bg-movApp-gold/10 blur-3xl" aria-hidden />

      <div className="relative">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-movApp-accent">App MOV</p>
        <h1 className="mt-3 font-display text-[1.75rem] font-normal leading-[1.12] tracking-[-0.03em] text-movApp-ink sm:text-[2.1rem]">
          Olá{firstName ? `, ${firstName}` : ""}
        </h1>
        <p className="mt-4 max-w-xl border-l-2 border-movApp-accent/35 pl-4 text-[13px] leading-relaxed text-movApp-muted sm:text-[14px]">
          <span className="font-medium text-movApp-ink">Entrada e app são etapas diferentes:</span> a jornada inicial
          (questionário) acontece na <strong className="font-medium text-movApp-ink">página inicial da MOV</strong>, antes do
          login. <strong className="font-medium text-movApp-ink">Aqui</strong> é o seu espaço depois de entrar — Se Mov
          (agenda do jantar), Speed Dating (ingressos avulsos), <strong className="font-medium text-movApp-ink">MOV Essência</strong>{" "}
          (profundidade na relação), comunidade e conta.
        </p>
        <p className="mt-5 max-w-xl text-pretty text-[15px] leading-relaxed text-movApp-muted sm:text-base">
          {pickHeroSubline(firstName, hasAnswers, hasAxes)}
        </p>
      </div>
    </section>
  );
}

export function MovAppHomeSpeedDating() {
  return (
    <section className="rounded-2xl border border-movApp-border bg-movApp-paper px-5 py-7 shadow-sm ring-1 ring-movApp-border/60 sm:px-8 sm:py-9">
      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-movApp-muted">Por onde começar</p>
      <h2 className="mt-2 font-display text-xl leading-tight tracking-[-0.02em] text-movApp-ink sm:text-[1.35rem]">
        Speed Dating
      </h2>
      <p className="mt-3 max-w-2xl text-pretty text-sm leading-relaxed text-movApp-muted">
        <strong className="font-medium text-movApp-ink">Speed Dating</strong> reúne as três opções de formato com{" "}
        <strong className="font-medium text-movApp-ink">ingresso avulso</strong> (quando abrirmos vendas). O{" "}
        <strong className="font-medium text-movApp-ink">jantar com a comunidade</strong> pela assinatura Se Mov é outro
        caminho — veja o bloco <strong className="font-medium text-movApp-ink">Se Mov</strong> acima nesta página.
        Comunidade, Eventos e Conta estão na <strong className="font-medium text-movApp-ink">barra inferior</strong>.
      </p>
      <div className="mt-7 sm:mt-8">
        <Link
          href="/app/experiencias"
          className={cn(
            linkFocus,
            "inline-flex h-12 w-full min-w-0 items-center justify-center rounded-xl bg-movApp-accent px-5 text-center text-sm font-semibold text-white shadow-sm transition hover:bg-movApp-accentHover active:scale-[0.995] sm:px-6",
          )}
        >
          Speed Dating
        </Link>
      </div>
    </section>
  );
}
