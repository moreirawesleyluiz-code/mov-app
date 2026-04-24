import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getAsaasPayment, AsaasApiError } from "@/lib/asaas/asaas-api";
import {
  applyRegistrationAfterSettledPayment,
  isAsaasSettledForRegistration,
} from "@/lib/asaas/post-payment-confirm";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  if (!process.env.ASAAS_API_KEY?.trim()) {
    return NextResponse.json(
      { error: "Pagamento ainda não está configurado no ambiente." },
      { status: 503 },
    );
  }

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const movId = req.nextUrl.searchParams.get("movId");
  if (!movId) {
    return NextResponse.json({ error: "Parâmetro movId em falta." }, { status: 400 });
  }

  const local = await prisma.asaasPayment.findFirst({
    where: { id: movId, userId: session.user.id },
  });
  if (!local) {
    return NextResponse.json({ error: "Cobrança não encontrada." }, { status: 404 });
  }

  try {
    const remote = await getAsaasPayment(local.asaasPaymentId);
    const st = remote.status;

    if (!isAsaasSettledForRegistration(st)) {
      await prisma.asaasPayment.update({
        where: { id: local.id },
        data: { asaasStatus: st },
      });
      return NextResponse.json({
        asaasStatus: st,
        done: false,
        registration: null,
      });
    }

    const applied = await applyRegistrationAfterSettledPayment({
      movPaymentId: local.id,
      asaasStatus: st,
      userId: local.userId,
      eventId: local.eventId,
    });

    if (!applied.ok) {
      return NextResponse.json(
        { error: applied.error, asaasStatus: st },
        { status: 500 },
      );
    }

    return NextResponse.json({
      asaasStatus: st,
      done: true,
      registration: applied.registrationStatus
        ? { status: applied.registrationStatus }
        : null,
    });
  } catch (e) {
    if (e instanceof AsaasApiError) {
      return NextResponse.json(
        { error: e.message, asaasStatus: local.asaasStatus },
        { status: 502 },
      );
    }
    console.error("[asaas/payment/status]", e);
    return NextResponse.json({ error: "Falha ao consultar a cobrança." }, { status: 500 });
  }
}
