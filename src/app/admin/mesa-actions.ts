"use server";

import { revalidatePath } from "next/cache";
import { assertAdminRole } from "@/lib/admin-auth";
import { partitionIntoMesas, MAX_MESA_SIZE } from "@/lib/admin-mesa-suggest";
import { getOperationalState } from "@/lib/admin-user-state";
import { answersRecordFromRows, buildMovAdminProfile } from "@/lib/mov-admin-profile";
import { prisma } from "@/lib/prisma";

async function assertTableCapacity(tableId: string) {
  const n = await prisma.adminCuratedTableMember.count({ where: { tableId } });
  if (n >= MAX_MESA_SIZE) throw new Error(`Esta mesa já tem ${MAX_MESA_SIZE} pessoas (máximo).`);
}

export async function createMesa(name: string) {
  await assertAdminRole();
  const trimmed = name.trim() || "Nova mesa";
  const maxOrder = await prisma.adminCuratedTable.aggregate({ _max: { sortOrder: true } });
  await prisma.adminCuratedTable.create({
    data: {
      name: trimmed,
      sortOrder: (maxOrder._max.sortOrder ?? 0) + 1,
      status: "draft",
    },
  });
  revalidatePath("/admin/mesas");
}

export async function deleteMesa(tableId: string) {
  await assertAdminRole();
  await prisma.adminCuratedTable.delete({ where: { id: tableId } });
  revalidatePath("/admin/mesas");
}

export async function setMesaStatus(tableId: string, status: "draft" | "finalized") {
  await assertAdminRole();
  await prisma.adminCuratedTable.update({ where: { id: tableId }, data: { status } });
  revalidatePath("/admin/mesas");
}

export async function addMemberToMesa(tableId: string, userId: string) {
  await assertAdminRole();
  const user = await prisma.user.findFirst({
    where: { id: userId, deletedAt: null },
    select: { id: true, role: true },
  });
  if (!user) throw new Error("Participante não encontrado ou inativo.");
  const existing = await prisma.adminCuratedTableMember.findUnique({ where: { userId } });
  if (existing && existing.tableId !== tableId) {
    throw new Error("Este participante já está noutra mesa. Remova primeiro ou mova.");
  }
  if (existing?.tableId === tableId) return;
  await assertTableCapacity(tableId);
  await prisma.adminCuratedTableMember.create({
    data: { tableId, userId, pinned: false },
  });
  revalidatePath("/admin/mesas");
  revalidatePath("/admin");
}

export async function removeMember(memberId: string) {
  await assertAdminRole();
  await prisma.adminCuratedTableMember.delete({ where: { id: memberId } });
  revalidatePath("/admin/mesas");
  revalidatePath("/admin");
}

export async function moveMemberToMesa(userId: string, targetTableId: string | null) {
  await assertAdminRole();
  const row = await prisma.adminCuratedTableMember.findUnique({ where: { userId } });
  if (!row) throw new Error("Participante não está em nenhuma mesa.");
  if (targetTableId === null) {
    await prisma.adminCuratedTableMember.delete({ where: { id: row.id } });
    revalidatePath("/admin/mesas");
    revalidatePath("/admin");
    return;
  }
  if (row.tableId === targetTableId) return;
  const countTarget = await prisma.adminCuratedTableMember.count({ where: { tableId: targetTableId } });
  if (row.tableId !== targetTableId && countTarget >= MAX_MESA_SIZE) {
    throw new Error("Mesa cheia (máx. 6).");
  }
  await prisma.adminCuratedTableMember.update({
    where: { id: row.id },
    data: { tableId: targetTableId },
  });
  revalidatePath("/admin/mesas");
  revalidatePath("/admin");
}

export async function setMemberPinned(memberId: string, pinned: boolean) {
  await assertAdminRole();
  await prisma.adminCuratedTableMember.update({
    where: { id: memberId },
    data: { pinned },
  });
  revalidatePath("/admin/mesas");
}

