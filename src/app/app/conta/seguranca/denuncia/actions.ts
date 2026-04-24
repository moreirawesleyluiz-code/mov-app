"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

function redirectWithError(message: string): never {
  redirect(`/app/conta/seguranca/denuncia?error=${encodeURIComponent(message)}`);
}

function parseEvidenceLinks(raw: string): string[] {
  const tokens = raw
    .split(/\r?\n|,/g)
    .map((s) => s.trim())
    .filter(Boolean);
  if (tokens.length === 0) return [];
  if (tokens.length > 5) {
    redirectWithError("Adicione no máximo 5 links de evidência.");
  }
  const urls = tokens.map((token) => {
    try {
      const u = new URL(token);
      if (u.protocol !== "http:" && u.protocol !== "https:") {
        redirectWithError("Os links de evidência devem começar com http:// ou https://.");
      }
      return u.toString();
    } catch {
      redirectWithError("Um ou mais links de evidência são inválidos.");
    }
  });
  return [...new Set(urls)];
}

export async function submitSafetyReport(formData: FormData) {
  const session = await auth();
  const reporterUserId = session?.user?.id;
  if (!reporterUserId) redirect("/login?callbackUrl=/app/conta/seguranca/denuncia");

  const category = String(formData.get("category") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const eventIdRaw = String(formData.get("eventId") ?? "").trim();
  const reportedPersonRefRaw = String(formData.get("reportedPersonRef") ?? "").trim();
  const evidenceLinksRaw = String(formData.get("evidenceLinks") ?? "").trim();
  const reportedPersonRef = reportedPersonRefRaw || null;
  const eventId = eventIdRaw || null;
  const evidenceLinks = parseEvidenceLinks(evidenceLinksRaw);

  const allowedCategories = new Set([
    "comportamento_inadequado",
    "assedio",
    "desrespeito",
    "seguranca",
    "outro",
  ]);
  if (!allowedCategories.has(category)) {
    redirectWithError("Selecione uma categoria válida para o reporte.");
  }
  if (description.length < 20) {
    redirectWithError("Descreva o ocorrido com mais detalhes (mínimo de 20 caracteres).");
  }
  if (description.length > 4000) {
    redirectWithError("A descrição pode ter no máximo 4000 caracteres.");
  }

  // Anti-spam básico: evita flood acidental ou malicioso em sequência.
  const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
  const recentCount = await prisma.safetyReport.count({
    where: {
      reporterUserId,
      createdAt: { gte: oneMinuteAgo },
    },
  });
  if (recentCount >= 1) {
    redirectWithError("Aguarde alguns segundos antes de enviar uma nova denúncia.");
  }

  if (eventId) {
    const myRegistration = await prisma.eventRegistration.findUnique({
      where: {
        userId_eventId: {
          userId: reporterUserId,
          eventId,
        },
      },
      select: { id: true, status: true },
    });
    if (!myRegistration || myRegistration.status === "cancelled") {
      redirectWithError("Só é possível vincular a denúncia a um evento em que você participou.");
    }
  }

  let reportedUserId: string | null = null;
  if (reportedPersonRef) {
    const lowered = reportedPersonRef.toLowerCase();
    const found = await prisma.user.findFirst({
      where: {
        OR: [{ id: reportedPersonRef }, { email: lowered }],
      },
      select: { id: true },
    });
    reportedUserId = found?.id ?? null;
  }

  await prisma.safetyReport.create({
    data: {
      reporterUserId,
      eventId,
      reportedUserId,
      reportedPersonRef,
      evidenceLinksJson: evidenceLinks.length > 0 ? JSON.stringify(evidenceLinks) : null,
      category,
      description,
      status: "open",
    },
  });

  revalidatePath("/app/conta/seguranca");
  revalidatePath("/app/conta/seguranca/denuncia");
  redirect("/app/conta/seguranca/denuncia?success=1");
}
