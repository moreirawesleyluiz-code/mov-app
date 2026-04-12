"use client";

import { usePathname, useRouter } from "next/navigation";
import { useTransition } from "react";
import { softDeleteParticipant } from "@/app/admin/actions";

type Props = {
  userId: string;
  isAdmin: boolean;
  /** Lista: botão compacto "Excluir". */
  variant?: "default" | "table";
};

export function AdminDeleteUserButton({ userId, isAdmin, variant = "default" }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();

  if (isAdmin) {
    return (
      <span className="text-xs text-movApp-muted">
        {variant === "table" ? "—" : "Contas de administrador não podem ser inativadas por aqui."}
      </span>
    );
  }

  const btnClass =
    variant === "table"
      ? "rounded-md border border-red-300 bg-red-50 px-2 py-1 text-xs font-medium text-red-900 hover:bg-red-100 disabled:opacity-50"
      : "rounded-lg border border-red-300 bg-red-50 px-4 py-2 text-sm font-medium text-red-900 hover:bg-red-100 disabled:opacity-50";

  return (
    <button
      type="button"
      title="Inativa o participante (soft delete), remove-o das mesas e bloqueia novo login desta conta."
      disabled={pending}
      className={btnClass}
      onClick={() => {
        if (
          !window.confirm(
            "Tem certeza que deseja excluir este perfil? Esta ação irá inativar o participante e removê-lo das mesas.",
          )
        ) {
          return;
        }
        startTransition(async () => {
          await softDeleteParticipant(userId);
          if (pathname?.startsWith("/admin/users/")) {
            router.replace("/admin");
          } else {
            router.refresh();
          }
        });
      }}
    >
      {pending ? "…" : variant === "table" ? "Excluir" : "Excluir perfil"}
    </button>
  );
}
