import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getSpeedDatingEventById } from "@/lib/speed-dating-public-events";
import { validateVoucherForAmount } from "@/lib/vouchers";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const body = (await req.json().catch(() => ({}))) as { eventId?: string; code?: string };
  if (!body.eventId || typeof body.eventId !== "string") {
    return NextResponse.json({ error: "Evento inválido." }, { status: 400 });
  }
  if (!body.code || typeof body.code !== "string") {
    return NextResponse.json({ error: "Código inválido." }, { status: 400 });
  }

  const event = await getSpeedDatingEventById(body.eventId);
  if (!event || event.priceCents <= 0) {
    return NextResponse.json({ error: "Evento não elegível para cupom." }, { status: 400 });
  }

  const result = await validateVoucherForAmount({
    code: body.code,
    baseValueCents: event.priceCents,
  });

  if (!result.ok) return NextResponse.json({ valid: false, error: result.error }, { status: 400 });

  return NextResponse.json({
    valid: true,
    code: result.code,
    discountPercent: result.discountPercent,
    originalValueCents: event.priceCents,
    finalValueCents: result.finalValueCents,
  });
}

