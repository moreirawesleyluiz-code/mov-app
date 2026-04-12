import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { ContaEditarForm } from "@/components/conta/conta-editar-form";
import { ContaSubpageHeader } from "@/components/conta/conta-subpage-header";
import { mergeAppProfileExtra, parseAppProfileExtra, splitDisplayName } from "@/lib/app-profile-extra";
import { prisma } from "@/lib/prisma";

export default async function ContaEditarPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/");
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, image: true, city: true, appProfileJson: true },
  });
  if (!user) redirect("/");

  const parsed = parseAppProfileExtra(user.appProfileJson);
  const split = splitDisplayName(user.name);
  const extra = mergeAppProfileExtra(parsed, {
    firstName: parsed.firstName ?? split.first,
    lastName: parsed.lastName ?? split.last,
  });

  return (
    <div className="px-1 sm:px-0">
      <ContaSubpageHeader backHref="/app/conta" title="Perfil" />
      <ContaEditarForm
        displayName={user.name ?? "Utilizador"}
        imageUrl={user.image}
        city={user.city}
        extra={extra}
      />
    </div>
  );
}
