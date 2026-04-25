import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { PlanosMovScreen } from "@/components/planos-mov-screen";
import { prisma } from "@/lib/prisma";

export default async function PlanosPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/");

  const sub = await prisma.subscription.findUnique({
    where: { userId: session.user.id },
  });
  if (sub?.status === "active") {
    redirect("/app/agenda");
  }

  return <PlanosMovScreen />;
}
