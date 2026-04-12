import { Suspense } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { OnboardingFlow } from "@/components/onboarding/onboarding-flow";

/**
 * Entrada do produto: jornada inicial (pré-app). Utilizadores já autenticados vão direto ao app.
 */
export default async function HomePage() {
  const session = await auth();
  if (session?.user) {
    redirect(session.user.role === "admin" ? "/admin" : "/app");
  }

  return (
    <Suspense
      fallback={
        <div className="min-h-[100dvh] bg-movApp-bg [color-scheme:light]" aria-hidden />
      }
    >
      <OnboardingFlow />
    </Suspense>
  );
}
