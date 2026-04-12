import { MAX_MESA_SIZE } from "@/lib/admin-mesa-suggest";
import { getOperationalState } from "@/lib/admin-user-state";
import { prisma } from "@/lib/prisma";
import { AdminMesasPanel } from "@/components/admin/admin-mesas-panel";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * Mesas mínimas estáveis — sem `buildMovAdminProfile` / curadoria no RSC.
 * Resumo visual usa placeholders; ações servidor (sugestão) ainda podem usar perfil internamente.
 */
export default async function AdminMesasPage() {
  const tablesRaw = await prisma.adminCuratedTable.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    include: {
      members: {
        orderBy: { sortOrder: "asc" },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              city: true,
            },
          },
        },
      },
    },
  });

  const mesas = tablesRaw.map((t) => ({
    id: t.id,
    name: t.name,
    status: t.status,
    sortOrder: t.sortOrder,
    members: t.members.map((m) => ({
      memberId: m.id,
      userId: m.userId,
      pinned: m.pinned,
      name: m.user.name,
      email: m.user.email,
      city: m.user.city,
      shortLabel: "—",
      tagsPreview: "",
    })),
    summaryLine: `${t.members.length} participante(s) nesta mesa.`,
    summaryAlert: null as string | null,
  }));

  const readyUsers = await prisma.user.findMany({
    where: { deletedAt: null, role: "user" },
    select: {
      id: true,
      name: true,
      email: true,
      city: true,
      onboardingAnswers: { select: { questionId: true } },
    },
  });

  const allocatedIds = new Set(
    (await prisma.adminCuratedTableMember.findMany({ select: { userId: true } })).map((m) => m.userId),
  );

  const unallocated: {
    id: string;
    name: string | null;
    email: string;
    city: string | null;
    shortLabel: string;
  }[] = [];

  for (const u of readyUsers) {
    if (getOperationalState(u.onboardingAnswers.length) !== "ready") continue;
    if (allocatedIds.has(u.id)) continue;
    unallocated.push({
      id: u.id,
      name: u.name,
      email: u.email,
      city: u.city,
      shortLabel: "—",
    });
  }

  const pickerUsers = readyUsers
    .filter((u) => getOperationalState(u.onboardingAnswers.length) === "ready")
    .map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      shortLabel: u.name ?? u.email,
    }));

  const tableOptions = mesas.map((m) => ({ id: m.id, name: m.name }));

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-movApp-ink">Montagem de mesas</h1>
      <p className="mt-2 text-sm text-movApp-muted">
        Vista mínima estável. Máximo {MAX_MESA_SIZE} pessoas por mesa. Sugestão automática disponível nos botões
        abaixo.
      </p>
      <AdminMesasPanel
        mesas={mesas}
        unallocated={unallocated}
        tableOptions={tableOptions}
        pickerUsers={pickerUsers}
      />
    </div>
  );
}
