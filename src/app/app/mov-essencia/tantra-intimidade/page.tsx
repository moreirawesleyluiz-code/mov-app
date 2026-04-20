import { MovEssenciaServiceDetail } from "@/components/mov-essencia-service-detail";

export const dynamic = "force-static";

const NARRATIVE_PARAGRAPHS = [
  "Tantra & Intimidade é uma experiência da MOV criada para quem deseja aprofundar presença, consciência corporal, intimidade e qualidade na forma de se relacionar. Mais do que uma proposta pontual, é um caminho de expansão pessoal e relacional para quem sente que o corpo, o afeto e a conexão também precisam de espaço, escuta e desenvolvimento.",
  "Aqui, o trabalho vai além de uma abordagem superficial sobre intimidade. A proposta é oferecer vivências e experiências guiadas que ajudam a ampliar percepção, presença, autoconhecimento corporal e capacidade de se conectar consigo e com o outro de forma mais consciente. É um convite para desacelerar, sair do automático e acessar uma relação mais verdadeira com desejo, sensibilidade, vínculo e presença.",
  "Ao escolher a MOV, a pessoa entra em uma jornada conduzida com cuidado, curadoria e segurança emocional. A experiência foi pensada para criar um ambiente de confiança, acolhimento e profundidade, onde cada etapa favorece mais consciência sobre si, mais maturidade afetiva e mais repertório para viver relações com mais verdade e intenção.",
  "Tantra & Intimidade pode fazer sentido para quem deseja desenvolver presença no corpo, aprofundar a relação com a própria intimidade, construir vínculos mais saudáveis e expandir a forma como vive conexão, afeto e consciência relacional. É também uma escolha para quem busca uma experiência séria, bem conduzida e transformadora, com a assinatura da MOV.",
];

export default function MovEssenciaTantraPage() {
  return (
    <MovEssenciaServiceDetail title="Tantra & Intimidade" narrativeParagraphs={NARRATIVE_PARAGRAPHS} />
  );
}
