import type { Prisma } from "@prisma/client";
import { z } from "zod";
import { partnerScheduleDocumentSchema, serializePartnerSchedule } from "@/lib/partner-restaurant-schedule";

export const partnerRestaurantSavePayloadSchema = z
  .object({
    id: z.string().cuid().optional(),
    name: z.string().min(1).max(200),
    active: z.boolean(),
    partnerType: z.enum(["restaurant", "bar", "experience_venue", "other"]).catch("restaurant"),
    regionKey: z.string().max(120).nullable().optional(),
    city: z.string().max(120).nullable().optional(),
    neighborhood: z.string().max(120).nullable().optional(),
    address: z.string().max(300).nullable().optional(),
    locationNotes: z.string().max(2000).nullable().optional(),
    environmentType: z.string().max(120).nullable().optional(),
    houseStyle: z.string().max(120).nullable().optional(),
    cuisineCategories: z.string().max(500).nullable().optional(),
    priceTierIds: z.array(z.enum(["$", "$$", "$$$"])).min(1),
    experienceTypeIds: z.array(z.string().min(1).max(40)),
    curationTags: z.array(z.string().min(1).max(60)),
    audienceSummary: z.string().max(2000).nullable().optional(),
    availabilityKeys: z.array(z.string().min(1).max(80)),
    schedule: partnerScheduleDocumentSchema,
    acceptsAllDiets: z.boolean(),
    dietaryIds: z.array(z.string().min(1).max(40)),
    dietaryFlexibility: z.enum(["alta", "moderada", "baixa"]).catch("moderada"),
    estimatedTicketCents: z.number().int().min(0).max(5_000_000).nullable().optional(),
    seatsPerTableMax: z.number().int().min(1).max(6),
    tableCapacity: z.number().int().min(1).max(500),
    premiumLevel: z.enum(["standard", "classico", "sensorial", "exclusivo"]).catch("standard"),
    fitLightTables: z.number().int().min(0).max(100),
    fitDeepTables: z.number().int().min(0).max(100),
    fitPremiumExperience: z.number().int().min(0).max(100),
    fitFirstEncounter: z.number().int().min(0).max(100),
    fitExtrovertedGroup: z.number().int().min(0).max(100),
    fitIntimateGroup: z.number().int().min(0).max(100),
    internalContact: z.string().max(300).nullable().optional(),
    operationalNotes: z.string().max(4000).nullable().optional(),
    curadoriaNotes: z.string().max(4000).nullable().optional(),
    notes: z.string().max(4000).nullable().optional(),
  })
  .superRefine((data, ctx) => {
    if (!data.acceptsAllDiets && data.dietaryIds.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Seleccione dietas aceites ou marque “aceita todas”.",
        path: ["dietaryIds"],
      });
    }
  });

export type PartnerRestaurantSavePayload = z.infer<typeof partnerRestaurantSavePayloadSchema>;

export function payloadToPrismaData(data: PartnerRestaurantSavePayload): Prisma.PartnerRestaurantUncheckedCreateInput {
  const acceptsDietaryJson = data.acceptsAllDiets ? JSON.stringify(["*"]) : JSON.stringify(data.dietaryIds);
  const experienceTypesJson =
    data.experienceTypeIds.length > 0 ? JSON.stringify(data.experienceTypeIds) : null;
  const curationTagsJson = data.curationTags.length > 0 ? JSON.stringify(data.curationTags) : null;
  const availabilityKeysJson =
    data.availabilityKeys.length > 0 ? JSON.stringify(data.availabilityKeys) : null;
  const audienceProfileJson =
    data.audienceSummary && data.audienceSummary.trim()
      ? JSON.stringify({ summary: data.audienceSummary.trim() })
      : null;
  const scheduleJson = serializePartnerSchedule(data.schedule);

  return {
    name: data.name,
    statusLabel: data.active ? "ativo" : "inativo",
    partnerType: data.partnerType,
    regionKey: data.regionKey ?? null,
    city: data.city ?? null,
    neighborhood: data.neighborhood ?? null,
    address: data.address ?? null,
    locationNotes: data.locationNotes ?? null,
    environmentType: data.environmentType ?? null,
    houseStyle: data.houseStyle ?? null,
    experienceTypesJson,
    curationTagsJson,
    audienceProfileJson,
    priceTiersJson: JSON.stringify(data.priceTierIds),
    estimatedTicketCents: data.estimatedTicketCents ?? null,
    seatsPerTableMax: data.seatsPerTableMax,
    tableCapacity: data.tableCapacity,
    acceptsDietaryJson,
    dietaryFlexibility: data.dietaryFlexibility,
    cuisineCategories: data.cuisineCategories ?? null,
    availabilityKeysJson,
    scheduleJson,
    premiumLevel: data.premiumLevel,
    fitLightTables: data.fitLightTables,
    fitDeepTables: data.fitDeepTables,
    fitPremiumExperience: data.fitPremiumExperience,
    fitFirstEncounter: data.fitFirstEncounter,
    fitExtrovertedGroup: data.fitExtrovertedGroup,
    fitIntimateGroup: data.fitIntimateGroup,
    internalContact: data.internalContact ?? null,
    operationalNotes: data.operationalNotes ?? null,
    curadoriaNotes: data.curadoriaNotes ?? null,
    notes: data.notes ?? null,
    active: data.active,
  };
}
