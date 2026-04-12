"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { PLANOS_MOV, formatBRL, type PlanoMov } from "@/lib/planos-mov";
import { cn } from "@/lib/utils";

const orbitFaces = ["😊", "🙂", "😄", "💛", "💜"];

const beneficios = [
  {
    titulo: "Acesso à comunidade MOV",
    texto:
      "Conheça novas pessoas em jantares, rolês e experiências curadas em São Paulo — toda semana algo acontece.",
    cor: "bg-pink-500",
    icon: "🔑",
  },
  {
    titulo: "Sempre algo novo",
    texto: "Novos lugares, novas caras, novas vibrações. Cada edição pode ser diferente.",
    cor: "bg-orange-500",
    icon: "✦",
  },
  {
    titulo: "Conexões reais",
    texto:
      "Curadoria e segurança emocional para ir além do aplicativo tradicional e criar vínculos com intenção.",
    cor: "bg-violet-500",
    icon: "💬",
  },
  {
    titulo: "Flexibilidade total",
    texto:
      "Cancele quando quiser (conforme política). Troque de plano ou peça reembolso em até 14 dias, conforme regras.",
    cor: "bg-emerald-600",
    icon: "🏷",
  },
  {
    titulo: "E estamos só começando",
    texto:
      "Em breve: mais formatos, grupos temáticos e novas formas de manter a comunidade viva na sua cidade.",
    cor: "bg-sky-600",
    icon: "⏱",
  },
];

