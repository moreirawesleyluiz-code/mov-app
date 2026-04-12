import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { isSeMovDemoActive } from "@/lib/se-mov-demo";

/**
 * Permite agenda/jantar com sessão + assinatura ativa OU cookie de demo Se Mov (sem login).
 */
export async function requireAgendaSeMovAccess(): Promise<{
  userId: string | null;
  demo: boolean;
}> {
  const cookieStore = await cookies();
  const demo = isSeMovDemoActive(cookieStore);
  const session = await auth();
  const userId = session?.user?.id ?? null;

  if (!userId && !demo) redirect("/app");

  if (userId) {
    const sub = await prisma.subscription.findUnique({ where: { userId } });
    if (sub?.status !== "active" && !demo) redirect("/app");
  }

  return { userId, demo };
}
