"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isEligibleSeMovEvent, isFeedbackWindowOpen } from "@/lib/se-mov-feedback-eligibility";

function redirectWithError(message: string): never {
  redirect(`/app/feedback?error=${encodeURIComponent(message)}`);
}

export async function submitExperienceFeedback(formData: FormData) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) redirect("/login?callbackUrl=/app/feedback");

  const eventId = String(formData.get("eventId") ?? "").trim();
  const comments = String(formData.get("comments") ?? "").trim();
  const ratingRaw = String(formData.get("rating") ?? "").trim();
  const wouldRecommend = String(formData.get("wouldRecommend") ?? "").trim();

  if (!eventId) redirectWithError("Selecione um evento elegível para enviar feedback.");
  if (!comments) redirectWithError("Descreva brevemente como foi sua experiência.");

  const rating = Number.parseInt(ratingRaw, 10);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    redirectWithError("A avaliação deve ser de 1 a 5.");
  }
  if (wouldRecommend !== "yes" && wouldRecommend !== "no") {
    redirectWithError("Informe se recomendaria a experiência.");
  }

  const registration = await prisma.eventRegistration.findUnique({
    where: { userId_eventId: { userId, eventId } },
    select: {
      status: true,
      event: {
        select: {
          id: true,
          memberOnly: true,
          type: true,
          startsAt: true,
          endsAt: true,
          title: true,
          published: true,
        },
      },
    },
  });

  if (!registration || registration.status !== "confirmed") {
    redirectWithError("Você só pode avaliar eventos Se Mov com participação confirmada.");
  }
  const event = registration.event;

  if (!event.published || !isEligibleSeMovEvent(event)) {
    redirectWithError("Este evento não é elegível para feedback da experiência Se Mov.");
  }
  if (!isFeedbackWindowOpen(event)) {
    redirectWithError("O feedback fica disponível após a conclusão do evento.");
  }

  const existing = await prisma.eventExperienceFeedback.findUnique({
    where: { userId_eventId: { userId, eventId } },
    select: { id: true },
  });
  if (existing) {
    redirectWithError("Você já enviou feedback para este evento.");
  }

  await prisma.eventExperienceFeedback.create({
    data: {
      userId,
      eventId,
      rating,
      comments,
      answersJson: JSON.stringify({
        wouldRecommend,
      }),
      status: "submitted",
    },
  });

  revalidatePath("/app/eventos");
  revalidatePath("/app/feedback");
  redirect("/app/feedback?success=1");
}
