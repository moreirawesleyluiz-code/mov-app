import type { Prisma } from "@prisma/client";
import Link from "next/link";
import { AdminPartnerRestaurantForm } from "@/components/admin/admin-partner-restaurant-form";
import { AdminRestaurantList } from "@/components/admin/admin-restaurant-list";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type SearchParams = Record<string, string | string[] | undefined>;
type PageProps = { searchParams?: Promise<SearchParams> };

function firstString(v: string | string[] | undefined): string | undefined {
  if (v === undefined) return undefined;
  const s = Array.isArray(v) ? v[0] : v;
  if (typeof s !== "string") return undefined;
  const t = s.trim();
  return t === "" ? undefined : t;
}

function parseJsonArray(raw: string): string[] {
  try {
    const v = JSON.parse(raw) as unknown;
    return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
}

export default async function AdminRestaurantesPage({ searchParams }: PageProps) {
  const sp = searchParams ? await searchParams : {};
  const q = firstString(sp.q);
  const regionKey = firstString(sp.regionKey);
  const activeRaw = firstString(sp.active) ?? "all";
  const priceTier = firstString(sp.priceTier);

  const whereParts: Prisma.PartnerRestaurantWhereInput[] = [];
  if (q) {
    whereParts.push({
      OR: [
        { name: { contains: q } },
        { neighborhood: { contains: q } },
        { city: { contains: q } },
        { cuisineCategories: { contains: q } },
      ],
    });
  }
  if (regionKey && regionKey !== "__all__") {
    whereParts.push({ regionKey });
  }
  if (activeRaw === "true") whereParts.push({ active: true });
  if (activeRaw === "false") whereParts.push({ active: false });

  const list = await prisma.partnerRestaurant.findMany({
    where: whereParts.length ? { AND: whereParts } : {},
    orderBy: [{ active: "desc" }, { name: "asc" }],
    include: {
      _count: { select: { curatedTables: true } },
    },
  });

  const filtered =
    priceTier && priceTier !== "__all__"
      ? list.filter((r) => parseJsonArray(r.priceTiersJson).includes(priceTier))
      : list;

  const regions = (
    await prisma.partnerRestaurant.findMany({
      distinct: ["regionKey"],
      select: { regionKey: true },
      where: { regionKey: { not: null } },
    })
  )
    .map((x) => x.regionKey)
    .filter(Boolean) as string[];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold text-movApp-ink">Restaurantes parceiros</h1>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-x-4 gap-y-1 text-sm">
          <Link href="/admin/mesas" className="font-medium text-movApp-ink underline-offset-4 hover:text-movApp-accent hover:underline">
            Mesas
          </Link>
          <Link href="/admin/montagem" className="font-medium text-movApp-accent hover:underline">
            Montagem
          </Link>
        </div>
      </div>

      <form
        method="get"
        action="/admin/restaurantes"
        className="grid gap-3 rounded-2xl border border-movApp-border bg-movApp-paper p-5 shadow-sm sm:grid-cols-2 lg:grid-cols-4"
      >
        <label className="text-xs font-medium text-movApp-muted">
          Pesquisa
          <input
            name="q"
            defaultValue={q ?? ""}
            placeholder="nome, bairro, culinária…"
            className="mt-1 h-10 w-full rounded-lg border border-movApp-border bg-white px-3 text-sm"
          />
        </label>
        <label className="text-xs font-medium text-movApp-muted">
          Região
          <select name="regionKey" defaultValue={regionKey ?? "__all__"} className="mt-1 h-10 w-full rounded-lg border border-movApp-border bg-white px-3 text-sm">
            <option value="__all__">Todas</option>
            {regions.map((rk) => (
              <option key={rk} value={rk}>
                {rk}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs font-medium text-movApp-muted">
          Estado
          <select name="active" defaultValue={activeRaw} className="mt-1 h-10 w-full rounded-lg border border-movApp-border bg-white px-3 text-sm">
            <option value="all">Ativos e inativos</option>
            <option value="true">Só ativos</option>
            <option value="false">Só inativos</option>
          </select>
        </label>
        <label className="text-xs font-medium text-movApp-muted">
          Ticket (filtro)
          <select name="priceTier" defaultValue={priceTier ?? "__all__"} className="mt-1 h-10 w-full rounded-lg border border-movApp-border bg-white px-3 text-sm">
            <option value="__all__">Todos</option>
            <option value="$">$</option>
            <option value="$$">$$</option>
            <option value="$$$">$$$</option>
          </select>
        </label>
        <div className="flex flex-wrap gap-2 sm:col-span-2 lg:col-span-4">
          <button type="submit" className="rounded-lg bg-movApp-accent px-4 py-2 text-sm font-medium text-white">
            Filtrar
          </button>
          <Link href="/admin/restaurantes" className="rounded-lg border border-movApp-border px-4 py-2 text-sm font-medium text-movApp-ink">
            Limpar
          </Link>
        </div>
      </form>

      <AdminPartnerRestaurantForm key="novo-parceiro" title="Novo parceiro" />

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-movApp-muted">
          Cadastrados ({filtered.length}
          {priceTier && priceTier !== "__all__" ? ` · filtro ticket` : ""})
        </h2>
        <div className="mt-3 grid gap-3 lg:grid-cols-2">
          {filtered.map((r) => (
            <article
              key={r.id}
              className="rounded-xl border border-movApp-border bg-white p-4 shadow-sm transition hover:border-movApp-accent/40"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h3 className="font-display text-base font-semibold text-movApp-ink">{r.name}</h3>
                  <p className="text-xs text-movApp-muted">
                    {r.city ?? "—"} · {r.neighborhood ?? "—"} · {r.regionKey ?? "sem regionKey"}
                  </p>
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    r.active ? "bg-emerald-50 text-emerald-900" : "bg-amber-50 text-amber-900"
                  }`}
                >
                  {r.active ? "Ativo" : "Inativo"}
                </span>
              </div>
              <dl className="mt-3 grid grid-cols-2 gap-2 text-xs text-movApp-ink">
                <div>
                  <dt className="text-movApp-muted">Ticket</dt>
                  <dd className="font-mono">{r.priceTiersJson}</dd>
                </div>
                <div>
                  <dt className="text-movApp-muted">Mesas MOV</dt>
                  <dd>{r._count.curatedTables}</dd>
                </div>
                <div>
                  <dt className="text-movApp-muted">Capacidade</dt>
                  <dd>
                    {r.tableCapacity} mesas · {r.seatsPerTableMax} lug.
                  </dd>
                </div>
                <div>
                  <dt className="text-movApp-muted">Ambiente</dt>
                  <dd className="truncate">{r.environmentType ?? "—"}</dd>
                </div>
              </dl>
              <div className="mt-3 flex flex-wrap gap-2 border-t border-movApp-border pt-3">
                <Link href={`/admin/restaurantes/${r.id}`} className="text-sm font-medium text-movApp-accent hover:underline">
                  Ficha e edição
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-movApp-muted">Lista compacta</h2>
        <AdminRestaurantList
          rows={filtered.map((r) => ({
            id: r.id,
            name: r.name,
            regionKey: r.regionKey,
            priceTiersJson: r.priceTiersJson,
            active: r.active,
            tableCapacity: r.tableCapacity,
            curatedTables: r._count.curatedTables,
          }))}
        />
      </section>
    </div>
  );
}
