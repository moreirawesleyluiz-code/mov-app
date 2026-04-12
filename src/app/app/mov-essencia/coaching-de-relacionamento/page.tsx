import { MovEssenciaServiceDetail } from "@/components/mov-essencia-service-detail";

export const dynamic = "force-static";

export default function MovEssenciaCoachingPage() {
  return (
    <MovEssenciaServiceDetail
      title="Coaching de Relacionamento"
      subtitle="Maturidade afetiva, critérios de escolha e inteligência relacional."
      description="Acompanhamento estruturado para desenvolver maturidade afetiva, critérios de escolha e inteligência relacional."
      indicado="Pessoas que querem evoluir na forma de se relacionar, escolher melhor e construir vínculos mais saudáveis."
      comoFunciona="Sessões individuais com plano de desenvolvimento."
      beneficios="Mais clareza emocional, melhores escolhas e evolução prática nos relacionamentos."
    />
  );
}
