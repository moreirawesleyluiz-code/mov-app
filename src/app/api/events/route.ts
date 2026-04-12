import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const events = await prisma.event.findMany({
    where: { published: true },
    orderBy: { startsAt: "asc" },
    take: 50,
  });
  return NextResponse.json(events);
}
