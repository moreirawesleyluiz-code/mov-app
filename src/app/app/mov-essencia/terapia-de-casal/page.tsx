import { MovEssenciaServiceDetail } from "@/components/mov-essencia-service-detail";

export const dynamic = "force-static";

export default function MovEssenciaTerapiaCasalPage() {
  return (
    <MovEssenciaServiceDetail
      title="Terapia de Casal"
      subtitle="Comunicação, mediação e alinhamento na relação a dois."
      description="Sessões guiadas para melhorar a comunicação, mediar conflitos e alinhar expectativas na relação."
      indicado="Casais que desejam fortalecer a relação, atravessar conflitos ou recuperar conexão."
      comoFunciona="Atendimento terapêutico em sessões periódicas."
      beneficios="Mais clareza, escuta, alinhamento e fortalecimento do vínculo."
    />
  );
}
