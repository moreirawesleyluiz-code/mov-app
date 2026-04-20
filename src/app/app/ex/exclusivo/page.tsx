import { ExperienciasBackButton } from "@/components/experiencias-back-button";
import { cn } from "@/lib/utils";

const BODY_PARAGRAPHS = [
  "O MOV Exclusivo é a experiência mais cuidada da MOV para quem deseja viver um encontro com mais intenção, mais critério e mais profundidade. Aqui, conhecer alguém deixa de ser um acaso apressado e passa a ser uma experiência construída com atenção aos detalhes, curadoria e sensibilidade.",
  "Mais do que promover um encontro, o MOV Exclusivo nasce para criar o contexto certo para que uma conexão relevante aconteça. A proposta é reunir pessoas que valorizam presença, repertório, compatibilidade e qualidade na forma de se relacionar. Tudo isso em um ambiente mais refinado, com uma atmosfera pensada para que o encontro seja especial desde o início.",
  "No MOV Exclusivo, a experiência vai além da afinidade superficial. Nós utilizamos ferramentas de perfil comportamental, como DISC, Eneagrama e outros recursos de leitura de perfil, para aprofundar a compreensão sobre estilo de comunicação, dinâmica relacional, energia social, forma de perceber o mundo e compatibilidades possíveis. Isso permite uma curadoria mais inteligente, mais humana e muito mais cuidadosa.",
  "O resultado é uma proposta para quem não quer apenas conhecer alguém, mas viver uma experiência que faça sentido. Pessoas que já entenderam que nem toda conexão nasce do improviso — e que, muitas vezes, o encontro certo depende de contexto, intenção e direção.",
  "O MOV Exclusivo foi criado para quem valoriza experiências raras. Para quem prefere qualidade a volume. Para quem não quer perder tempo em conversas vazias, ambientes sem identidade ou interações que começam sem propósito. Aqui, cada detalhe existe para elevar a forma de conhecer alguém.",
  "Essa é uma experiência para quem busca algo mais seletivo, mais refinado e mais memorável. Um encontro pensado para acontecer com mais profundidade, mais presença e mais chance de gerar uma conexão que realmente valha a pena.",
];

function exclusivoWhatsappHref() {
  const fromEnv = process.env.NEXT_PUBLIC_MOV_EXCLUSIVO_WHATSAPP?.trim();
  if (fromEnv) return fromEnv;
  const defaultPhone = "5511999999999";
  const text = encodeURIComponent(
    "Olá! Gostaria de fazer minha reserva no MOV Exclusivo.",
  );
  return `https://wa.me/${defaultPhone}?text=${text}`;
}

export default function MovExclusivoPage() {
  const whatsappHref = exclusivoWhatsappHref();

  return (
    <div className="mx-auto w-full max-w-2xl pb-12">
      <ExperienciasBackButton fallbackHref="/app/ex" />
      <h1 className="mt-2 font-display text-3xl leading-tight tracking-[-0.02em] text-movApp-ink md:text-4xl">
        MOV Exclusivo
      </h1>
      <p className="mt-5 text-base font-semibold leading-snug text-movApp-ink sm:text-lg">
        Nem todo encontro merece ser comum.
      </p>

      <div className="mt-8 space-y-5 text-pretty text-sm leading-relaxed text-movApp-muted sm:mt-9 sm:text-[15px]">
        {BODY_PARAGRAPHS.map((block, i) => (
          <p key={i}>{block}</p>
        ))}
      </div>

      <div className="mt-10 border-t border-movApp-border pt-8 sm:mt-12">
        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            "inline-flex min-h-[3rem] w-full items-center justify-center rounded-xl px-4 text-center text-sm font-semibold text-white shadow-sm transition",
            "bg-[#25D366] hover:bg-[#20BD5A] active:scale-[0.995]",
          )}
        >
          💬 Fazer minha reserva pelo WhatsApp
        </a>
      </div>
    </div>
  );
}
