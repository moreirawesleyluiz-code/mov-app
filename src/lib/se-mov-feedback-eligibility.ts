import { prisma } from "@/lib/prisma";

const SPEED_DATING_TYPES = new Set(["CLASSICO", "SENSORIAL", "EXCLUSIVO"]);

export function isSpeedDatingEventType(type: string): boolean {
  return SPEED_DATING_TYPES.has(type);
}

export function isEligibleSeMovEvent(event: { memberOnly: boolean; type: string }): boolean {
  return event.memberOnly && !isSpeedDatingEventType(event.type);
}

export function isFeedbackWindowOpen(event: { startsAt: Date; endsAt: Date | null }, now = new Date()): boolean {
  const eventEnd = event.endsAt ?? event.startsAt;
  return eventEnd.getTime() <= now.getTime();
}

export type EligibleFeedbackTarget = {
  eventId: string;
  eventTitle: string;
  eventType: string;
  startsAt: Date;
  endsAt: Date | null;
  hasSubmittedFeedback: boolean;
  feedbackId: string | null;
};

export async function getEligibleSeMovFeedbackTargets(userId: string): Promise<EligibleFeedbackTarget[]> {
  const now = new Date();
  const registrations = await prisma.eventRegistration.findMany({
    where: {
      userId,
      status: "confirmed",
      event: {
        published: true,
      },
    },
    select: {
      eventId: true,
      event: {
        select: {
          id: true,
          title: true,
          type: true,
          memberOnly: true,
          startsAt: true,
          endsAt: true,
        },
      },
    },
    orderBy: {
      event: { startsAt: "desc" },
    },
  });

  const feedbacks = await prisma.eventExperienceFeedback.findMany({
    where: { userId },
    select: { id: true, eventId: true },
  });
  const feedbackByEventId = new Map(feedbacks.map((feedback) => [feedback.eventId, feedback]));

  return registrations
    .filter((registration) => isEligibleSeMovEvent(registration.event))
    .filter((registration) => isFeedbackWindowOpen(registration.event, now))
    .map((registration) => {
      const existingFeedback = feedbackByEventId.get(registration.eventId) ?? null;
      return {
        eventId: registration.eventId,
        eventTitle: registration.event.title,
        eventType: registration.event.type,
        startsAt: registration.event.startsAt,
        endsAt: registration.event.endsAt,
        hasSubmittedFeedback: Boolean(existingFeedback),
        feedbackId: existingFeedback?.id ?? null,
      };
    });
}

export async function userHasPendingSeMovFeedback(userId: string): Promise<boolean> {
  const eligible = await getEligibleSeMovFeedbackTargets(userId);
  return eligible.some((target) => !target.hasSubmittedFeedback);
}
