import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { getPersistableQuestionStepIds } from "@/components/onboarding/onboarding-config";
import { prisma } from "@/lib/prisma";
import { deriveCompatibilityAxes } from "@/lib/compatibility-axes";
import { buildMovMatchingProfile } from "@/lib/mov-matching-profile";
import { getSectionForQuestionId, resolveAnswerLabel } from "@/lib/onboarding-answer-meta";

const bodySchema = z.object({
  schemaVersion: z.literal(4),
  answers: z.record(z.string(), z.string().max(4000)),
  city: z
    .object({
      id: z.string().max(64),
      name: z.string().max(120),
    })
    .nullable()
    .optional(),
});

const ALLOWED = new Set(getPersistableQuestionStepIds());

/**
 * Grava respostas do onboarding no banco para o utilizador autenticado.
 * Substitui respostas anteriores do mesmo utilizador (full replace).
 */
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Payload inválido." }, { status: 400 });
  }

  const { answers, city } = parsed.data;
  const userId = session.user.id;

  const filteredEntries = Object.entries(answers).filter(([qid]) => ALLOWED.has(qid));
  if (filteredEntries.length === 0) {
    return NextResponse.json({ ok: true, skipped: true, synced: 0 });
  }

  const cityName = city?.name ?? null;
  const answerMap = Object.fromEntries(filteredEntries) as Record<string, string>;
  const axesPayload = deriveCompatibilityAxes(answerMap);
  const movMatchingProfile = buildMovMatchingProfile({ answers: answerMap, cityName });
  const axesJson = JSON.stringify({
    ...axesPayload,
    movMatchingProfile,
  });

  const rows = filteredEntries.map(([questionId, answerValue]) => ({
    userId,
    questionId,
    section: getSectionForQuestionId(questionId),
    answerValue,
    answerLabel: resolveAnswerLabel(questionId, answerValue, { cityName }),
  }));

  await prisma.$transaction(async (tx) => {
    await tx.onboardingAnswer.deleteMany({ where: { userId } });
    await tx.onboardingAnswer.createMany({ data: rows });
    await tx.compatibilityProfile.upsert({
      where: { userId },
      create: { userId, axesJson },
      update: { axesJson },
    });
    if (cityName) {
      await tx.user.update({
        where: { id: userId },
        data: { city: cityName },
      });
    }
  });

  return NextResponse.json({
    ok: true,
    skipped: false,
    synced: rows.length,
    axesVersion: axesPayload.schemaVersion,
  });
}
