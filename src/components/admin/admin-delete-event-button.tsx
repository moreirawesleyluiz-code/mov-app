"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { deleteAdminEvent } from "@/app/admin/event-actions";

type Props = {
  eventId: string;
};

export function AdminDeleteEventButton({ eventId }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      className="rounded-lg border border-red-300 px-3 py-1.5 text-xs font-medium text-red-700 disabled:opacity-50"
      disabled={pending}
      onClick={() => {
        if (!window.confirm("Tem certeza que deseja excluir este evento?")) return;
        startTransition(async () => {
          await deleteAdminEvent(eventId);
          router.refresh();
        });
      }}
    >
      {pending ? "…" : "Excluir"}
    </button>
  );
}

