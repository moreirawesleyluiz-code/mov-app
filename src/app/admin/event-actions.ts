"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { assertAdminRole } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

type ProductLine = "SE_MOV" | "SPEED_DATING";
type SeMovType = "SE_MOV_JANTAR" | "SE_MOV_CAFE" | "SE_MOV_EXODO";
type SpeedDatingType = "CLASSICO" | "SENSORIAL" | "EXCLUSIVO";

function parseProductLine(raw: FormDataEntryValue | null): ProductLine {
  const value = typeof raw === "string" ? raw : "";
  if (value === "SE_MOV" || value === "SPEED_DATING") return value;
  throw new Error("Linha do produto inválida.");
}

function parseEventType(raw: FormDataEntryValue | null, productLine: ProductLine): SeMovType | SpeedDatingType {
  const value = typeof raw === "string" ? raw : "";
  const seMovTypes: SeMovType[] = ["SE_MOV_JANTAR", "SE_MOV_CAFE", "SE_MOV_EXODO"];
  const speedTypes: SpeedDatingType[] = ["CLASSICO", "SENSORIAL", "EXCLUSIVO"];

  if (productLine === "SE_MOV" && seMovTypes.includes(value as SeMovType)) return value as SeMovType;
  if (productLine === "SPEED_DATING" && speedTypes.includes(value as SpeedDatingType)) return value as SpeedDatingType;
  throw new Error("Tipo de experiência inválido para a linha selecionada.");
}

function parseStartsAt(formData: FormData): Date {
  const dateBrRaw = formData.get("startDateBr");
  const time24Raw = formData.get("startTime24");
  const dateBr = typeof dateBrRaw === "string" ? dateBrRaw.trim() : "";
  const time24 = typeof time24Raw === "string" ? time24Raw.trim() : "";

  if (dateBr || time24) {
    const dateMatch = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(dateBr);
    const timeMatch = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(time24);
    if (!dateMatch || !timeMatch) {
      throw new Error("Preencha data e hora no formato dd/mm/aaaa e HH:mm.");
    }
    const [, dd, mm, yyyy] = dateMatch;
    const [, hh, min] = timeMatch;
    /** Operação local MOV em São Paulo (UTC-03): persistimos em ISO consistente no backend. */
    const parsed = new Date(`${yyyy}-${mm}-${dd}T${hh}:${min}:00-03:00`);
    if (Number.isNaN(parsed.getTime())) throw new Error("Data/hora inválida.");
    return parsed;
  }

  /** Compatibilidade com payload legado (`datetime-local`) em ambientes já abertos. */
  const raw = formData.get("startsAt");
  const value = typeof raw === "string" ? raw : "";
  const fallback = new Date(value);
  if (!value || Number.isNaN(fallback.getTime())) throw new Error("Data/hora inválida.");
  return fallback;
}

function parseOptionalInt(raw: FormDataEntryValue | null): number | null {
  const value = typeof raw === "string" ? raw.trim() : "";
  if (!value) return null;
  const n = Number(value);
  if (!Number.isInteger(n) || n < 0) throw new Error("Valor numérico inválido.");
  return n;
}

function parseRequiredText(raw: FormDataEntryValue | null, label: string): string {
  const value = typeof raw === "string" ? raw.trim() : "";
  if (!value) throw new Error(`${label} é obrigatório.`);
  return value;
}

function parseOptionalText(raw: FormDataEntryValue | null): string | null {
  const value = typeof raw === "string" ? raw.trim() : "";
  return value || null;
}

function revalidateEventSurfaces(eventId?: string) {
  revalidatePath("/admin/eventos");
  revalidatePath("/app/agenda");
  revalidatePath("/app/eventos");
  revalidatePath("/app/experiencias");
  revalidatePath("/app/ex/datas");
  revalidatePath("/app/ex/datas/sensorial");
  if (eventId) {
    revalidatePath(`/app/agenda/${eventId}/regiao`);
    revalidatePath(`/app/agenda/${eventId}/preferencias`);
    revalidatePath(`/app/agenda/${eventId}/resumo`);
  }
}

export async function upsertAdminEvent(formData: FormData) {
  await assertAdminRole();

  const idRaw = formData.get("id");
  const id = typeof idRaw === "string" && idRaw.trim() ? idRaw.trim() : null;
  const title = parseRequiredText(formData.get("title"), "Nome do evento");
  const slug = parseRequiredText(formData.get("slug"), "Slug");
  const productLine = parseProductLine(formData.get("productLine"));
  const type = parseEventType(formData.get("eventType"), productLine);
  const startsAt = parseStartsAt(formData);
  const description = parseOptionalText(formData.get("description"));
  const venueName = parseOptionalText(formData.get("venueName"));
  const venueAddress = parseOptionalText(formData.get("venueAddress"));
  const priceCents = parseOptionalInt(formData.get("priceCents")) ?? 0;
  const capacity = parseOptionalInt(formData.get("capacity"));
  const published = formData.getAll("published").includes("on");

  const payload = {
    title,
    slug,
    description,
    type,
    startsAt,
    venueName,
    venueAddress,
    priceCents,
    capacity,
    memberOnly: productLine === "SE_MOV",
    published,
  };

  const existingWithSlug = await prisma.event.findFirst({
    where: {
      slug,
      ...(id ? { NOT: { id } } : {}),
    },
    select: { id: true },
  });

  if (existingWithSlug) {
    redirect("/admin/eventos?error=slug-duplicado");
  }

  if (id) {
    await prisma.event.update({ where: { id }, data: payload });
    revalidateEventSurfaces(id);
    return;
  }

  const created = await prisma.event.create({ data: payload });
  revalidateEventSurfaces(created.id);
}

export async function setEventPublished(id: string, published: boolean) {
  await assertAdminRole();
  await prisma.event.update({ where: { id }, data: { published } });
  revalidateEventSurfaces(id);
}
