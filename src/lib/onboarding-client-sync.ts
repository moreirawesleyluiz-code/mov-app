"use client";

import { loadOnboardingState, clearOnboardingState } from "@/components/onboarding/onboarding-persistence";

export type OnboardingSyncResult = { ok: true; synced: number; skipped?: boolean } | { ok: false; error: string };

/**
 * Envia o estado local v4 do onboarding para o servidor após sessão ativa.
 * Em caso de sucesso, limpa o `localStorage` do onboarding.
 */
export async function syncPendingOnboardingAfterAuth(): Promise<OnboardingSyncResult> {
  const raw = loadOnboardingState();
  if (!raw || raw.v !== 5) {
    return { ok: true, synced: 0, skipped: true };
  }

  const hasAnswers = Object.keys(raw.answers).length > 0;
  if (!hasAnswers) {
    return { ok: true, synced: 0, skipped: true };
  }

  try {
    const res = await fetch("/api/onboarding/sync", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        schemaVersion: 4,
        answers: raw.answers,
        city: raw.city,
      }),
    });

    const data = (await res.json().catch(() => ({}))) as {
      ok?: boolean;
      synced?: number;
      skipped?: boolean;
      error?: string;
    };

    if (!res.ok) {
      return { ok: false, error: typeof data.error === "string" ? data.error : "Falha ao sincronizar." };
    }

    clearOnboardingState();
    return { ok: true, synced: typeof data.synced === "number" ? data.synced : 0, skipped: data.skipped };
  } catch {
    return { ok: false, error: "Erro de rede ao sincronizar onboarding." };
  }
}
