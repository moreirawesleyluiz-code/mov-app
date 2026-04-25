import { requireAdminPage } from "@/lib/admin-auth";
import {
  type AdminOperacaoFilters,
  loadAdminOperacaoRows,
} from "@/lib/admin-operacao-data";

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

function formatDate(value: Date | null): string {
  if (!value) return "—";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(value);
}

function formatBRLFromCents(valueCents: number | null): string {
  if (valueCents === null) return "—";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valueCents / 100);
}

export default async function AdminOperacaoPage({ searchParams }: Props) {
  await requireAdminPage();

  const sp = searchParams ? await searchParams : {};
  const filters: AdminOperacaoFilters = {
    q: firstString(sp.q),
    produto: (firstString(sp.produto) as AdminOperacaoFilters["produto"]) ?? "all",
    assinatura: (firstString(sp.assinatura) as AdminOperacaoFilters["assinatura"]) ?? "all",
    inscricao: (firstString(sp.inscricao) as AdminOperacaoFilters["inscricao"]) ?? "all",
    cobranca: (firstString(sp.cobranca) as AdminOperacaoFilters["cobranca"]) ?? "all",
  };

  const rows = await loadAdminOperacaoRows(filters);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-semibold tracking-tight text-movApp-ink">
          Operação
        </h1>
      </div>

      <form
        method="get"
        action="/admin/operacao"
        className="mt-5 space-y-4 rounded-2xl border border-movApp-border bg-movApp-paper p-5 shadow-sm"
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <label className="text-xs font-medium text-movApp-muted">
            Busca (nome/e-mail)
            <input
              type="search"
              name="q"
              defaultValue={filters.q ?? ""}
              className="mt-1 h-10 w-full rounded-lg border border-movApp-border bg-white px-3 text-sm"
            />
          </label>

          <label className="text-xs font-medium text-movApp-muted">
            Produto
            <select
              name="produto"
              defaultValue={filters.produto ?? "all"}
              className="mt-1 h-10 w-full rounded-lg border border-movApp-border bg-white px-3 text-sm"
            >
              <option value="all">Todos</option>
              <option value="se_mov">Se Mov</option>
              <option value="speed_dating">Speed Dating</option>
              <option value="outros">Outros</option>
            </select>
          </label>

          <label className="text-xs font-medium text-movApp-muted">
            Assinatura
            <select
              name="assinatura"
              defaultValue={filters.assinatura ?? "all"}
              className="mt-1 h-10 w-full rounded-lg border border-movApp-border bg-white px-3 text-sm"
            >
              <option value="all">Todos</option>
              <option value="active">active</option>
              <option value="canceled">canceled</option>
              <option value="past_due">past_due</option>
              <option value="sem_assinatura">sem_assinatura</option>
            </select>
          </label>

          <label className="text-xs font-medium text-movApp-muted">
            Inscrição
            <select
              name="inscricao"
              defaultValue={filters.inscricao ?? "all"}
              className="mt-1 h-10 w-full rounded-lg border border-movApp-border bg-white px-3 text-sm"
            >
              <option value="all">Todos</option>
              <option value="confirmed">confirmed</option>
              <option value="waitlist">waitlist</option>
              <option value="cancelled">cancelled</option>
              <option value="sem_inscricao">sem_inscricao</option>
            </select>
          </label>

          <label className="text-xs font-medium text-movApp-muted">
            Cobrança
            <select
              name="cobranca"
              defaultValue={filters.cobranca ?? "all"}
              className="mt-1 h-10 w-full rounded-lg border border-movApp-border bg-white px-3 text-sm"
            >
              <option value="all">Todos</option>
              <option value="RECEIVED">RECEIVED</option>
              <option value="PENDING">PENDING</option>
              <option value="CONFIRMED">CONFIRMED</option>
              <option value="OVERDUE">OVERDUE</option>
              <option value="sem_cobranca">sem_cobranca</option>
            </select>
          </label>
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            className="rounded-lg bg-movApp-accent px-4 py-2 text-sm font-medium text-white"
          >
            Aplicar
          </button>
          <a
            href="/admin/operacao"
            className="rounded-lg border border-movApp-border px-4 py-2 text-sm font-medium"
          >
            Limpar
          </a>
        </div>
      </form>

      <h2 className="mt-8 text-sm font-semibold uppercase tracking-wider text-movApp-muted">
        Linhas operacionais ({rows.length})
      </h2>

      {rows.length === 0 ? (
        <p className="mt-4 rounded-xl border border-movApp-border bg-movApp-paper p-4 text-sm text-movApp-muted">
          Nenhum resultado para os filtros atuais.
        </p>
      ) : (
        <div className="mt-4 overflow-x-auto rounded-xl border border-movApp-border bg-movApp-paper">
          <table className="min-w-[1500px] w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-movApp-border bg-movApp-subtle/50 text-[11px] font-semibold uppercase tracking-wide text-movApp-muted">
                <th className="px-3 py-2">Utilizador</th>
                <th className="px-3 py-2">Cidade</th>
                <th className="px-3 py-2">Produto</th>
                <th className="px-3 py-2">Evento</th>
                <th className="px-3 py-2">Inscrição</th>
                <th className="px-3 py-2">Data inscrição</th>
                <th className="px-3 py-2">Assinatura</th>
                <th className="px-3 py-2">Início assinatura</th>
                <th className="px-3 py-2">Renovação</th>
                <th className="px-3 py-2">Cobrança</th>
                <th className="px-3 py-2">Método</th>
                <th className="px-3 py-2">Valor</th>
                <th className="px-3 py-2">Data cobrança</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, idx) => (
                <tr
                  key={`${row.userId}-${row.eventId ?? "none"}-${row.registrationCreatedAt?.toISOString() ?? "reg"}-${row.chargeCreatedAt?.toISOString() ?? "chg"}-${idx}`}
                  className="border-b border-movApp-border/70 last:border-0"
                >
                  <td className="px-3 py-2 align-top">
                    <p className="font-medium text-movApp-ink">{row.userName ?? "—"}</p>
                    <p className="text-xs text-movApp-muted">{row.userEmail}</p>
                    <p className="text-[11px] text-movApp-muted">role: {row.role}</p>
                  </td>
                  <td className="px-3 py-2 align-top">{row.city ?? "—"}</td>
                  <td className="px-3 py-2 align-top">
                    <p className="font-medium text-movApp-ink">{row.productLabel}</p>
                    <p className="text-xs text-movApp-muted">
                      memberOnly: {row.eventMemberOnly === null ? "—" : row.eventMemberOnly ? "true" : "false"}
                    </p>
                    <p className="text-xs text-movApp-muted">type: {row.eventType ?? "—"}</p>
                  </td>
                  <td className="px-3 py-2 align-top">
                    <p className="text-movApp-ink">{row.eventTitle ?? "—"}</p>
                    <p className="text-xs text-movApp-muted">{row.eventId ?? "—"}</p>
                  </td>
                  <td className="px-3 py-2 align-top">
                    <p>{row.registrationStatus ?? "sem_inscricao"}</p>
                    <p className="text-xs text-movApp-muted">região: {row.registrationRegionKey ?? "—"}</p>
                  </td>
                  <td className="px-3 py-2 align-top">{formatDate(row.registrationCreatedAt)}</td>
                  <td className="px-3 py-2 align-top">
                    <p>{row.subscriptionStatus ?? "sem_assinatura"}</p>
                    <p className="text-xs text-movApp-muted">plano: {row.subscriptionPlanCode ?? "—"}</p>
                    {row.subscriptionCanceledAt ? (
                      <p className="text-xs text-movApp-muted">
                        cancelada: {formatDate(row.subscriptionCanceledAt)}
                      </p>
                    ) : null}
                  </td>
                  <td className="px-3 py-2 align-top">{formatDate(row.subscriptionStartedAt)}</td>
                  <td className="px-3 py-2 align-top">{formatDate(row.subscriptionRenewsAt)}</td>
                  <td className="px-3 py-2 align-top">{row.chargeStatus ?? "sem_cobranca"}</td>
                  <td className="px-3 py-2 align-top">{row.chargeMethod ?? "—"}</td>
                  <td className="px-3 py-2 align-top">{formatBRLFromCents(row.chargeValueCents)}</td>
                  <td className="px-3 py-2 align-top">{formatDate(row.chargeCreatedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
