import Link from "next/link";

/** Três níveis do universo Speed Dating MOV (ingresso avulso) — rota /app/experiencias. A aba “Eventos” na navegação aponta para /app/eventos (agenda). */
const products = [
  {
    name: "MOV Clássico",
    price: "R$ 79,90",
    desc: "Entrada no formato speed dating com ambiente leve, facilitadores e boa conversa — ideal para conhecer a MOV e sair da rotina.",
  },
  {
    name: "MOV Sensorial",
    price: "R$ 179,90",
    desc: "Mesmo universo speed dating, com estímulos sensoriais, menos ruído visual e mais profundidade no contato.",
  },
  {
    name: "MOV Exclusivo",
    price: "R$ 549,00",
    desc: "A experiência mais cuidada: curadoria, hospitalidade e ambiente refinado — para quem busca um encontro realmente especial.",
  },
];

export default function ExperienciasPage() {
  return (
    <div className="mx-auto w-full max-w-3xl">
      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-movApp-accent">Ingresso avulso</p>
      <h1 className="mt-2 font-display text-3xl leading-tight tracking-[-0.02em] text-movApp-ink md:text-4xl">
        Speed Dating
      </h1>
      <p className="mt-3 max-w-2xl text-pretty text-sm leading-relaxed text-movApp-muted sm:text-base">
        Três formas de viver o speed dating com a MOV — cada uma com seu recorte e preço. Não confunda com o{" "}
        <strong className="font-medium text-movApp-ink">Se Mov</strong>: aqui são{" "}
        <strong className="font-medium text-movApp-ink">ingressos avulsos</strong>; o jantar da comunidade com assinatura
        você cuida em{" "}
        <Link
          href="/app"
          className="font-medium text-movApp-accent underline decoration-movApp-accent/45 underline-offset-2 hover:decoration-movApp-accent"
        >
          Início
        </Link>{" "}
        (agenda).
      </p>
      <p className="mt-3 max-w-2xl text-pretty text-sm leading-relaxed text-movApp-muted">
        Datas e vendas serão anunciadas quando abrirmos turmas. Volte pelo botão <strong className="font-medium text-movApp-ink">Speed Dating</strong>{" "}
        na página Início.
      </p>
      <ul className="mt-8 grid gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
        {products.map((p) => (
          <li
            key={p.name}
            className="flex min-h-full flex-col rounded-2xl border border-movApp-border bg-movApp-paper p-6 shadow-sm"
          >
            <h2 className="font-display text-lg leading-tight text-movApp-ink sm:text-xl">{p.name}</h2>
            <p className="mt-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-movApp-muted">
              Variação Speed Dating
            </p>
            <p className="mt-2 text-lg font-semibold tabular-nums text-movApp-gold">{p.price}</p>
            <p className="mt-4 flex-1 text-sm leading-relaxed text-movApp-muted">{p.desc}</p>
          </li>
        ))}
      </ul>
      <p className="mt-8 max-w-2xl text-pretty text-sm leading-relaxed text-movApp-muted">
        Para o <strong className="font-medium text-movApp-ink">jantar com a comunidade</strong> (assinatura Se Mov), volte ao{" "}
        <Link
          href="/app"
          className="font-medium text-movApp-accent underline decoration-movApp-accent/45 underline-offset-2 hover:decoration-movApp-accent"
        >
          Início
        </Link>{" "}
        e use <strong className="font-medium text-movApp-ink">ir para o jantar — escolher data</strong> após ativar o Se Mov. Avisos de
        ingressos Speed Dating saem aqui e nos canais da marca.
      </p>
    </div>
  );
}
