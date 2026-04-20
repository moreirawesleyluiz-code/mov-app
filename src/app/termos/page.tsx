import type { Metadata } from "next";
import { PublicLegalPage } from "@/components/public-legal-page";

export const metadata: Metadata = {
  title: "Termos de serviço — MOV",
  description: "Termos de serviço da comunidade MOV.",
};

export default function TermosPage() {
  return (
    <PublicLegalPage title="Termos de serviço">
      <p>
        Este texto é uma base para o produto. A equipa MOV pode substituir por versão jurídica final. Ao usar o site e o
        app, você concorda em respeitar as regras da comunidade, a privacidade dos outros membros e as orientações
        divulgadas nos canais oficiais.
      </p>
      <p>
        Em caso de dúvidas, contacte-nos através dos canais indicados no app ou no site.
      </p>
    </PublicLegalPage>
  );
}
