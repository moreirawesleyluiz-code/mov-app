import { MAX_MESA_SIZE } from "@/lib/admin-mesa-suggest";
import { getOperationalState } from "@/lib/admin-user-state";
import { DEFAULT_MOV_MATCHING_CONFIG } from "@/lib/mov-matching-config";
import { explainUserFitInTable, suggestTablesByCompatibility } from "@/lib/mov-mesa-engine";
import { buildMovMatchingProfile, parseStoredMovMatchingProfile } from "@/lib/mov-matching-profile";
import {
  buildMovReservationContext,
  type EventRegistrationRow,
  type EventRowMini,
  type MovReservationContext,
} from "@/lib/mov-reservation-context";
import type { RestaurantPickResult } from "@/lib/mov-restaurant-allocation";
import {
  quickRestaurantReservationAudit,
  RESTAURANT_ALLOCATION_LOW_CONFIDENCE_THRESHOLD,
  restaurantAllocationConfidenceLabel,
} from "@/lib/mov-restaurant-allocation";
import { parseJsonArray } from "@/lib/dinner-prefs";
import { prisma } from "@/lib/prisma";

export type SearchParamsInput = Record<string, string | string[] | undefined>;

export function firstString(v: string | string[] | undefined): string | undefined {
  if (v === undefined) return undefined;
  const s = Array.isArray(v) ? v[0] : v;
  if (typeof s !== "string") return undefined;
  const t = s.trim();
  return t === "" ? undefined : t;
}

