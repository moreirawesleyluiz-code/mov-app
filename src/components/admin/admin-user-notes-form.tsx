"use client";

import { useState } from "react";
import { updateAdminUserNotes } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";

type Props = { userId: string; initialNotes: string };

export function AdminUserNotesForm({ userId, initialNotes }: Props) {
  const [notes, setNotes] = useState(initialNotes);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("saving");
    try {
      await updateAdminUserNotes(userId, notes);
      setStatus("saved");
      setTimeout(() => setStatus("idle"), 2000);
    } catch {
      setStatus("error");
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <textarea
        name="adminNotes"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={5}
        className="w-full rounded-xl border border-movApp-border bg-movApp-paper px-4 py-3.5 text-sm leading-relaxed text-movApp-ink shadow-[inset_0_1px_0_rgba(28,25,23,0.04)] ring-1 ring-movApp-border/25 outline-none placeholder:text-movApp-muted/55 focus:border-movApp-accent focus:ring-2 focus:ring-movApp-accent/30"
        placeholder="Notas da equipa (curadoria, mesa, follow-up)…"
      />
      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={status === "saving"} variant="primary">
          {status === "saving" ? "A guardar…" : "Guardar notas"}
        </Button>
        {status === "saved" && <span className="text-sm text-movApp-success">Guardado.</span>}
        {status === "error" && <span className="text-sm text-red-700">Erro ao guardar.</span>}
      </div>
    </form>
  );
}
