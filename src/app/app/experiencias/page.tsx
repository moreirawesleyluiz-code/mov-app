import Link from "next/link";
import { ArrowBackIcon } from "@/components/conta/conta-icons";
import { cn } from "@/lib/utils";

type ProductCard = {
  name: string;
  price: string;
  desc?: string;
  datasHref?: string;
  ctaLabel?: string;
};

/** Três níveis do universo Speed Dating MOV — rota /app/experiencias. A aba “Eventos” na navegação aponta para /app/eventos (agenda). */
const products: ProductCard[] = [
  {
    name: "MOV Clássico",
    price: "R$ 79,90",
    desc: "O MOV Clássico foi criado para quem quer conhecer pessoas novas em uma experiência presencial leve, bem cuidada e propícia a conversas reais. Em rodadas rápidas de 5 minutos, a mesa gira até que todos se conheçam, criando um encontro descontraído e natural para sair da rotina e viver a química do presencial.",
    datasHref: "/app/ex/datas",
  },
  {
    name: "MOV Sensorial",
    price: "R$ 179,90",
    datasHref: "/app/ex/datas/sensorial",
  },
  {
    name: "MOV Exclusivo",
    price: "R$ 549,00",
    datasHref: "/app/ex/exclusivo",
    ctaLabel: "Faça sua reserva",
  },
];

const ctaClass =
  "inline-flex h-11 w-full items-center justify-center rounded-xl bg-movApp-accent px-4 text-center text-sm font-semibold text-white shadow-sm transition hover:bg-movApp-accentHover active:scale-[0.995]";

export default function ExperienciasPage() {
  return (
    <div className="mx-auto w-full max-w-3xl">
      <Link
        href="/app"
        className="mb-1 inline-flex h-10 items-center gap-1.5 rounded-xl px-1.5 text-sm font-medium text-movApp-muted transition hover:bg-movApp-subtle hover:text-movApp-ink"
        aria-label="Voltar"
      >
        <ArrowBackIcon className="shrink-0" />
        <span>Voltar</span>
      </Link>
      <h1 className="mt-2 font-display text-3xl leading-tight tracking-[-0.02em] text-movApp-ink md:text-4xl">
        O que é o Speed Dating?
      </h1>
      <p className="mt-4 max-w-2xl text-pretty text-sm leading-relaxed text-movApp-muted sm:mt-5 sm:text-[15px]">
        O Speed Dating da MOV é uma plataforma de encontros presenciais para quem quer sair da superficialidade dos
        aplicativos e viver conexões reais. Com três formatos complementares, o Clássico, Sensorial e Exclusivo — a
        experiência vai do leve e divertido ao profundo e exclusivo, criando encontros com mais intenção, presença e
        química ao vivo.
      </p>
      <ul className="mt-7 grid gap-5 sm:grid-cols-2 sm:mt-8 sm:gap-6 lg:grid-cols-3">
        {products.map((p) => (
          <li
            key={p.name}
            className="flex min-h-full flex-col rounded-2xl border border-movApp-border bg-movApp-paper p-6 shadow-sm"
          >
            <h2 className="font-display text-lg leading-tight text-movApp-ink sm:text-xl">{p.name}</h2>
            <p className="mt-2 text-lg font-semibold tabular-nums text-movApp-gold">{p.price}</p>

            {p.name === "MOV Sensorial" ? (
              <div className="mt-4 flex-1 space-y-2.5 text-sm leading-relaxed">
                <p className="text-pretty text-movApp-muted">
                  Uma experiência inédita da MOV, criada para tirar o olhar do centro e colocar a conexão em primeiro
                  lugar.
                </p>
                <p className="font-display text-[17px] font-semibold leading-snug text-movApp-ink sm:text-lg">
                  O primeiro encontro às cegas do Brasil!
                </p>
                <p className="text-pretty text-movApp-muted">
                  Onde os sentidos são explorados, para quem quer viver algo raro, marcante e impossível de comparar.
                  Você vai se sentir em um Reality Show onde a conexão vem antes da aparência.
                </p>
              </div>
            ) : p.name === "MOV Exclusivo" ? (
              <div className="mt-4 flex-1 space-y-2 text-sm leading-relaxed text-movApp-muted">
                <p className="text-pretty font-medium text-movApp-ink">Nem todo encontro merece ser comum.</p>
                <p className="text-pretty">
                  O MOV Exclusivo foi criado para quem busca uma experiência mais seletiva, refinada e memorável — onde
                  cada detalhe eleva a forma de conhecer alguém.
                </p>
              </div>
            ) : (
              <p className="mt-4 flex-1 text-sm leading-relaxed text-movApp-muted">{p.desc}</p>
            )}

            {p.datasHref ? (
              <Link href={p.datasHref} className={cn(ctaClass, "mt-5")}>
                {p.ctaLabel ?? "Escolher data"}
              </Link>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