export async function loadAdminMesasWorkspaceData(
  searchParams: SearchParamsInput | Promise<SearchParamsInput>,
) {
  const sp = searchParams instanceof Promise ? await searchParams : searchParams;
  const cityFilter = firstString(sp.city);
  const ageBandFilter = firstString(sp.ageBand);
  const sectorFilter = firstString(sp.sector);
  const energyBandFilter = firstString(sp.energyBand);
  const mesaEventFilter = firstString(sp.mesaEvent);
  const mesaRestaurantFilter = firstString(sp.mesaRestaurant);
  const noRestaurantFilter = firstString(sp.noRestaurant) === "1";
  const resRegionFilter = firstString(sp.resRegion);
  const resBudgetFilter = firstString(sp.resBudget);
  const resDietFilter = firstString(sp.resDiet);
  const conflictOnly = firstString(sp.conflict) === "1";
  const mesaStatusFilter = firstString(sp.mesaStatus);
  const lowAdherenceOnly = firstString(sp.lowAdherence) === "1";
  const resAvailFilter = firstString(sp.resAvail);
  const inactivePartnerOnly = firstString(sp.inactivePartner) === "1";

  const events = await prisma.event.findMany({
    where: { published: true, startsAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
    orderBy: { startsAt: "asc" },
    take: 40,
    select: { id: true, title: true, type: true, slug: true },
  });

  const eventsForMesaFilter = await prisma.event.findMany({
    orderBy: { startsAt: "desc" },
    take: 60,
    select: { id: true, title: true },
  });

  const restaurantOptions = await prisma.partnerRestaurant.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, active: true },
  });

  const tablesRaw = await prisma.adminCuratedTable.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    include: {
      event: { select: { id: true, title: true, type: true, memberOnly: true, startsAt: true } },
      partnerRestaurant: true,
      members: {
        orderBy: { sortOrder: "asc" },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              city: true,
              onboardingAnswers: { select: { questionId: true, answerValue: true } },
              compatibilityProfile: { select: { axesJson: true } },
            },
          },
        },
      },
    },
  });

  const eventIds = [...new Set(tablesRaw.map((t) => t.eventId).filter(Boolean))] as string[];
  const memberUserIds = [...new Set(tablesRaw.flatMap((t) => t.members.map((m) => m.userId)))];
  const regRows =
    eventIds.length && memberUserIds.length
      ? await prisma.eventRegistration.findMany({
          where: { eventId: { in: eventIds }, userId: { in: memberUserIds } },
          select: {
            eventId: true,
            userId: true,
            status: true,
            regionKey: true,
            dinnerLanguages: true,
            dinnerBudgetTiers: true,
            dietaryRestrictions: true,
            dietaryTypes: true,
            availabilitySlotsJson: true,
          },
        })
      : [];

  const opsRows =
    eventIds.length > 0
      ? await prisma.adminCuratedTable.findMany({
          where: { eventId: { in: eventIds }, partnerRestaurantId: { not: null } },
          select: {
            eventId: true,
            partnerRestaurantId: true,
            _count: { select: { members: true } },
          },
        })
      : [];
  const tableCountByEventPartner = new Map<string, number>();
  const seatCountByEventPartner = new Map<string, number>();
  for (const r of opsRows) {
    if (!r.partnerRestaurantId) continue;
    const key = `${r.eventId}:${r.partnerRestaurantId}`;
    tableCountByEventPartner.set(key, (tableCountByEventPartner.get(key) ?? 0) + 1);
    seatCountByEventPartner.set(key, (seatCountByEventPartner.get(key) ?? 0) + r._count.members);
  }

  const regMap = new Map<string, EventRegistrationRow>();
  for (const r of regRows) {
    regMap.set(`${r.eventId}:${r.userId}`, {
      eventId: r.eventId,
      status: r.status,
      regionKey: r.regionKey,
      dinnerLanguages: r.dinnerLanguages,
      dinnerBudgetTiers: r.dinnerBudgetTiers,
      dietaryRestrictions: r.dietaryRestrictions,
      dietaryTypes: r.dietaryTypes,
      availabilitySlotsJson: r.availabilitySlotsJson,
    });
  }

  const readyUsers = await prisma.user.findMany({
    where: { deletedAt: null, role: "user", isTestUser: false },
    select: {
      id: true,
      name: true,
      email: true,
      city: true,
      onboardingAnswers: { select: { questionId: true, answerValue: true } },
      compatibilityProfile: { select: { axesJson: true } },
    },
  });

  const allocatedIds = new Set(
    (await prisma.adminCuratedTableMember.findMany({ select: { userId: true } })).map((m) => m.userId),
  );

  const unallocatedRaw: {
    id: string;
    name: string | null;
    email: string;
    city: string | null;
    shortLabel: string;
  }[] = [];

  const profileByUserId = new Map<string, ReturnType<typeof buildMovMatchingProfile>>();
  for (const u of readyUsers) {
    if (getOperationalState(u.onboardingAnswers.length) !== "ready") continue;
    const profile =
      parseStoredMovMatchingProfile(u.compatibilityProfile?.axesJson) ??
      buildMovMatchingProfile({
        answers: Object.fromEntries(u.onboardingAnswers.map((a) => [a.questionId, a.answerValue])) as Record<string, string>,
        cityName: u.city,
      });
    profileByUserId.set(u.id, profile);
    if (allocatedIds.has(u.id)) continue;
    unallocatedRaw.push({
      id: u.id,
      name: u.name,
      email: u.email,
      city: u.city,
      shortLabel: "â€”",
    });
  }

  const unallocated = unallocatedRaw.filter((u) => {
    const p = profileByUserId.get(u.id);
    if (!p) return false;
    if (cityFilter && cityFilter !== "__all__" && (p.city ?? "") !== cityFilter) return false;
    if (ageBandFilter && ageBandFilter !== "__all__" && p.ageBand !== ageBandFilter) return false;
    if (sectorFilter && sectorFilter !== "__all__" && (p.sector ?? "") !== sectorFilter) return false;
    if (energyBandFilter && energyBandFilter !== "__all__" && p.energyBand !== energyBandFilter) return false;
    return true;
  });

  const pickerUsers = readyUsers
    .filter((u) => getOperationalState(u.onboardingAnswers.length) === "ready")
    .filter((u) => {
      const p = profileByUserId.get(u.id);
      if (!p) return false;
      if (cityFilter && cityFilter !== "__all__" && (p.city ?? "") !== cityFilter) return false;
      if (ageBandFilter && ageBandFilter !== "__all__" && p.ageBand !== ageBandFilter) return false;
      if (sectorFilter && sectorFilter !== "__all__" && (p.sector ?? "") !== sectorFilter) return false;
      if (energyBandFilter && energyBandFilter !== "__all__" && p.energyBand !== energyBandFilter) return false;
      return true;
    })
    .map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      shortLabel: profileByUserId.get(u.id)?.energyBand ?? (u.name ?? u.email),
    }));

  const mesasUnfiltered = tablesRaw.map((t) => {
    const eventMini: EventRowMini | null =
      t.eventId && t.event ? { id: t.event.id, type: t.event.type, memberOnly: t.event.memberOnly } : null;

    const candidateRows = t.members.map((m) => {
      const profile =
        parseStoredMovMatchingProfile(m.user.compatibilityProfile?.axesJson) ??
        buildMovMatchingProfile({
          answers: Object.fromEntries(m.user.onboardingAnswers.map((a) => [a.questionId, a.answerValue])) as Record<string, string>,
          cityName: m.user.city,
        });
      const regRow = t.eventId ? regMap.get(`${t.eventId}:${m.userId}`) ?? null : null;
      const reservation =
        eventMini && regRow ? buildMovReservationContext(eventMini, regRow) : null;
      return {
        memberId: m.id,
        userId: m.userId,
        pinned: m.pinned,
        name: m.user.name,
        email: m.user.email,
        city: m.user.city,
        profile,
        reservation,
      };
    });

    const memberRowsDetailed = candidateRows.map((m) => {
      const peers = candidateRows
        .filter((x) => x.userId !== m.userId)
        .map((x) => ({ userId: x.userId, profile: x.profile, reservation: x.reservation }));
      const fit = explainUserFitInTable({ userId: m.userId, profile: m.profile, reservation: m.reservation }, peers);
      return {
        memberId: m.memberId,
        userId: m.userId,
        pinned: m.pinned,
        name: m.name,
        email: m.email,
        city: m.city,
        profile: m.profile,
        reservation: m.reservation,
        fitScore: fit.score,
        fitAttention: fit.attention,
        tagsPreview: fit.line,
      };
    });
    const weakestMemberDetail =
      memberRowsDetailed.length > 1
        ? memberRowsDetailed.reduce((a, b) => (a.fitScore <= b.fitScore ? a : b))
        : null;

    const tableSuggestions = suggestTablesByCompatibility(
      candidateRows.map((m) => ({ userId: m.userId, profile: m.profile, reservation: m.reservation })),
      {
        ...DEFAULT_MOV_MATCHING_CONFIG,
        hardRules: { ...DEFAULT_MOV_MATCHING_CONFIG.hardRules, maxMesaSize: MAX_MESA_SIZE },
      },
    );
    const evalTable = tableSuggestions[0]?.explanation ?? {
      line: `${candidateRows.length} participante(s) nesta mesa.`,
      alert: null,
      level: "medio" as const,
      scores: {
        affinity: 60,
        healthyDiversity: 60,
        socialFluency: 60,
        practicalViability: 60,
        finalScore: 60,
      },
    };

    let allocationRestaurantLine: string | null = null;
    let restaurantPick: RestaurantPickResult | null = null;
    let manualRestaurant = false;
    if (t.allocationMetaJson) {
      try {
        const meta = JSON.parse(t.allocationMetaJson) as {
          restaurantPick?: RestaurantPickResult;
          manualRestaurant?: boolean;
        };
        restaurantPick = meta.restaurantPick ?? null;
        allocationRestaurantLine = meta.restaurantPick?.line ?? null;
        manualRestaurant = Boolean(meta.manualRestaurant);
      } catch {
        allocationRestaurantLine = null;
      }
    }

    const regsForAudit: MovReservationContext[] = candidateRows.map((m) => m.reservation).filter(Boolean) as MovReservationContext[];
    const partnerRow = t.partnerRestaurant;
    const eventPartnerKey =
      t.eventId && t.partnerRestaurantId ? `${t.eventId}:${t.partnerRestaurantId}` : null;
    const tablesInEventForPartner = eventPartnerKey ? (tableCountByEventPartner.get(eventPartnerKey) ?? 0) : 0;
    const seatsInEventForPartner = eventPartnerKey ? (seatCountByEventPartner.get(eventPartnerKey) ?? 0) : 0;

    const audit = quickRestaurantReservationAudit(partnerRow, regsForAudit, candidateRows.length, {
      eventStartsAt: t.event?.startsAt ?? null,
      scheduleJson: partnerRow?.scheduleJson ?? null,
      tablesAllocatedInEvent: tablesInEventForPartner,
      seatsCommittedInEvent: seatsInEventForPartner,
      tableCapacity: partnerRow?.tableCapacity ?? undefined,
    });

    const mismatchSuggested = Boolean(
      !manualRestaurant &&
        restaurantPick?.restaurantId &&
        t.partnerRestaurantId &&
        restaurantPick.restaurantId !== t.partnerRestaurantId,
    );

    const manualVsSuggestion = Boolean(
      manualRestaurant &&
        restaurantPick?.restaurantId &&
        t.partnerRestaurantId &&
        restaurantPick.restaurantId !== t.partnerRestaurantId,
    );

    const lowAdherence = Boolean(
      partnerRow &&
        restaurantPick &&
        t.partnerRestaurantId &&
        restaurantPick.restaurantId === t.partnerRestaurantId &&
        restaurantPick.aggregateScore < RESTAURANT_ALLOCATION_LOW_CONFIDENCE_THRESHOLD,
    );

    const availabilitySlotsOnTable = [...new Set(regsForAudit.flatMap((r) => r.availabilitySlots))].filter(Boolean);

    const conflictLabels = [
      ...audit.labels,
      ...(lowAdherence ? (["aderencia-baixa"] as const) : []),
      ...(mismatchSuggested ? (["sugestao-automatica-divergente"] as const) : []),
      ...(manualVsSuggestion ? (["manual-vs-sugestao"] as const) : []),
      ...(!t.partnerRestaurantId && t.eventId ? (["sem-restaurante"] as const) : []),
    ];
    const conflictLabelsUnique = [...new Set(conflictLabels)];

    const operationalAlertParts: string[] = [];
    if (!t.partnerRestaurantId && t.eventId) operationalAlertParts.push("Mesa com evento mas sem restaurante atribuÃ­do.");
    if (audit.reasons.length) operationalAlertParts.push(...audit.reasons);
    if (mismatchSuggested) operationalAlertParts.push("Restaurante atribuÃ­do difere da Ãºltima sugestÃ£o automÃ¡tica.");
    if (manualVsSuggestion) operationalAlertParts.push("Curadoria manual: restaurante atribuÃ­do difere da Ãºltima sugestÃ£o automÃ¡tica.");
    if (manualRestaurant && !manualVsSuggestion) operationalAlertParts.push("Restaurante definido manualmente pelo admin.");
    if (lowAdherence) operationalAlertParts.push("AderÃªncia da Ãºltima sugestÃ£o automÃ¡tica estÃ¡ baixa â€” rever encaixe operacional.");

    const hasConflict =
      audit.reasons.length > 0 ||
      mismatchSuggested ||
      manualVsSuggestion ||
      lowAdherence ||
      Boolean(!t.partnerRestaurantId && t.eventId);

    return {
      id: t.id,
      name: t.name,
      status: t.status,
      sortOrder: t.sortOrder,
      eventId: t.eventId,
      eventTitle: t.event?.title ?? null,
      partnerRestaurantId: t.partnerRestaurant?.id ?? null,
      partnerRestaurantName: t.partnerRestaurant?.name ?? null,
      allocationRestaurantLine,
      restaurantPick,
      manualRestaurant,
      operationalAlert: operationalAlertParts.length ? operationalAlertParts.join(" ") : null,
      conflictLabels: conflictLabelsUnique,
      hasConflict,
      hasLowAdherence: lowAdherence,
      partnerActive: partnerRow?.active ?? null,
      availabilitySlotsOnTable,
      regionKeysOnTable: [...new Set(regsForAudit.map((r) => r.regionKey).filter(Boolean))] as string[],
      budgetTiersUnion: [...new Set(regsForAudit.flatMap((r) => r.budgetTiers))],
      dietaryUnion: [...new Set(regsForAudit.flatMap((r) => (r.dietaryRestrictions ? r.dietaryTypes : [])))],
      mesaFormationLine: evalTable.line,
      tableCompatibilityScores: evalTable.scores,
      restaurantConfidence: restaurantAllocationConfidenceLabel(restaurantPick?.aggregateScore ?? null),
      weakestMember:
        weakestMemberDetail && memberRowsDetailed.length > 1
          ? {
              name: weakestMemberDetail.name,
              score: weakestMemberDetail.fitScore,
              attention: weakestMemberDetail.fitAttention,
            }
          : null,
      members: memberRowsDetailed.map((m) => ({
        memberId: m.memberId,
        userId: m.userId,
        pinned: m.pinned,
        name: m.name,
        email: m.email,
        city: m.city,
        shortLabel: `${m.profile.ageBand} · ${m.profile.energyBand}`,
        tagsPreview: m.tagsPreview,
        fitScore: m.fitScore,
        fitAttention: m.fitAttention,
      })),
      summaryLine: `${evalTable.line} Score geral ${evalTable.scores.finalScore}/100.${
        allocationRestaurantLine ? ` ${allocationRestaurantLine}` : ""
      }`,
      summaryAlert: evalTable.alert as string | null,
    };
  });

  const mesas = mesasUnfiltered.filter((m) => {
    if (mesaEventFilter && mesaEventFilter !== "__all__" && m.eventId !== mesaEventFilter) return false;
    if (mesaRestaurantFilter && mesaRestaurantFilter !== "__all__" && m.partnerRestaurantId !== mesaRestaurantFilter) {
      return false;
    }
    if (noRestaurantFilter && m.partnerRestaurantId) return false;
    if (resRegionFilter && resRegionFilter !== "__all__") {
      if (!m.regionKeysOnTable.includes(resRegionFilter)) return false;
    }
    if (resBudgetFilter && resBudgetFilter !== "__all__") {
      if (!m.budgetTiersUnion.includes(resBudgetFilter)) return false;
    }
    if (resDietFilter && resDietFilter !== "__all__") {
      if (!m.dietaryUnion.includes(resDietFilter)) return false;
    }
    if (conflictOnly && !m.hasConflict) return false;
    if (mesaStatusFilter && mesaStatusFilter !== "__all__" && m.status !== mesaStatusFilter) return false;
    if (lowAdherenceOnly && !m.hasLowAdherence) return false;
    if (inactivePartnerOnly && !(m.partnerRestaurantId && m.partnerActive === false)) return false;
    if (resAvailFilter && resAvailFilter !== "__all__") {
      if (resAvailFilter === "__sem_slots__") {
        if ((m.availabilitySlotsOnTable ?? []).length > 0) return false;
      } else if (!(m.availabilitySlotsOnTable ?? []).includes(resAvailFilter)) return false;
    }
    return true;
  });

  const tableOptions = mesas.map((m) => ({ id: m.id, name: m.name }));
  const cities = [...new Set([...profileByUserId.values()].map((p) => p.city).filter(Boolean))].sort();
  const sectors = [...new Set([...profileByUserId.values()].map((p) => p.sector).filter(Boolean))].sort();

  const regionKeysForFilter = [...new Set(regRows.map((r) => r.regionKey).filter(Boolean))] as string[];
  const availabilitySlotsForFilter = [
    ...new Set(regRows.flatMap((r) => parseJsonArray(r.availabilitySlotsJson))),
  ]
    .filter(Boolean)
    .sort();

  return {
    cityFilter, ageBandFilter, sectorFilter, energyBandFilter,
    mesaEventFilter, mesaRestaurantFilter, noRestaurantFilter, resRegionFilter, resBudgetFilter, resDietFilter,
    conflictOnly, mesaStatusFilter, lowAdherenceOnly, resAvailFilter, inactivePartnerOnly,
    events, eventsForMesaFilter, restaurantOptions, mesas, unallocated, pickerUsers, tableOptions,
    cities, sectors, regionKeysForFilter, availabilitySlotsForFilter,
  };
}

