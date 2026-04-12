import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { AdminDashboardUserList } from "@/components/admin/admin-dashboard-user-list";
import { getOperationalState, type AdminOperationalState } from "@/lib/admin-user-state";
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

  const where: Prisma.UserWhereInput = { deletedAt: null };
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
      createdAt: true,
      subscription: { select: { status: true, planCode: true } },
      onboardingAnswers: { select: { questionId: true, answerValue: true } },
    },
  });

  const cities = await prisma.user.findMany({
    where: { deletedAt: null, city: { not: null } },
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

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold tracking-tight text-movApp-ink">MOV Admin</h1>
      <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-movApp-muted">
        <span>Dashboard operacional</span>
        <Link href="/admin/mesas" className="font-medium text-movApp-accent hover:underline">
          Montagem de mesas
        </Link>
      </p>
      <p className="mt-3 max-w-3xl text-xs leading-relaxed text-movApp-muted">
        Onboarding completo = 28 respostas esperadas. Montagem de mesa e texto de evento são sugestões administrativas
        (heurísticas), não regras automáticas.
      </p>

      <form method="get" action="/admin" className="mt-6 space-y-4 rounded-xl border border-movApp-border bg-movApp-paper p-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <label className="text-sm">
            <span className="text-movApp-muted">Busca (nome/e-mail/cidade)</span>
            <input
              type="search"
              name="q"
              defaultValue={q ?? ""}
              className="mt-1 w-full rounded-lg border border-movApp-border bg-white px-3 py-2"
            />
          </label>
          <label className="text-sm">
            <span className="text-movApp-muted">Cidade</span>
            <select
              name="city"
              defaultValue={city ?? "__all__"}
              className="mt-1 w-full rounded-lg border border-movApp-border bg-white px-3 py-2"
            >
              <option value="__all__">Todas</option>
              {cities.map((c) => (
                <option key={c.city ?? "null"} value={c.city ?? ""}>
                  {c.city}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            <span className="text-movApp-muted">Role</span>
            <select
              name="role"
              defaultValue={role ?? "__all__"}
              className="mt-1 w-full rounded-lg border border-movApp-border bg-white px-3 py-2"
            >
              <option value="__all__">Todas</option>
              <option value="user">user</option>
              <option value="admin">admin</option>
            </select>
          </label>
          <label className="text-sm">
            <span className="text-movApp-muted">Assinatura (estado)</span>
            <select
              name="sub"
              defaultValue={sub ?? "__all__"}
              className="mt-1 w-full rounded-lg border border-movApp-border bg-white px-3 py-2"
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
          <label className="text-sm">
            <span className="text-movApp-muted">Estado onboarding</span>
            <select
              name="state"
              defaultValue={state ?? "__all__"}
              className="mt-1 w-full rounded-lg border border-movApp-border bg-white px-3 py-2"
            >
              <option value="__all__">Todos</option>
              <option value="no_answers">Sem respostas</option>
              <option value="incomplete">Perfil incompleto</option>
              <option value="ready">Pronto para curadoria</option>
            </select>
          </label>
          <label className="text-sm">
            <span className="text-movApp-muted">Plano (assinatura)</span>
            <select
              name="mov"
              defaultValue={mov ?? "__all__"}
              className="mt-1 w-full rounded-lg border border-movApp-border bg-white px-3 py-2"
            >
              <option value="__all__">Todos</option>
              {planCodes.map((p) => (
                <option key={p.planCode} value={p.planCode}>
                  {p.planCode}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            <span className="text-movApp-muted">Cadastro desde</span>
            <input
              type="date"
              name="from"
              defaultValue={from ?? ""}
              className="mt-1 w-full rounded-lg border border-movApp-border bg-white px-3 py-2"
            />
          </label>
          <label className="text-sm">
            <span className="text-movApp-muted">Cadastro até</span>
            <input
              type="date"
              name="to"
              defaultValue={to ?? ""}
              className="mt-1 w-full rounded-lg border border-movApp-border bg-white px-3 py-2"
            />
          </label>
        </div>
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
