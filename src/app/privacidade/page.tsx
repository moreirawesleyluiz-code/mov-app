import type { Metadata } from "next";
import { PublicLegalPage } from "@/components/public-legal-page";

export const metadata: Metadata = {
  title: "Política de privacidade — MOV",
  description: "Como a MOV trata dados pessoais no app e no site.",
};

export default function PrivacidadePage() {
  return (
    <PublicLegalPage title="Política de privacidade">
      <p>
        Este texto é uma base para o produto. A política completa descreverá que dados recolhemos (por exemplo conta,
        preferências de jantar e utilização do app), para quê, durante quanto tempo e com quem partilhamos — sempre no
        respeito pela legislação aplicável.
      </p>
      <p>
        Pode solicitar esclarecimentos ou exercer os seus direitos através dos contactos oficiais da MOV.
      </p>
    </PublicLegalPage>
  );
}
