"use server";

import { assertAdminRole } from "@/lib/admin-auth";
import { answersRecordFromRows, buildMovAdminProfile } from "@/lib/mov-admin-profile";
import { prisma } from "@/lib/prisma";

export type MovProfileSnapshot = {
  shortLabel: string;
  tags: string[];
  axes: Array<{ key: string; label: string; score: number | null }>;
  mesaSuggestion: string;
  eventSuggestion: string;
};

/**
 * Perfil MOV calculado só no servidor, invocado por ação (não no grafo RSC da página).
 * Mantém `mov-admin-profile` → `compatibility-axes` fora do módulo da rota admin.
 */
export async function getAdminMovProfileSnapshot(
  userId: string,
): Promise<{ ok: true; data: MovProfileSnapshot } | { ok: false; error: string }> {
  try {
    await assertAdminRole();
    const rows = await prisma.onboardingAnswer.findMany({
      where: { userId },
      select: { questionId: true, answerValue: true },
    });
    const profile = buildMovAdminProfile(answersRecordFromRows(rows));
    return {
      ok: true,
      data: {
        shortLabel: profile.shortLabel,
        tags: profile.tags,
        axes: profile.axes.map((a) => ({ key: a.key, label: a.label, score: a.score })),
        mesaSuggestion: profile.mesaSuggestion,
        eventSuggestion: profile.eventSuggestion,
      },
    };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Erro ao carregar Perfil MOV.",
    };
  }
}
