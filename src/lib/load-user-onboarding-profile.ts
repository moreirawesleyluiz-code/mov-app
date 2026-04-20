import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { parseCompatibilityAxes } from "@/lib/compatibility-axes";

export type UserOnboardingProfileData = {
  userId: string;
  user: {
    city: string | null;
    email: string | null;
    name: string | null;
  } | null;
  answerCount: number;
  answers: Array<{
    questionId: string;
    section: string | null;
    answerValue: string;
    answerLabel: string | null;
  }>;
  profileUpdatedAt: Date | null;
  axes: ReturnType<typeof parseCompatibilityAxes>;
  axesJsonRaw: string | null;
};

export async function loadUserOnboardingProfile(): Promise<UserOnboardingProfileData | null> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId || typeof userId !== "string" || userId.trim() === "") return null;

  try {
    const [user, answers, profile] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: { city: true, email: true, name: true },
      }),
      prisma.onboardingAnswer.findMany({
        where: { userId },
        select: { questionId: true, answerValue: true, answerLabel: true, section: true },
        orderBy: { questionId: "asc" },
      }),
      prisma.compatibilityProfile.findUnique({
        where: { userId },
        select: { axesJson: true, updatedAt: true },
      }),
    ]);

    // JWT válido mas utilizador já não existe na BD — não continuar (evita estados inconsistentes / erros a jusante).
    if (!user) return null;

    const axes = profile?.axesJson ? parseCompatibilityAxes(profile.axesJson) : null;

    return {
      userId,
      user,
      answerCount: answers.length,
      answers,
      profileUpdatedAt: profile?.updatedAt ?? null,
      axes,
      axesJsonRaw: profile?.axesJson ?? null,
    };
  } catch (err) {
    console.error("[MOV] loadUserOnboardingProfile:", err);
    return null;
  }
}
