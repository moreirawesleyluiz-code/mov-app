import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  BUDGET_OPTIONS,
  DIETARY_OPTIONS,
  LANGUAGE_OPTIONS,
} from "@/lib/dinner-prefs";
import { isSeMovDemoActive } from "@/lib/se-mov-demo";
import { isValidRegionKey } from "@/lib/sp-regions";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

const LANG_SET = new Set(LANGUAGE_OPTIONS.map((o) => o.id));
const BUDGET_SET = new Set(BUDGET_OPTIONS.map((o) => o.id));
const DIETARY_SET = new Set(DIETARY_OPTIONS.map((o) => o.id));

function serverErrorMessage(err: unknown): string {
  if (err instanceof Error) {
    const m = err.message;
    if (
      m.includes("Unknown column") ||
      m.includes("does not exist") ||
      m.includes("no such column")
    ) {
      return "Base de dados desatualizada. Pare o servidor de desenvolvimento, execute `npx prisma db push` e `npx prisma generate`, e reinicie.";
    }
    if (process.env.NODE_ENV === "development") {
      return m;
    }
  }
  return "Não foi possível salvar sua inscrição. Tente novamente.";
}

export async function POST(req: Request, context: Params) {
  const { id } = await context.params;
  const raw = await req.json().catch(() => ({}));
  const body =
    raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};

  const regionKey =
    typeof body.regionKey === "string" ? body.regionKey : undefined;
  const languagesIn = Array.isArray(body.languages)
    ? body.languages.filter((x): x is string => typeof x === "string")
    : [];
  const budgetIn = Array.isArray(body.budgetTiers)
    ? body.budgetTiers.filter((x): x is string => typeof x === "string")
    : [];
  const dietaryRestrictions =
    typeof body.dietaryRestrictions === "boolean"
      ? body.dietaryRestrictions
      : false;
  const dietaryTypesIn = Array.isArray(body.dietaryTypes)
    ? body.dietaryTypes.filter((x): x is string => typeof x === "string")
    : [];

  const session = await auth();
  const cookieStore = await cookies();
  const demoSeMov = isSeMovDemoActive(cookieStore);

  try {
    const event = await prisma.event.findUnique({ where: { id } });
    if (!event || !event.published) {
      return NextResponse.json(
        { error: "Evento não encontrado" },
        { status: 404 },
      );
    }

    let dinnerLanguages: string | null = null;
    let dinnerBudgetTiers: string | null = null;
    let dietary = false;
    let dietaryTypesStored: string | null = null;

    if (event.memberOnly) {
      if (!regionKey || !isValidRegionKey(regionKey)) {
        return NextResponse.json(
          { error: "Escolha uma região disponível para continuar." },
          { status: 400 },
        );
      }
      const langs = [
        ...new Set(languagesIn.filter((l) => LANG_SET.has(l as "en" | "pt"))),
      ];
      const budgets = [
        ...new Set(
          budgetIn.filter((t) => BUDGET_SET.has(t as "$" | "$$" | "$$$")),
        ),
      ];
      if (langs.length === 0) {
        return NextResponse.json(
          { error: "Selecione ao menos um idioma para o jantar." },
          { status: 400 },
        );
      }
      if (budgets.length === 0) {
        return NextResponse.json(
          { error: "Selecione ao menos uma faixa de orçamento." },
          { status: 400 },
        );
      }
      dinnerLanguages = JSON.stringify(langs);
      dinnerBudgetTiers = JSON.stringify(budgets);
      dietary = dietaryRestrictions;

      if (dietary) {
        const types = [
          ...new Set(
            dietaryTypesIn.filter((t) =>
              DIETARY_SET.has(t as (typeof DIETARY_OPTIONS)[number]["id"]),
            ),
          ),
        ];
        if (types.length === 0) {
          return NextResponse.json(
            {
              error:
                "Selecione ao menos uma opção de restrição alimentar ou desligue “Tenho restrições alimentares”.",
            },
            { status: 400 },
          );
        }
        dietaryTypesStored = JSON.stringify(types);
      }

      if (session?.user?.id) {
        const sub = await prisma.subscription.findUnique({
          where: { userId: session.user.id },
        });
        const active = sub?.status === "active";
        if (!active && !demoSeMov) {
          return NextResponse.json(
            { error: "Este movimento é exclusivo para assinantes Se Mov." },
            { status: 403 },
          );
        }
      } else if (demoSeMov) {
        return NextResponse.json({ ok: true, demo: true });
      } else {
        return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
      }
    }

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const existing = await prisma.eventRegistration.findUnique({
      where: {
        userId_eventId: { userId: session.user.id, eventId: id },
      },
    });
    if (existing && existing.status !== "cancelled") {
      return NextResponse.json({ ok: true, already: true });
    }
    const count = await prisma.eventRegistration.count({
      where: { eventId: id, status: { not: "cancelled" } },
    });

    const baseData = {
      regionKey: event.memberOnly ? (regionKey ?? null) : null,
      dinnerLanguages,
      dinnerBudgetTiers,
      dietaryRestrictions: event.memberOnly ? dietary : false,
      dietaryTypes: event.memberOnly ? dietaryTypesStored : null,
    };

    if (event.capacity && count >= event.capacity) {
      await prisma.eventRegistration.upsert({
        where: {
          userId_eventId: { userId: session.user.id, eventId: id },
        },
        create: {
          userId: session.user.id,
          eventId: id,
          status: "waitlist",
          ...baseData,
        },
        update: {
          status: "waitlist",
          ...baseData,
        },
      });
      return NextResponse.json({ ok: true, waitlist: true });
    }
    await prisma.eventRegistration.upsert({
      where: {
        userId_eventId: { userId: session.user.id, eventId: id },
      },
      create: {
        userId: session.user.id,
        eventId: id,
        status: "confirmed",
        ...baseData,
      },
      update: {
        status: "confirmed",
        ...baseData,
      },
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[register]", e);
    return NextResponse.json({ error: serverErrorMessage(e) }, { status: 500 });
  }
}
