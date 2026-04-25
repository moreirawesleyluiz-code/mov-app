"use client";

import { useState } from "react";

export function CancelarAssinaturaButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onCancel() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/subscription", { method: "DELETE" });
      if (!res.ok) {
        setError("Não foi possível cancelar a assinatura.");
        setLoading(false);
        return;
      }
      window.location.href = "/app/conta/assinatura";
    } catch {
      setError("Não foi possível cancelar a assinatura.");
      setLoading(false);
    }
  }

  return (
    <div className="mt-3">
      <button
        type="button"
        onClick={onCancel}
        disabled={loading}
        className="inline-flex h-11 min-h-[44px] items-center justify-center rounded-xl border border-red-300 bg-red-50 px-4 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:opacity-60"
      >
        {loading ? "Cancelando..." : "Cancelar assinatura"}
      </button>
      {error ? <p className="mt-2 text-sm text-red-700">{error}</p> : null}
    </div>
  );
}
