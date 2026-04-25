import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

/** Ativa assinatura Se Mov (MVP: sem gateway de pagamento — integração Stripe depois) */
export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const userId = session.user.id;
  const renewsAt = new Date();
  renewsAt.setMonth(renewsAt.getMonth() + 1);

  await prisma.subscription.upsert({
    where: { userId },
    create: {
      userId,
      status: "active",
      planCode: "SE_MOV",
      renewsAt,
    },
    update: {
      status: "active",
      canceledAt: null,
      renewsAt,
    },
  });
  return NextResponse.json({ ok: true });
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(null);
  }
  const sub = await prisma.subscription.findUnique({
    where: { userId: session.user.id },
  });
  return NextResponse.json(sub);
}

export async function DELETE() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  await prisma.subscription.updateMany({
    where: { userId: session.user.id, status: "active" },
    data: {
      status: "canceled",
      canceledAt: new Date(),
    },
  });

  return NextResponse.json({ ok: true });
}
