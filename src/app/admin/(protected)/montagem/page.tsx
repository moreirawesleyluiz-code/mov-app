import Link from "next/link";
import { MAX_MESA_SIZE } from "@/lib/admin-mesa-suggest";
import { AdminMesasPanel } from "@/components/admin/admin-mesas-panel";
import { loadAdminMesasWorkspaceData } from "@/lib/admin-mesas-workspace-data";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type SearchParams = Record<string, string | string[] | undefined>;
type Props = { searchParams?: Promise<SearchParams> };

/**
 * Curadoria: candidatos elegíveis, sugestão automática (global / por evento), nova mesa e lista de mesas para contexto.
 */
export default async function AdminMontagemPage({ searchParams }: Props) {
  const sp = searchParams ? await searchParams : {};
  const d = await loadAdminMesasWorkspaceData(sp);

  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <h1
            className="font-display text-2xl font-semibold text-movApp-ink"
            data-testid="admin-montagem-heading"
          >
            Montagem de mesas
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-movApp-muted">
            Curadoria: sugestões, candidatos sem mesa e criação manual. Para mesas operadas, use{" "}
            <Link href="/admin/mesas" className="font-medium text-movApp-accent hover:underline">
              Mesas
            </Link>
            .
          </p>
        </div>
      </div>
      <p className="mt-3 max-w-3xl text-sm text-movApp-muted">
        Até {MAX_MESA_SIZE} pessoas por mesa. Aqui o foco é sugerir, comparar e montar mesas com contexto operacional.
      </p>

      <form method="get" action="/admin/montagem" className="mt-6 space-y-4 rounded-2xl border border-movApp-border bg-movApp-paper p-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-movApp-muted">Filtros — candidatos (sem mesa)</p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <label className="text-xs font-medium text-movApp-muted">
            Cidade
            <select
              name="city"
              defaultValue={d.cityFilter ?? "__all__"}
              className="mt-1 h-10 w-full rounded-lg border border-movApp-border bg-white px-3 text-sm text-movApp-ink"
            >
              <option value="__all__">Todas</option>
              {d.cities.map((c) => (
                <option key={c} value={c ?? ""}>
                  {c}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs font-medium text-movApp-muted">
            Faixa etária
            <select
              name="ageBand"
              defaultValue={d.ageBandFilter ?? "__all__"}
              className="mt-1 h-10 w-full rounded-lg border border-movApp-border bg-white px-3 text-sm text-movApp-ink"
            >
              <option value="__all__">Todas</option>
              <option value="18_24">18-24</option>
              <option value="25_34">25-34</option>
              <option value="35_44">35-44</option>
              <option value="45_plus">45+</option>
            </select>
          </label>
          <label className="text-xs font-medium text-movApp-muted">
            Setor
            <select
              name="sector"
              defaultValue={d.sectorFilter ?? "__all__"}
              className="mt-1 h-10 w-full rounded-lg border border-movApp-border bg-white px-3 text-sm text-movApp-ink"
            >
              <option value="__all__">Todos</option>
              {d.sectors.map((s) => (
                <option key={s} value={s ?? ""}>
                  {s}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs font-medium text-movApp-muted">
            Energia social
            <select
              name="energyBand"
              defaultValue={d.energyBandFilter ?? "__all__"}
              className="mt-1 h-10 w-full rounded-lg border border-movApp-border bg-white px-3 text-sm text-movApp-ink"
            >
              <option value="__all__">Todas</option>
              <option value="calmo">Calmo</option>
              <option value="equilibrado">Equilibrado</option>
              <option value="expansivo">Expansivo</option>
            </select>
          </label>
        </div>
        <p className="text-xs font-semibold uppercase tracking-wide text-movApp-muted">Filtros — mesas (contexto)</p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <label className="text-xs font-medium text-movApp-muted">
            Evento
            <select
              name="mesaEvent"
              defaultValue={d.mesaEventFilter ?? "__all__"}
              className="mt-1 h-10 w-full rounded-lg border border-movApp-border bg-white px-3 text-sm"
            >
              <option value="__all__">Todos</option>
              {d.eventsForMesaFilter.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.title}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs font-medium text-movApp-muted">
            Restaurante atribuído
            <select
              name="mesaRestaurant"
              defaultValue={d.mesaRestaurantFilter ?? "__all__"}
              className="mt-1 h-10 w-full rounded-lg border border-movApp-border bg-white px-3 text-sm"
            >
              <option value="__all__">Todos</option>
              {d.restaurantOptions.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                  {!r.active ? " (inativo)" : ""}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs font-medium text-movApp-muted">
            Região (reserva)
            <select
              name="resRegion"
              defaultValue={d.resRegionFilter ?? "__all__"}
              className="mt-1 h-10 w-full rounded-lg border border-movApp-border bg-white px-3 text-sm"
            >
              <option value="__all__">Todas</option>
              {d.regionKeysForFilter.map((rk) => (
                <option key={rk} value={rk}>
                  {rk}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs font-medium text-movApp-muted">
            Orçamento da noite
            <select
              name="resBudget"
              defaultValue={d.resBudgetFilter ?? "__all__"}
              className="mt-1 h-10 w-full rounded-lg border border-movApp-border bg-white px-3 text-sm"
            >
              <option value="__all__">Todos</option>
              <option value="$">$</option>
              <option value="$$">$$</option>
              <option value="$$$">$$$</option>
            </select>
          </label>
          <label className="text-xs font-medium text-movApp-muted">
            Dieta / restrição
            <select
              name="resDiet"
              defaultValue={d.resDietFilter ?? "__all__"}
              className="mt-1 h-10 w-full rounded-lg border border-movApp-border bg-white px-3 text-sm"
            >
              <option value="__all__">Qualquer</option>
              <option value="vegetariano">vegetariano</option>
              <option value="vegano">vegano</option>
              <option value="sem_gluten">sem_gluten</option>
              <option value="sem_lactose">sem_lactose</option>
              <option value="onivoro">onivoro</option>
            </select>
          </label>
          <label className="flex min-h-10 items-end gap-2 pb-1 text-xs font-medium text-movApp-muted">
            <input type="checkbox" name="noRestaurant" value="1" defaultChecked={d.noRestaurantFilter} className="rounded" />
            Só mesas sem restaurante
          </label>
          <label className="flex min-h-10 items-end gap-2 pb-1 text-xs font-medium text-movApp-muted">
            <input type="checkbox" name="conflict" value="1" defaultChecked={d.conflictOnly} className="rounded" />
            Só com alerta operacional
          </label>
          <label className="text-xs font-medium text-movApp-muted">
            Estado da mesa
            <select
              name="mesaStatus"
              defaultValue={d.mesaStatusFilter ?? "__all__"}
              className="mt-1 h-10 w-full rounded-lg border border-movApp-border bg-white px-3 text-sm"
            >
              <option value="__all__">Todos</option>
              <option value="draft">Rascunho</option>
              <option value="finalized">Finalizada</option>
            </select>
          </label>
          <label className="text-xs font-medium text-movApp-muted">
            Disponibilidade (reserva)
            <select
              name="resAvail"
              defaultValue={d.resAvailFilter ?? "__all__"}
              className="mt-1 h-10 w-full rounded-lg border border-movApp-border bg-white px-3 text-sm"
            >
              <option value="__all__">Qualquer</option>
              <option value="__sem_slots__">Sem slots declarados</option>
              {d.availabilitySlotsForFilter.map((slot) => (
                <option key={slot} value={slot}>
                  {slot}
                </option>
              ))}
            </select>
          </label>
          <label className="flex min-h-10 items-end gap-2 pb-1 text-xs font-medium text-movApp-muted">
            <input type="checkbox" name="lowAdherence" value="1" defaultChecked={d.lowAdherenceOnly} className="rounded" />
            Só baixa aderência (restaurante)
          </label>
          <label className="flex min-h-10 items-end gap-2 pb-1 text-xs font-medium text-movApp-muted">
            <input
              type="checkbox"
              name="inactivePartner"
              value="1"
              defaultChecked={d.inactivePartnerOnly}
              className="rounded"
            />
            Só parceiro inativo atribuído
          </label>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="submit" className="rounded-lg bg-movApp-accent px-4 py-2 text-sm font-medium text-white">
            Aplicar filtros
          </button>
          <a href="/admin/montagem" className="rounded-lg border border-movApp-border px-4 py-2 text-sm font-medium text-movApp-ink">
            Limpar
          </a>
        </div>
      </form>

      <AdminMesasPanel
        showCurationBlocks
        mesas={d.mesas}
        unallocated={d.unallocated}
        tableOptions={d.tableOptions}
        pickerUsers={d.pickerUsers}
        events={d.events}
        restaurants={d.restaurantOptions.map((r) => ({
          id: r.id,
          name: r.name,
          active: r.active,
        }))}
      />
    </div>
  );
}
