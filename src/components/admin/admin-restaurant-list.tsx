"use client";

import Link from "next/link";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { deletePartnerRestaurant, setPartnerRestaurantActive } from "@/app/admin/restaurant-actions";

type Row = {
  id: string;
  name: string;
  regionKey: string | null;
  priceTiersJson: string;
  active: boolean;
  tableCapacity?: number;
  curatedTables?: number;
};

export function AdminRestaurantList({ rows }: { rows: Row[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function run(fn: () => Promise<void>) {
    startTransition(async () => {
      await fn();
      router.refresh();
    });
  }

  return (
    <ul className="mt-3 space-y-2">
      {rows.map((r) => (
        <li
          key={r.id}
          className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-movApp-border bg-movApp-paper px-3 py-2 text-sm"
        >
          <div>
            <Link href={`/admin/restaurantes/${r.id}`} className="font-semibold text-movApp-accent hover:underline">
              {r.name}
            </Link>
            <span className="ml-2 text-movApp-muted">
              {r.regionKey ?? "— região"} · {r.priceTiersJson}
              {typeof r.curatedTables === "number" ? ` · ${r.curatedTables} mesa(s)` : ""}
              {typeof r.tableCapacity === "number" ? ` · cap. ${r.tableCapacity}` : ""}
              {!r.active && <span className="ml-2 text-amber-800">(inativo)</span>}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={pending}
              className="text-xs text-movApp-accent underline disabled:opacity-50"
              onClick={() => run(() => setPartnerRestaurantActive(r.id, !r.active))}
            >
              {r.active ? "Desativar" : "Ativar"}
            </button>
            <button
              type="button"
              disabled={pending}
              className="text-xs text-red-700 underline disabled:opacity-50"
              onClick={() => {
                if (!window.confirm(`Remover o parceiro “${r.name}”?`)) return;
                run(() => deletePartnerRestaurant(r.id));
              }}
            >
              Remover
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
