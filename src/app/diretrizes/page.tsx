import type { Metadata } from "next";
import { PublicLegalPage } from "@/components/public-legal-page";

export const metadata: Metadata = {
  title: "Diretrizes da comunidade — MOV",
  description: "Como convivemos na comunidade MOV.",
};

export default function DiretrizesPage() {
  return (
    <PublicLegalPage title="Diretrizes da comunidade">
      <p>
        A MOV existe para conexões reais e respeitosas. Trate todos com empatia; não assedie, não discrimine e não
        partilhe dados de terceiros sem consentimento. Eventos e grupos seguem regras adicionais comunicadas pela equipa.
      </p>
      <p>
        Conteúdo ofensivo ou ilegal pode ser removido e contas suspensas. Este texto é base editorial até versão final.
      </p>
    </PublicLegalPage>
  );
}
