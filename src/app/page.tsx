import { OnboardingFlow } from "@/components/onboarding/onboarding-flow";

/**
 * Landing pública — sem `redirect()` para `/app` no servidor.
 * Antes: `auth()` via RSC podia ver sessão e enviar para `/app`, enquanto o middleware (JWT no Edge)
 * não reconhecia o token → `/app` → `/login?callbackUrl=/app` → loop ao voltar para `/`.
 */
export default function HomePage() {
  return <OnboardingFlow />;
}
