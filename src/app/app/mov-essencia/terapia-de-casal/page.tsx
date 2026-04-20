import { MovEssenciaServiceDetail } from "@/components/mov-essencia-service-detail";

export const dynamic = "force-static";

const NARRATIVE_PARAGRAPHS = [
  "A Terapia de Casal da MOV foi criada para casais que desejam cuidar da relação com mais consciência, profundidade e direção. Mais do que intervir em momentos de crise, essa experiência existe para fortalecer a comunicação, reorganizar expectativas, restaurar a escuta e ajudar o casal a construir uma relação mais madura, saudável e alinhada.",
  "Ao longo da jornada, o casal encontra um espaço seguro para compreender padrões, nomear conflitos com mais clareza e desenvolver novas formas de diálogo. A proposta não é apenas falar sobre problemas, mas criar caminhos práticos para melhorar convivência, intimidade, parceria e conexão emocional.",
  "Escolher a MOV é optar por uma condução mais cuidadosa, humana e estruturada. A experiência foi pensada para acolher diferentes fases da relação — desde casais que querem prevenir desgastes até aqueles que desejam atravessar conflitos com mais apoio, clareza e intenção. Tudo isso com uma abordagem que une escuta qualificada, profundidade relacional e direcionamento real para transformação.",
  "A Terapia de Casal pode ajudar a reconstruir pontes, fortalecer vínculos, ampliar a compreensão mútua e devolver qualidade à relação. Para quem sente que a vida a dois merece cuidado de verdade, a MOV oferece um caminho mais consciente para transformar conflito em entendimento, distância em reconexão e relação em escolha renovada.",
];

export default function MovEssenciaTerapiaCasalPage() {
  return (
    <MovEssenciaServiceDetail title="Terapia de Casal" narrativeParagraphs={NARRATIVE_PARAGRAPHS} />
  );
}
