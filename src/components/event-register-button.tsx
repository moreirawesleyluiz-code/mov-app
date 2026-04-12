"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function EventRegisterButton({
  eventId,
  disabled,
  label = "Quero participar",
}: {
  eventId: string;
  disabled?: boolean;
  label?: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function onClick() {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/events/${eventId}/register`, { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMessage(typeof data.error === "string" ? data.error : "Não foi possível confirmar.");
        setLoading(false);
        return;
      }
      if (data.waitlist) setMessage("Lista de espera — entraremos em contato.");
      else if (data.already) setMessage("Você já está inscrito(a).");
      else setMessage("Inscrição confirmada!");
      router.refresh();
    } catch {
      setMessage("Erro de rede.");
    }
    setLoading(false);
  }

  return (
    <div className="flex flex-col items-start gap-2">
      <Button type="button" disabled={disabled || loading} onClick={onClick}>
        {loading ? "Enviando…" : label}
      </Button>
      {message && <p className="text-xs text-movApp-muted">{message}</p>}
    </div>
  );
}
