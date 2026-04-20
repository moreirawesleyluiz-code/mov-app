import type { Metadata } from "next";
import { AuthChoiceForm } from "./auth-choice-form";

export const metadata: Metadata = {
  title: "Entrar · MOV",
  description: "Entre com e-mail ou com a sua conta Google.",
};

export default function EntrarPage() {
  const googleAuthEnabled =
    Boolean(process.env.AUTH_GOOGLE_ID?.trim()) && Boolean(process.env.AUTH_GOOGLE_SECRET?.trim());

  return <AuthChoiceForm googleAuthEnabled={googleAuthEnabled} />;
}
