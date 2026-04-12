import Link from "next/link";
import { redirect } from "next/navigation";
import { loadUserOnboardingProfile } from "@/lib/load-user-onboarding-profile";

/**
 * Tela mínima de validação operacional (respostas + eixos + meta).
 * Não é visual final — só para QA e demos internas.
 */
export default async function DebugOnboardingPage() {
  const data = await loadUserOnboardingProfile();
  if (!data) redirect("/login?callbackUrl=/app/debug/onboarding");

  return (
    <div className="font-mono text-xs">
      <p className="text-[10px] uppercase tracking-widest text-movApp-warn">Debug / validação</p>
      <h1 className="mt-2 font-display text-2xl text-movApp-ink">Onboarding → servidor</h1>
      <p className="mt-2 max-w-3xl text-movApp-muted">
        Use esta página para confirmar userId, cidade, contagem de respostas, JSON de eixos e sincronização.
      </p>

      <div className="mt-8 space-y-6 rounded-xl border border-amber-200/90 bg-movApp-subtle/90 p-4 text-movApp-ink">
        <section>
          <h2 className="text-[10px] uppercase text-movApp-muted">Identificação</h2>
          <pre className="mt-2 overflow-x-auto whitespace-pre-wrap break-all text-[11px] leading-relaxed">
            {JSON.stringify(
              {
                userId: data.userId,
                city: data.user?.city ?? null,
                email: data.user?.email ?? null,
                syncStatus:
                  data.answerCount > 0
                    ? "respostas presentes no banco"
                    : "sem respostas (nunca sincronizou ou local vazio no login)",
                axesStatus: data.axesJsonRaw ? "CompatibilityProfile.axesJson preenchido" : "sem eixos",
                profileRowUpdatedAt: data.profileUpdatedAt?.toISOString() ?? null,
              },
              null,
              2,
            )}
          </pre>
        </section>

        <section>
          <h2 className="text-[10px] uppercase text-movApp-muted">CompatibilityProfile.axesJson (raw)</h2>
          <pre className="mt-2 max-h-64 overflow-auto whitespace-pre-wrap break-all text-[11px] leading-relaxed text-emerald-800">
            {data.axesJsonRaw ?? "null"}
          </pre>
        </section>

        <section>
          <h2 className="text-[10px] uppercase text-movApp-muted">
            OnboardingAnswer ({data.answerCount} linhas)
          </h2>
          <div className="mt-2 max-h-96 overflow-auto rounded border border-movApp-border">
            <table className="w-full border-collapse text-left text-[10px]">
              <thead className="sticky top-0 bg-movApp-paper">
                <tr className="border-b border-movApp-border text-movApp-muted">
                  <th className="p-2">questionId</th>
                  <th className="p-2">section</th>
                  <th className="p-2">value</th>
                  <th className="p-2">label</th>
                </tr>
              </thead>
              <tbody>
                {data.answers.map((a) => (
                  <tr key={a.questionId} className="border-b border-movApp-border/50">
                    <td className="p-2 align-top text-movApp-accent">{a.questionId}</td>
                    <td className="p-2 align-top text-movApp-muted">{a.section ?? "—"}</td>
                    <td className="p-2 align-top break-all">{a.answerValue}</td>
                    <td className="p-2 align-top text-movApp-muted">{a.answerLabel ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <div className="mt-8 flex flex-wrap gap-4 text-[11px]">
        <Link href="/app/perfil-mov" className="text-movApp-accent hover:underline">
          ← Perfil MOV (visual)
        </Link>
        <Link href="/app" className="text-movApp-muted hover:text-movApp-ink">
          Início
        </Link>
      </div>
    </div>
  );
}
