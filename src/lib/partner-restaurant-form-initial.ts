import type { PartnerRestaurant } from "@prisma/client";
import { parseJsonArray } from "@/lib/dinner-prefs";
import { PARTNER_SCHEDULE_DAY_BASIS, parsePartnerSchedule } from "@/lib/partner-restaurant-schedule";
import type { PartnerRestaurantSavePayload } from "@/lib/partner-restaurant-save";

const PRICE = ["$", "$$", "$$$"] as const;

function normalizePriceTiers(raw: string): ("$" | "$$" | "$$$")[] {
  const t = parseJsonArray(raw).filter((x): x is "$" | "$$" | "$$$" =>
    (PRICE as readonly string[]).includes(x),
  );
  return t.length ? t : ["$$"];
}

export function readAudienceSummary(audienceProfileJson: string | null): string {
  if (!audienceProfileJson?.trim()) return "";
  try {
    const j = JSON.parse(audienceProfileJson) as { summary?: unknown };
    if (j && typeof j.summary === "string") return j.summary;
  } catch {
    /* texto legado não-JSON */
  }
  return audienceProfileJson.trim();
}

export function defaultPartnerSavePayload(): PartnerRestaurantSavePayload {
  return {
    name: "",
    active: true,
    partnerType: "restaurant",
    regionKey: null,
    city: null,
    neighborhood: null,
    address: null,
    locationNotes: null,
    environmentType: null,
    houseStyle: null,
    cuisineCategories: null,
    priceTierIds: ["$$"],
    experienceTypeIds: ["SE_MOV_JANTAR"],
    curationTags: [],
    audienceSummary: "",
    availabilityKeys: [],
    schedule: { schemaVersion: 2, dayBasis: PARTNER_SCHEDULE_DAY_BASIS, slots: [] },
    acceptsAllDiets: true,
    dietaryIds: [],
    dietaryFlexibility: "moderada",
    estimatedTicketCents: null,
    seatsPerTableMax: 6,
    tableCapacity: 10,
    premiumLevel: "standard",
    fitLightTables: 55,
    fitDeepTables: 55,
    fitPremiumExperience: 50,
    fitFirstEncounter: 60,
    fitExtrovertedGroup: 55,
    fitIntimateGroup: 55,
    internalContact: null,
    operationalNotes: null,
    curadoriaNotes: null,
    notes: null,
  };
}

export function partnerRestaurantRowToPayload(row: PartnerRestaurant): PartnerRestaurantSavePayload {
  const dietary = parseJsonArray(row.acceptsDietaryJson);
  const acceptsAllDiets = dietary.includes("*");
  const dietaryIds = acceptsAllDiets ? [] : dietary;

  const schedule = parsePartnerSchedule(row.scheduleJson);

  return {
    id: row.id,
    name: row.name,
    active: row.active,
    partnerType: row.partnerType as PartnerRestaurantSavePayload["partnerType"],
    regionKey: row.regionKey,
    city: row.city,
    neighborhood: row.neighborhood,
    address: row.address,
    locationNotes: row.locationNotes,
    environmentType: row.environmentType,
    houseStyle: row.houseStyle,
    cuisineCategories: row.cuisineCategories,
    priceTierIds: normalizePriceTiers(row.priceTiersJson),
    experienceTypeIds: parseJsonArray(row.experienceTypesJson),
    curationTags: parseJsonArray(row.curationTagsJson),
    audienceSummary: readAudienceSummary(row.audienceProfileJson),
    availabilityKeys: parseJsonArray(row.availabilityKeysJson),
    schedule,
    acceptsAllDiets,
    dietaryIds,
    dietaryFlexibility: row.dietaryFlexibility as PartnerRestaurantSavePayload["dietaryFlexibility"],
    estimatedTicketCents: row.estimatedTicketCents,
    seatsPerTableMax: row.seatsPerTableMax,
    tableCapacity: row.tableCapacity,
    premiumLevel: row.premiumLevel as PartnerRestaurantSavePayload["premiumLevel"],
    fitLightTables: row.fitLightTables,
    fitDeepTables: row.fitDeepTables,
    fitPremiumExperience: row.fitPremiumExperience,
    fitFirstEncounter: row.fitFirstEncounter,
    fitExtrovertedGroup: row.fitExtrovertedGroup,
    fitIntimateGroup: row.fitIntimateGroup,
    internalContact: row.internalContact,
    operationalNotes: row.operationalNotes,
    curadoriaNotes: row.curadoriaNotes,
    notes: row.notes,
  };
}
