"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { SE_MOV_DEMO_COOKIE } from "@/lib/se-mov-demo";

const DEMO_MAX_AGE_SEC = 60 * 60 * 24 * 365;

export async function activateSeMov() {
  const session = await auth();

  if (session?.user?.id) {
    const renewsAt = new Date();
    renewsAt.setMonth(renewsAt.getMonth() + 1);
    await prisma.subscription.upsert({
      where: { userId: session.user.id },
      create: {
        userId: session.user.id,
        status: "active",
        planCode: "SE_MOV",
        renewsAt,
      },
      update: {
        status: "active",
        canceledAt: null,
        renewsAt,
      },
    });
  } else {
    const store = await cookies();
    store.set(SE_MOV_DEMO_COOKIE, "1", {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: DEMO_MAX_AGE_SEC,
    });
  }

  revalidatePath("/app");
  revalidatePath("/app/agenda");
  redirect("/app/agenda");
}
