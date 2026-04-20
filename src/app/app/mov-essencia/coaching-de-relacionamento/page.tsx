import { MovEssenciaServiceDetail } from "@/components/mov-essencia-service-detail";

export const dynamic = "force-static";

const NARRATIVE_PARAGRAPHS = [
  "O Coaching de Relacionamento da MOV foi criado para quem deseja evoluir na forma de se relacionar, fazer escolhas mais conscientes e construir vínculos mais saudáveis, maduros e alinhados com o que realmente procura. Mais do que um acompanhamento pontual, essa experiência é um processo de clareza, desenvolvimento e direção para quem quer sair de padrões automáticos e se relacionar com mais inteligência emocional e maturidade afetiva.",
  "Ao longo da jornada, a pessoa aprofunda a compreensão sobre seus comportamentos, critérios de escolha, padrões repetitivos, inseguranças e formas de se vincular. A proposta é ajudar a desenvolver repertório emocional, consciência relacional e mais segurança para viver relações com intenção, consistência e verdade.",
  "Escolher a MOV é optar por uma condução cuidadosa, humana e estratégica. A experiência foi pensada para quem quer parar de repetir dinâmicas que desgastam, melhorar sua leitura sobre si e sobre o outro e criar uma base mais sólida para viver conexões melhores. Não se trata apenas de falar sobre relacionamento, mas de construir novas formas de escolher, se posicionar e se conectar.",
  "O Coaching de Relacionamento pode ajudar a fortalecer autoestima relacional, amadurecer critérios, ampliar percepção emocional e desenvolver mais clareza na vida afetiva. Para quem quer se relacionar melhor, com mais consciência, direção e qualidade, a MOV oferece um caminho mais profundo, estruturado e transformador.",
];

export default function MovEssenciaCoachingPage() {
  return (
    <MovEssenciaServiceDetail
      title="Coaching de Relacionamento"
      narrativeParagraphs={NARRATIVE_PARAGRAPHS}
    />
  );
}
