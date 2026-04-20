import { MovEssenciaServiceDetail } from "@/components/mov-essencia-service-detail";

export const dynamic = "force-static";

const NARRATIVE_PARAGRAPHS = [
  "A Constelação Familiar da MOV foi criada para quem deseja olhar com mais profundidade para padrões emocionais, vínculos repetitivos e dinâmicas familiares que impactam a vida afetiva, relacional e pessoal. Mais do que entender sintomas isolados, essa experiência convida a pessoa a enxergar a origem de bloqueios, repetições e desconfortos que muitas vezes seguem atuando de forma invisível na forma de se relacionar, escolher e viver os próprios vínculos.",
  "Ao longo dessa jornada, a proposta é ampliar a consciência sobre lugares ocupados dentro do sistema familiar, lealdades inconscientes, repetições emocionais e cargas que podem estar limitando a fluidez da vida. A Constelação Familiar ajuda a trazer clareza para questões que, à primeira vista, parecem apenas individuais, mas que muitas vezes carregam raízes mais profundas ligadas à história familiar e aos padrões herdados.",
  "Escolher a MOV é optar por uma condução cuidadosa, sensível e estruturada. A experiência foi pensada para oferecer acolhimento, profundidade e direção, em um ambiente seguro para olhar temas importantes com mais presença e consciência. Não se trata apenas de revisitar histórias, mas de abrir espaço para reorganização interna, compreensão emocional e novos caminhos de relação consigo, com o outro e com a própria trajetória.",
  "A Constelação Familiar pode ajudar a liberar repetições, ampliar percepção, fortalecer a autonomia emocional e gerar mais leveza na forma de viver vínculos, decisões e relações. Para quem sente que chegou a hora de compreender padrões mais profundos e transformar a forma como vive sua história, a MOV oferece uma experiência séria, humana e transformadora.",
];

export default function MovEssenciaConstelacaoPage() {
  return (
    <MovEssenciaServiceDetail title="Constelação Familiar" narrativeParagraphs={NARRATIVE_PARAGRAPHS} />
  );
}