async function loadEnergyRows(userIds: string[]) {
  const rows: { userId: string; energy: number }[] = [];
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: {
      id: true,
      onboardingAnswers: { select: { questionId: true, answerValue: true } },
    },
  });
  for (const u of users) {
    const profile = buildMovAdminProfile(answersRecordFromRows(u.onboardingAnswers));
    const es = profile.axes.find((a) => a.key === "energiaSocial")?.score;
    rows.push({ userId: u.id, energy: es ?? 50 });
  }
  return rows;
}

/** Apenas participantes prontos para curadoria e sem mesa — cria mesas novas "Auto N". */
export async function suggestMesasForUnallocated() {
  await assertAdminRole();
  const allUsers = await prisma.user.findMany({
    where: { deletedAt: null, role: "user" },
    select: {
      id: true,
      onboardingAnswers: { select: { questionId: true } },
    },
  });
  const allocated = new Set(
    (await prisma.adminCuratedTableMember.findMany({ select: { userId: true } })).map((m) => m.userId),
  );
  const unallocated: string[] = [];
  for (const u of allUsers) {
    const st = getOperationalState(u.onboardingAnswers.length);
    if (st !== "ready") continue;
    if (!allocated.has(u.id)) unallocated.push(u.id);
  }
  if (unallocated.length === 0) return { created: 0, message: "Não há participantes prontos e sem mesa." };

  const energyRows = await loadEnergyRows(unallocated);
  const groups = partitionIntoMesas(energyRows, MAX_MESA_SIZE);
  const baseOrder = (await prisma.adminCuratedTable.aggregate({ _max: { sortOrder: true } }))._max.sortOrder ?? 0;

  let n = 0;
  await prisma.$transaction(async (tx) => {
    for (let i = 0; i < groups.length; i++) {
      const ids = groups[i]!;
      const t = await tx.adminCuratedTable.create({
        data: {
          name: `Sugestão auto ${baseOrder + i + 1}`,
          sortOrder: baseOrder + i + 1,
          status: "draft",
        },
      });
      for (const uid of ids) {
        await tx.adminCuratedTableMember.create({
          data: { tableId: t.id, userId: uid, pinned: false },
        });
      }
      n++;
    }
  });

  revalidatePath("/admin/mesas");
  return { created: n, message: `${n} mesa(s) sugerida(s) para ${unallocated.length} participante(s).` };
}

/** Remove vínculos não fixados e volta a agrupar esses participantes em mesas novas. Participantes fixados mantêm-se. */
export async function recalculateNonPinnedMesas() {
  await assertAdminRole();
  await prisma.adminCuratedTableMember.deleteMany({ where: { pinned: false } });

  const allUsers = await prisma.user.findMany({
    where: { deletedAt: null, role: "user" },
    select: {
      id: true,
      onboardingAnswers: { select: { questionId: true } },
    },
  });
  const allocatedAfter = new Set(
    (await prisma.adminCuratedTableMember.findMany({ select: { userId: true } })).map((m) => m.userId),
  );
  const pool: string[] = [];
  for (const u of allUsers) {
    if (getOperationalState(u.onboardingAnswers.length) !== "ready") continue;
    if (!allocatedAfter.has(u.id)) pool.push(u.id);
  }

  if (pool.length === 0) {
    revalidatePath("/admin/mesas");
    return { created: 0, message: "Nenhum participante pronto para realocar após limpar não fixados." };
  }

  const energyRows = await loadEnergyRows(pool);
  const groups = partitionIntoMesas(energyRows, MAX_MESA_SIZE);
  const baseOrder = (await prisma.adminCuratedTable.aggregate({ _max: { sortOrder: true } }))._max.sortOrder ?? 0;

  let n = 0;
  await prisma.$transaction(async (tx) => {
    for (let i = 0; i < groups.length; i++) {
      const ids = groups[i]!;
      const t = await tx.adminCuratedTable.create({
        data: {
          name: `Recalculo ${baseOrder + i + 1}`,
          sortOrder: baseOrder + i + 1,
          status: "draft",
        },
      });
      for (const uid of ids) {
        await tx.adminCuratedTableMember.create({
          data: { tableId: t.id, userId: uid, pinned: false },
        });
      }
      n++;
    }
  });

  revalidatePath("/admin/mesas");
  return { created: n, message: `${n} mesa(s) gerada(s) com ${pool.length} participante(s) realocados.` };
}