export function PlanosMovScreen() {
  const router = useRouter();
  const defaultPlan = PLANOS_MOV.find((p) => p.id === "3m") ?? PLANOS_MOV[0];
  const [selected, setSelected] = useState<PlanoMov>(defaultPlan);

  const summary = useMemo(() => {
    return `${formatBRL(selected.totalCents)} para ${selected.months} ${selected.months === 1 ? "mês" : "meses"}`;
  }, [selected]);

  function onContinuar() {
    router.push("/app/agenda");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-md pb-36 text-movApp-ink lg:pb-28">
      <header className="mb-8 flex min-h-10 items-start justify-between gap-4">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-movApp-ink">Nossos planos</h1>
        <Link
          href="/app/agenda"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-movApp-muted transition hover:bg-movApp-subtle hover:text-movApp-ink"
          aria-label="Fechar"
        >
          <span className="text-xl leading-none">✕</span>
        </Link>
      </header>

      <div className="mb-10 flex flex-col items-center">
        <div className="relative mx-auto h-[200px] w-[200px]">
          <div className="absolute inset-8 rounded-full border border-movApp-border" />
          {orbitFaces.map((face, i) => {
            const angle = (i * 360) / orbitFaces.length - 90;
            const rad = (angle * Math.PI) / 180;
            const r = 70;
            const tx = Math.cos(rad) * r;
            const ty = Math.sin(rad) * r;
            return (
              <span
                key={i}
                className="absolute left-1/2 top-1/2 flex h-9 w-9 items-center justify-center text-lg"
                style={{
                  transform: `translate(-50%, -50%) translate(${tx}px, ${ty}px)`,
                }}
                aria-hidden
              >
                {face}
              </span>
            );
          })}
          <div
            className="absolute left-1/2 top-1/2 flex h-14 w-14 items-center justify-center rounded-lg bg-violet-600 shadow-md shadow-violet-600/40"
            style={{ transform: "translate(-50%, -50%) rotate(45deg)" }}
          >
            <span className="text-2xl" style={{ transform: "rotate(-45deg)" }} aria-hidden>
              💎
            </span>
          </div>
          <span className="absolute -right-0 top-5 text-lg" aria-hidden>
            ✨
          </span>
          <span className="absolute left-3 top-1 text-sm" aria-hidden>
            ✨
          </span>
        </div>
        <p className="mt-6 max-w-[280px] text-center text-sm leading-relaxed text-movApp-muted">
          Os membros têm até{" "}
          <strong className="font-semibold text-movApp-ink">mais chances</strong> de encontrar
          conexões reais e recorrentes na cidade.
        </p>
      </div>

      <section className="space-y-3">
        <h2 className="sr-only">Escolha o plano</h2>
        {PLANOS_MOV.map((plano) => {
          const isSel = selected.id === plano.id;
          return (
            <button
              key={plano.id}
              type="button"
              onClick={() => setSelected(plano)}
              className={cn(
                "flex w-full items-stretch gap-3 rounded-2xl border px-4 py-4 text-left transition",
                "bg-movApp-paper text-movApp-ink",
                isSel
                  ? "border-movApp-accent shadow-md ring-1 ring-movApp-accent/25"
                  : "border-movApp-border hover:border-movApp-muted/60",
              )}
            >
              <span
                className={cn(
                  "mt-0.5 flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full border-2",
                  isSel ? "border-movApp-accent bg-movApp-accent" : "border-movApp-border bg-movApp-bg",
                )}
                aria-hidden
              >
                {isSel ? <span className="h-2 w-2 rounded-full bg-white" /> : null}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <span className="text-base font-bold text-movApp-ink">{plano.label}</span>
                  {plano.savePercent != null && (
                    <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-800">
                      (Economizar {plano.savePercent}%)
                    </span>
                  )}
                </div>
                <div className="mt-1 flex flex-wrap items-baseline gap-2">
                  {plano.originalCents != null && (
                    <span className="text-sm text-movApp-muted line-through">
                      {formatBRL(plano.originalCents)}
                    </span>
                  )}
                  <span className="text-lg font-bold text-movApp-ink">{formatBRL(plano.totalCents)}</span>
                </div>
              </div>
              <div className="shrink-0 self-center text-right">
                <p className="text-base font-bold text-movApp-ink">{formatBRL(plano.weeklyCents)}</p>
                <p className="text-[11px] font-medium text-movApp-muted">/semana</p>
              </div>
            </button>
          );
        })}
      </section>

      <section className="mt-8 rounded-2xl border border-movApp-border bg-movApp-subtle/80 p-4">
        <p className="text-sm font-semibold text-movApp-ink">Tem um código promocional?</p>
        <button
          type="button"
          className="mt-2 flex h-10 items-center gap-2 text-sm font-medium text-movApp-muted underline decoration-movApp-border underline-offset-4 hover:text-movApp-ink"
        >
          <span aria-hidden>🎟</span> Digite aqui
        </button>
      </section>

      <section className="mt-10">
        <div
          className="mb-3 flex justify-center gap-0.5 text-lg text-amber-500"
          aria-label="Avaliação 5 estrelas"
        >
          {"★★★★★".split("").map((s, i) => (
            <span key={i}>{s}</span>
          ))}
        </div>
        <p className="text-center text-sm leading-relaxed text-movApp-muted">
          Junte-se a quem já vive encontros MOV com curadoria e segurança em São Paulo.
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <blockquote className="rounded-2xl border border-movApp-border bg-movApp-paper p-4 text-sm leading-relaxed text-movApp-muted shadow-sm">
            Nada a organizar, o suspense de descobrir novas pessoas, uma boa refeição e diálogos
            interessantes — uma noite super agradável.
            <footer className="mt-3 text-xs font-bold text-movApp-ink">Lalinav</footer>
          </blockquote>
          <blockquote className="rounded-2xl border border-movApp-border bg-movApp-paper p-4 text-sm leading-relaxed text-movApp-muted shadow-sm">
            Testei o conceito por curiosidade. A noite foi muito agradável. Adorei o espírito de
            descoberta e surpresa.
            <footer className="mt-3 text-xs font-bold text-movApp-ink">clemsab</footer>
          </blockquote>
        </div>
      </section>

      <section className="mt-12 rounded-3xl border border-movApp-border bg-movApp-subtle/60 p-6">
        <h2 className="font-display text-lg font-semibold text-movApp-ink">O que você desbloqueia</h2>
        <ul className="mt-6 space-y-7">
          {beneficios.map((b) => (
            <li key={b.titulo} className="flex gap-4">
              <span
                className={cn(
                  "flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-base text-white shadow-sm",
                  b.cor,
                )}
                aria-hidden
              >
                {b.icon}
              </span>
              <div>
                <p className="font-bold text-movApp-ink">{b.titulo}</p>
                <p className="mt-1 text-sm leading-relaxed text-movApp-muted">{b.texto}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* Acima da barra de navegação inferior do app no mobile */}
      <div className="fixed left-0 right-0 z-[60] border-t border-movApp-border bg-movApp-paper/95 px-4 py-3 backdrop-blur-md supports-[backdrop-filter]:bg-movApp-paper/90 bottom-[calc(4.5rem+env(safe-area-inset-bottom,0px))] lg:bottom-0">
        <div className="mx-auto max-w-md pb-[max(0.25rem,env(safe-area-inset-bottom,0px))]">
          <p className="mb-3 text-center text-base font-bold text-movApp-ink">{summary}</p>
          <button
            type="button"
            onClick={onContinuar}
            className="h-12 w-full rounded-xl bg-movApp-accent py-3 text-center text-base font-bold text-white shadow-md transition hover:bg-movApp-accentHover"
          >
            Continuar
          </button>
        </div>
      </div>
    </div>
  );
}
