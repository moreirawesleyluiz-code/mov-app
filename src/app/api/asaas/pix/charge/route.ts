import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  AsaasApiError,
  createAsaasPaymentPix,
  getAsaasPaymentPixQrCode,
} from "@/lib/asaas/asaas-api";
import { ensureAsaasCustomerId } from "@/lib/asaas/ensure-asaas-customer";
import { isValidRegionKey } from "@/lib/sp-regions";
import { getSpeedDatingEventById } from "@/lib/speed-dating-public-events";
import { prisma } from "@/lib/prisma";

function dueDateTodaySaoPaulo(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
  }).format(new Date());
}

export async function POST(req: Request) {
  if (!process.env.ASAAS_API_KEY?.trim()) {
    return NextResponse.json(
      { error: "Pagamento ainda não está configurado no ambiente. Contacte o apoio da MOV." },
      { status: 503 },
    );
  }

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user?.email) {
    return NextResponse.json(
      { error: "A sua conta precisa de e-mail para gerar a cobrança. Complete o perfil e tente novamente." },
      { status: 400 },
    );
  }

  const body = (await req.json().catch(() => ({}))) as { eventId?: string; regionKey?: string };
  const { eventId, regionKey } = body;
  if (!eventId || typeof eventId !== "string") {
    return NextResponse.json({ error: "Falta o evento." }, { status: 400 });
  }
  if (!regionKey || !isValidRegionKey(regionKey)) {
    return NextResponse.json({ error: "Região inválida. Volte e selecione a região." }, { status: 400 });
  }
  const event = await getSpeedDatingEventById(eventId);
  if (!event || event.priceCents <= 0) {
    return NextResponse.json(
      { error: "Este evento não requer pagamento avulso ou não está disponível. Use a confirmação de inscrição no ecrã." },
      { status: 400 },
    );
  }

  const reg = await prisma.eventRegistration.findUnique({
    where: { userId_eventId: { userId: user.id, eventId } },
  });
  if (reg && reg.status === "confirmed") {
    return NextResponse.json(
      { error: "Já estás inscrito nesta data. Vê a app em Início / Eventos." },
      { status: 400 },
    );
  }

  const extRef = `mov_${user.id.slice(0, 8)}_${eventId.slice(0, 6)}_${randomUUID().replace(/-/g, "").slice(0, 12)}`;

  try {
    const customerId = await ensureAsaasCustomerId({
      userId: user.id,
      email: user.email,
      name: user.name,
    });

    const valueReais = event.priceCents / 100;
    const pay = await createAsaasPaymentPix({
      customerId,
      valueReais,
      dueDate: dueDateTodaySaoPaulo(),
      description: `Speed Dating — ${event.title}`.slice(0, 140),
      externalReference: extRef,
    });

    const mov = await prisma.asaasPayment.create({
      data: {
        userId: user.id,
        eventId: event.id,
        regionKey,
        asaasCustomerId: customerId,
        asaasPaymentId: pay.id,
        asaasStatus: pay.status || "PENDING",
        valueCents: event.priceCents,
        externalReference: extRef,
      },
    });

    const pix = await getAsaasPaymentPixQrCode(pay.id);
    return NextResponse.json({
      movPaymentId: mov.id,
      asaasPaymentId: pay.id,
      status: pay.status,
      valueReais,
      encodedImage: pix.encodedImage,
      payload: pix.payload,
      expirationDate: pix.expirationDate,
    });
  } catch (e) {
    if (e instanceof Error && e.message.includes("ASAAS_DEFAULT_CUSTOMER_CPF_CNPJ")) {
      return NextResponse.json(
        { error: "Pagamento indisponível temporariamente. Contacte o apoio da MOV." },
        { status: 503 },
      );
    }
    if (e instanceof AsaasApiError) {
      return NextResponse.json(
        { error: e.message || "Erro ao falar com o fornecedor de pagamento." },
        { status: 502 },
      );
    }
    console.error("[asaas/pix/charge]", e);
    return NextResponse.json(
      { error: "Falha inesperada ao criar a cobrança. Tente de novo em instantes." },
      { status: 500 },
    );
  }
}
