"use client";

import Link from "next/link";
import { AdminDeleteUserButton } from "@/components/admin/admin-delete-user-button";
import { AdminTableHorizontalScroll } from "@/components/admin/admin-table-horizontal-scroll";
import { adminUserDetailHref } from "@/lib/admin-list-href";
import { getOperationalState, operationalStateLabel } from "@/lib/admin-user-state";
import { buildMovAdminTableAssembly, movAdminListSummaryLines } from "@/lib/mov-admin-curation";
import { answersRecordFromRows, buildMovAdminProfile } from "@/lib/mov-admin-profile";

export type AdminDashboardUserRow = {
  id: string;
  name: string | null;
  email: string;
  city: string | null;
  role: string;
  isTestUser?: boolean;
  subscription: { status: string; planCode: string } | null;
  onboardingAnswers: Array<{ questionId: string; answerValue: string }>;
};

type Props = {
  users: AdminDashboardUserRow[];
  searchParams: Record<string, string | string[] | undefined>;
};

/**
 * Tabela operacional: cálculo MOV no cliente (fora do RSC de `/admin`).
 */
export function AdminDashboardUserList({ users, searchParams }: Props) {
  const sp = searchParams;

  if (users.length === 0) {
    return <p className="mt-6 text-sm text-movApp-muted">Nenhum utilizador.</p>;
  }

  return (
    <AdminTableHorizontalScroll className="mt-4 rounded-xl border border-movApp-border bg-movApp-paper">
      <table className="min-w-[1180px] w-full border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-movApp-border bg-movApp-subtle/50 text-[11px] font-semibold uppercase tracking-wide text-movApp-muted">
            <th className="px-3 py-2">Nome</th>
            <th className="px-3 py-2">Cidade</th>
            <th className="px-3 py-2">Estado</th>
            <th className="px-3 py-2">Assinatura</th>
            <th className="px-3 py-2">Perfil MOV</th>
            <th className="px-3 py-2">Tags</th>
            <th className="px-3 py-2">Mesa / ambiente</th>
            <th className="px-3 py-2">Evento</th>
            <th className="whitespace-nowrap px-3 py-2">Ações</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => {
            const profile = buildMovAdminProfile(answersRecordFromRows(u.onboardingAnswers));
            const tableAssembly = buildMovAdminTableAssembly(profile);
            const lines = movAdminListSummaryLines(profile, tableAssembly);
            const opState = getOperationalState(u.onboardingAnswers.length);
            const tagsStr = profile.tags.length ? profile.tags.join(", ") : "—";
            const mesaAmbiente = `${lines.tableSize} · ${lines.environment}`;
            const sub = u.subscription?.status ?? "—";

            return (
              <tr key={u.id} className="border-b border-movApp-border/70 last:border-0">
                <td className="px-3 py-2 align-top">
                  <Link
                    href={adminUserDetailHref(u.id, sp)}
                    className="font-medium text-movApp-accent hover:underline"
                  >
                    {u.name ?? "—"}
                  </Link>
                  <div className="text-[11px] text-movApp-muted">{u.email}</div>
                  {u.isTestUser ? (
                    <div className="text-[10px] font-medium text-amber-800">Conta de teste (E2E/QA)</div>
                  ) : null}
                  <Link
                    href={adminUserDetailHref(u.id, sp, "perfil-mov")}
                    className="text-[11px] font-medium text-movApp-accent hover:underline"
                  >
                    Ver perfil MOV
                  </Link>
                </td>
                <td className="px-3 py-2 align-top text-movApp-ink">{u.city ?? "—"}</td>
                <td className="px-3 py-2 align-top text-xs">{operationalStateLabel(opState)}</td>
                <td className="px-3 py-2 align-top text-xs">{sub}</td>
                <td className="max-w-[140px] px-3 py-2 align-top text-xs leading-snug">{profile.shortLabel}</td>
                <td className="max-w-[180px] px-3 py-2 align-top text-[11px] leading-snug text-movApp-ink">
                  {tagsStr}
                </td>
                <td className="max-w-[200px] px-3 py-2 align-top text-[11px] leading-snug text-movApp-muted">
                  {mesaAmbiente}
                  <div className="mt-0.5 text-movApp-ink/90">{lines.mesaShort}</div>
                </td>
                <td className="max-w-[200px] px-3 py-2 align-top text-[11px] leading-snug text-movApp-muted">
                  {lines.eventShort}
                </td>
                <td className="whitespace-nowrap px-3 py-2 align-top">
                  <AdminDeleteUserButton userId={u.id} isAdmin={u.role === "admin"} variant="table" />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </AdminTableHorizontalScroll>
  );
}
