import { requireAdminPage } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { createVoucher, setVoucherActive, updateVoucher } from "@/app/admin/voucher-actions";

export const dynamic = "force-dynamic";

type SearchParams = Record<string, string | string[] | undefined>;
type Props = { searchParams?: Promise<SearchParams> };

function firstString(v: string | string[] | undefined): string | undefined {
  if (v === undefined) return undefined;
  const s = Array.isArray(v) ? v[0] : v;
  if (typeof s !== "string") return undefined;
  const t = s.trim();
  return t === "" ? undefined : t;
}

function formatDate(value: Date | null): string {
  if (!value) return "—";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(value);
}

function toDateInput(value: Date | null): string {
  if (!value) return "";
  const y = value.getFullYear();
  const m = String(value.getMonth() + 1).padStart(2, "0");
  const d = String(value.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export default async function AdminVouchersPage({ searchParams }: Props) {
  await requireAdminPage();
  const sp = searchParams ? await searchParams : {};
  const editId = firstString(sp.edit);

  const vouchers = await prisma.voucher.findMany({
    orderBy: [{ createdAt: "desc" }],
  });
  const editing = editId ? vouchers.find((v) => v.id === editId) ?? null : null;
  const isEditing = Boolean(editing);

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold tracking-tight text-movApp-ink">Vouchers</h1>

      <section className="mt-5 rounded-2xl border border-movApp-border bg-movApp-paper p-5 shadow-sm">
        <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-movApp-muted">
          {isEditing ? "Editar voucher" : "Novo voucher"}
        </h2>
        <form action={isEditing ? updateVoucher : createVoucher} className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {isEditing ? <input type="hidden" name="id" value={editing.id} /> : null}
          <label className="text-xs font-medium text-movApp-muted">
            Código
            <input
              name="code"
              required
              defaultValue={editing?.code ?? ""}
              className="mt-1 h-10 w-full rounded-lg border border-movApp-border bg-white px-3 text-sm uppercase"
            />
          </label>
          <label className="text-xs font-medium text-movApp-muted">
            % desconto
            <input
              name="discountPercent"
              type="number"
              min={1}
              max={100}
              required
              defaultValue={editing?.discountPercent ?? ""}
              className="mt-1 h-10 w-full rounded-lg border border-movApp-border bg-white px-3 text-sm"
            />
          </label>
          <label className="text-xs font-medium text-movApp-muted">
            Limite total de usos
            <input
              name="usageLimit"
              type="number"
              min={1}
              defaultValue={editing?.usageLimit ?? ""}
              className="mt-1 h-10 w-full rounded-lg border border-movApp-border bg-white px-3 text-sm"
            />
          </label>
          <label className="text-xs font-medium text-movApp-muted">
            Início
            <input
              name="startsAt"
              type="date"
              defaultValue={toDateInput(editing?.startsAt ?? null)}
              className="mt-1 h-10 w-full rounded-lg border border-movApp-border bg-white px-3 text-sm"
            />
          </label>
          <label className="text-xs font-medium text-movApp-muted">
            Expiração
            <input
              name="expiresAt"
              type="date"
              defaultValue={toDateInput(editing?.expiresAt ?? null)}
              className="mt-1 h-10 w-full rounded-lg border border-movApp-border bg-white px-3 text-sm"
            />
          </label>
          <label className="flex items-center gap-2 text-xs font-medium text-movApp-muted">
            <input name="isActive" type="checkbox" defaultChecked={editing?.isActive ?? true} />
            Ativo
          </label>
          <div className="sm:col-span-2 lg:col-span-3 flex gap-2">
            <button type="submit" className="rounded-lg bg-movApp-accent px-4 py-2 text-sm font-medium text-white">
              {isEditing ? "Guardar alterações" : "Criar voucher"}
            </button>
            {isEditing ? (
              <a href="/admin/vouchers" className="rounded-lg border border-movApp-border px-4 py-2 text-sm font-medium">
                Cancelar edição
              </a>
            ) : null}
          </div>
        </form>
      </section>

      <section className="mt-6 overflow-x-auto rounded-xl border border-movApp-border bg-movApp-paper">
        <table className="min-w-[980px] w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-movApp-border bg-movApp-subtle/50 text-[11px] font-semibold uppercase tracking-wide text-movApp-muted">
              <th className="px-3 py-2">Código</th>
              <th className="px-3 py-2">% desconto</th>
              <th className="px-3 py-2">Ativo</th>
              <th className="px-3 py-2">Início</th>
              <th className="px-3 py-2">Expiração</th>
              <th className="px-3 py-2">Usos</th>
              <th className="px-3 py-2">Criado</th>
              <th className="px-3 py-2">Ações</th>
            </tr>
          </thead>
          <tbody>
            {vouchers.map((v) => (
              <tr key={v.id} className="border-b border-movApp-border/70 last:border-0">
                <td className="px-3 py-2 font-medium text-movApp-ink">{v.code}</td>
                <td className="px-3 py-2">{v.discountPercent}%</td>
                <td className="px-3 py-2">{v.isActive ? "Sim" : "Não"}</td>
                <td className="px-3 py-2">{formatDate(v.startsAt)}</td>
                <td className="px-3 py-2">{formatDate(v.expiresAt)}</td>
                <td className="px-3 py-2">
                  {v.usageCount}
                  {v.usageLimit !== null ? ` / ${v.usageLimit}` : " / sem limite"}
                </td>
                <td className="px-3 py-2">{formatDate(v.createdAt)}</td>
                <td className="px-3 py-2">
                  <div className="flex gap-2">
                    <a href={`/admin/vouchers?edit=${encodeURIComponent(v.id)}`} className="rounded border border-movApp-border px-2 py-1 text-xs">
                      Editar
                    </a>
                    <form action={async () => {
                      "use server";
                      await setVoucherActive(v.id, !v.isActive);
                    }}>
                      <button type="submit" className="rounded border border-movApp-border px-2 py-1 text-xs">
                        {v.isActive ? "Inativar" : "Ativar"}
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}

