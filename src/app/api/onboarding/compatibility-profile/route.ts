import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { parseCompatibilityAxes } from "@/lib/compatibility-axes";

/**
 * Inspeção do perfil de compatibilidade derivado (sessão atual).
 * GET — apenas utilizador autenticado, próprio perfil.
 */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const userId = session.user.id;
  const row = await prisma.compatibilityProfile.findUnique({
    where: { userId },
    select: { axesJson: true, updatedAt: true },
  });

  if (!row) {
    return NextResponse.json({ profile: null, axes: null, message: "Sem CompatibilityProfile ainda." });
  }

  const axes = parseCompatibilityAxes(row.axesJson);

  return NextResponse.json({
    updatedAt: row.updatedAt.toISOString(),
    axesJsonRaw: row.axesJson,
    axes,
  });
}
