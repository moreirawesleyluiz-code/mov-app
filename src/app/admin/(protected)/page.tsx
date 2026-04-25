import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { AdminDashboardUserList } from "@/components/admin/admin-dashboard-user-list";
import { getOperationalState, type AdminOperationalState } from "@/lib/admin-user-state";
import { buildMovMatchingProfile, parseStoredMovMatchingProfile } from "@/lib/mov-matching-profile";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type SearchParams = Record<string, string | string[] | undefined>;
type Props = { searchParams?: Promise<SearchParams> };

function firstString(v: string | string[] | undefined): string | undefined {
  if (v === undefined) return undefined;
  const s = Array.isArray(v) ? v[0] : v;
  if (typeof s !== "string") return undefined;
  const t = s.trim();
  return t === "" ? undefined : t;
}

function parseDayStart(iso: string | undefined): Date | undefined {
  if (!iso) return undefined;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

function parseDayEnd(iso: string | undefined): Date | undefined {
  const d = parseDayStart(iso);
  if (!d) return undefined;
  const end = new Date(d);
  end.setHours(23, 59, 59, 999);
  return end;
}

/**
 * RSC: só Prisma + filtros leves. Tabela MOV no cliente (`AdminDashboardUserList`).
 */
export default async function AdminDashboardPage({ searchParams }: Props) {
  const sp = searchParams ? await searchParams : {};
  const q = firstString(sp.q);
  const qNorm = q?.toLowerCase();
  const city = firstString(sp.city);
  const role = firstString(sp.role);
  const sub = firstString(sp.sub);
  const mov = firstString(sp.mov);
  const state = firstString(sp.state);
  const from = firstString(sp.from);
  const to = firstString(sp.to);
  const ageBand = firstString(sp.ageBand);
  const sector = firstString(sp.sector);
  const energyBand = firstString(sp.energyBand);
  const includeTest = firstString(sp.includeTest) === "1";
  const allowListTestInAdmin =
    process.env.NODE_ENV === "development" || process.env.MOV_ADMIN_LIST_TEST_USERS === "1";
  const listTestUsers = includeTest && allowListTestInAdmin;

  const where: Prisma.UserWhereInput = { deletedAt: null };
  if (!listTestUsers) where.isTestUser = false;
  if (city && city !== "__all__") where.city = city;
  if (role === "user" || role === "admin") where.role = role;

  const fromD = parseDayStart(from);
  const toD = parseDayEnd(to);
  if (fromD || toD) {
    where.createdAt = {};
    if (fromD) where.createdAt.gte = fromD;
    if (toD) where.createdAt.lte = toD;
  }

  if (sub === "none") {
    where.subscription = null;
  } else {
    const subIs: Prisma.SubscriptionWhereInput = {};
    if (sub && sub !== "__all__") subIs.status = sub;
    if (mov && mov !== "__all__") subIs.planCode = mov;
    if (Object.keys(subIs).length > 0) {
      where.subscription = { is: subIs };
    }
  }

  const users = await prisma.user.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 200,
    select: {
      id: true,
      name: true,
      email: true,
      city: true,
      role: true,
      isTestUser: true,
      createdAt: true,
      subscription: { select: { status: true, planCode: true } },
      onboardingAnswers: { select: { questionId: true, answerValue: true } },
      compatibilityProfile: { select: { axesJson: true } },
    },
  });

  const cities = await prisma.user.findMany({
    where: {
      deletedAt: null,
      city: { not: null },
      ...(!listTestUsers ? { isTestUser: false } : {}),
    },
    select: { city: true },
    distinct: ["city"],
    orderBy: { city: "asc" },
  });

  const planCodes = await prisma.subscription.findMany({
    select: { planCode: true },
    distinct: ["planCode"],
    orderBy: { planCode: "asc" },
  });

  let filtered = users;

  if (state && state !== "__all__") {
    filtered = filtered.filter(
      (u) => getOperationalState(u.onboardingAnswers.length) === (state as AdminOperationalState),
    );
  }

  if (qNorm) {
    filtered = filtered.filter((u) => {
      const name = (u.name ?? "").toLowerCase();
      const email = u.email.toLowerCase();
      const c = (u.city ?? "").toLowerCase();
      return name.includes(qNorm) || email.includes(qNorm) || c.includes(qNorm);
    });
  }

  if ((ageBand && ageBand !== "__all__") || (sector && sector !== "__all__") || (energyBand && energyBand !== "__all__")) {
    filtered = filtered.filter((u) => {
      const derived =
        parseStoredMovMatchingProfile(u.compatibilityProfile?.axesJson) ??
        buildMovMatchingProfile({
          answers: Object.fromEntries(u.onboardingAnswers.map((a) => [a.questionId, a.answerValue])) as Record<string, string>,
          cityName: u.city,
        });
      if (ageBand && ageBand !== "__all__" && derived.ageBand !== ageBand) return false;
      if (sector && sector !== "__all__" && (derived.sector ?? "") !== sector) return false;
      if (energyBand && energyBand !== "__all__" && derived.energyBand !== energyBand) return false;
      return true;
    });
  }

  const sectors = [...new Set(users.map((u) => {
    const derived =
      parseStoredMovMatchingProfile(u.compatibilityProfile?.axesJson) ??
      buildMovMatchingProfile({
        answers: Object.fromEntries(u.onboardingAnswers.map((a) => [a.questionId, a.answerValue])) as Record<string, string>,
        cityName: u.city,
      });
    return derived.sector;
  }).filter(Boolean))].sort();

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1
          className="font-display text-2xl font-semibold tracking-tight text-movApp-ink"
          data-testid="admin-utilizadores-heading"
        >
          Utilizadores
        </h1>
      </div>

      <form method="get" action="/admin" className="mt-5 space-y-4 rounded-2xl border border-movApp-border bg-movApp-paper p-5 shadow-sm">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <label className="text-xs font-medium text-movApp-muted">
            <span>Busca (nome/e-mail/cidade)</span>
            <input
              type="search"
              name="q"
              defaultValue={q ?? ""}
              className="mt-1 h-10 w-full rounded-lg border border-movApp-border bg-white px-3 text-sm"
            />
          </label>
          <label className="text-xs font-medium text-movApp-muted">
            <span>Cidade</span>
            <select
              name="city"
              defaultValue={city ?? "__all__"}
              className="mt-1 h-10 w-full rounded-lg border border-movApp-border bg-white px-3 text-sm"
            >
              <option value="__all__">Todas</option>
              {cities.map((c) => (
                <option key={c.city ?? "null"} value={c.city ?? ""}>
                  {c.city}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs font-medium text-movApp-muted">
            <span>Role</span>
            <select
              name="role"
              defaultValue={role ?? "__all__"}
              className="mt-1 h-10 w-full rounded-lg border border-movApp-border bg-white px-3 text-sm"
            >
              <option value="__all__">Todas</option>
              <option value="user">user</option>
              <option value="admin">admin</option>
            </select>
          </label>
          <label className="text-xs font-medium text-movApp-muted">
            <span>Assinatura (estado)</span>
            <select
              name="sub"
              defaultValue={sub ?? "__all__"}
              className="mt-1 h-10 w-full rounded-lg border border-movApp-border bg-white px-3 text-sm"
            >
              <option value="__all__">Todas</option>
              <option value="none">Sem assinatura</option>
              <option value="active">active</option>
              <option value="canceled">canceled</option>
              <option value="past_due">past_due</option>
            </select>
          </label>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <label className="text-xs font-medium text-movApp-muted">
            <span>Estado onboarding</span>
            <select
              name="state"
              defaultValue={state ?? "__all__"}
              className="mt-1 h-10 w-full rounded-lg border border-movApp-border bg-white px-3 text-sm"
            >
              <option value="__all__">Todos</option>
              <option value="no_answers">Sem respostas</option>
              <option value="incomplete">Perfil incompleto</option>
              <option value="ready">Pronto para curadoria</option>
            </select>
          </label>
          <label className="text-xs font-medium text-movApp-muted">
            <span>Faixa etária</span>
            <select
              name="ageBand"
              defaultValue={ageBand ?? "__all__"}
              className="mt-1 h-10 w-full rounded-lg border border-movApp-border bg-white px-3 text-sm"
            >
              <option value="__all__">Todas</option>
              <option value="18_24">18-24</option>
              <option value="25_34">25-34</option>
              <option value="35_44">35-44</option>
              <option value="45_plus">45+</option>
            </select>
          </label>
          <label className="text-xs font-medium text-movApp-muted">
            <span>Setor</span>
            <select
              name="sector"
              defaultValue={sector ?? "__all__"}
              className="mt-1 h-10 w-full rounded-lg border border-movApp-border bg-white px-3 text-sm"
            >
              <option value="__all__">Todos</option>
              {sectors.map((s) => (
                <option key={s} value={s ?? ""}>
                  {s}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs font-medium text-movApp-muted">
            <span>Energia social</span>
            <select
              name="energyBand"
              defaultValue={energyBand ?? "__all__"}
              className="mt-1 h-10 w-full rounded-lg border border-movApp-border bg-white px-3 text-sm"
            >
              <option value="__all__">Todas</option>
              <option value="calmo">Calmo</option>
              <option value="equilibrado">Equilibrado</option>
              <option value="expansivo">Expansivo</option>
            </select>
          </label>
          <label className="text-xs font-medium text-movApp-muted">
            <span>Plano (assinatura)</span>
            <select
              name="mov"
              defaultValue={mov ?? "__all__"}
              className="mt-1 h-10 w-full rounded-lg border border-movApp-border bg-white px-3 text-sm"
            >
              <option value="__all__">Todos</option>
              {planCodes.map((p) => (
                <option key={p.planCode} value={p.planCode}>
                  {p.planCode}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs font-medium text-movApp-muted">
            <span>Cadastro desde</span>
            <input
              type="date"
              name="from"
              defaultValue={from ?? ""}
              className="mt-1 h-10 w-full rounded-lg border border-movApp-border bg-white px-3 text-sm"
            />
          </label>
          <label className="text-xs font-medium text-movApp-muted">
            <span>Cadastro até</span>
            <input
              type="date"
              name="to"
              defaultValue={to ?? ""}
              className="mt-1 h-10 w-full rounded-lg border border-movApp-border bg-white px-3 text-sm"
            />
          </label>
        </div>
        {allowListTestInAdmin ? (
          <label className="flex items-center gap-2 text-xs text-movApp-muted">
            <input type="checkbox" name="includeTest" value="1" defaultChecked={includeTest} className="h-4 w-4" />
            Incluir contas de teste (E2E/QA) na tabela
          </label>
        ) : null}
        <div className="flex gap-2">
          <button type="submit" className="rounded-lg bg-movApp-accent px-4 py-2 text-sm font-medium text-white">
            Aplicar
          </button>
          <Link href="/admin" className="rounded-lg border border-movApp-border px-4 py-2 text-sm font-medium">
            Limpar
          </Link>
        </div>
      </form>

      <h2 className="mt-8 text-sm font-semibold uppercase tracking-wider text-movApp-muted">
        Utilizadores ({filtered.length})
      </h2>
      <AdminDashboardUserList users={filtered} searchParams={sp} />
    </div>
  );
}
