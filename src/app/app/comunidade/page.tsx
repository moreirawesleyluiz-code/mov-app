/** Evita pré-render estático que, em dev, pode combinar mal com o runtime webpack dos chunks do servidor. */
export const dynamic = "force-dynamic";

export default function ComunidadePage() {
  return (
    <div className="mx-auto w-full max-w-3xl">
      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-movApp-accent">Comunidade</p>
      <h1 className="mt-2 font-display text-3xl leading-tight tracking-[-0.02em] text-movApp-ink md:text-4xl">
        A comunidade MOV
      </h1>
      <p className="mt-3 max-w-2xl text-pretty text-sm leading-relaxed text-movApp-muted sm:text-base">
        O coração da MOV é a comunidade: o dia a dia, os avisos e a conversa entre membros acontecem
        no <strong className="font-medium text-movApp-ink">WhatsApp</strong>. Neste app você cuida da reserva do
        jantar curado e dos dados da sua conta.
      </p>

      <div className="mt-8 space-y-6">
        <div className="rounded-2xl border border-movApp-border bg-movApp-paper p-6 shadow-sm sm:p-8">
          <h2 className="font-display text-xl leading-tight text-movApp-ink">O que fica no app</h2>
          <ul className="mt-4 list-inside list-disc space-y-3 text-sm leading-relaxed text-movApp-muted">
            <li>
              Com <strong className="font-medium text-movApp-ink">Se Mov ativo</strong>, em{" "}
              <strong className="font-medium text-movApp-ink">Início</strong> use{" "}
              <strong className="font-medium text-movApp-ink">Ir para o jantar — escolher data</strong> (ou o atalho de{" "}
              <strong className="font-medium text-movApp-ink">Agenda</strong> quando já tiver respostas do questionário):
              escolha a <strong className="font-medium text-movApp-ink">data</strong>, a{" "}
              <strong className="font-medium text-movApp-ink">região</strong> em São Paulo, suas{" "}
              <strong className="font-medium text-movApp-ink">preferências</strong> (idioma, orçamento, restrições), veja o{" "}
              <strong className="font-medium text-movApp-ink">resumo</strong> e <strong className="font-medium text-movApp-ink">confirme</strong>{" "}
              a inscrição.
            </li>
            <li>
              Depois da confirmação, local e combinações finais seguem o aviso da MOV por e-mail e
              WhatsApp, com o cuidado de sempre.
            </li>
          </ul>
        </div>

        <div className="rounded-2xl border border-movApp-border bg-movApp-paper p-6 shadow-sm sm:p-8">
          <h2 className="font-display text-xl leading-tight text-movApp-ink">O que fica no WhatsApp</h2>
          <p className="mt-4 text-sm leading-relaxed text-movApp-muted">
            Trilhas, música ao vivo, churrasco, escalada e outros encontros — avisos, grupos e combinação
            leve entre quem já faz parte. Assim o app fica focado na reserva e na curadoria, sem substituir
            o grupo.
          </p>
        </div>
      </div>
    </div>
  );
}
