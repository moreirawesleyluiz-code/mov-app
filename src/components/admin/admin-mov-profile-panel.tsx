"use client";

import { useState } from "react";
import { getAdminMovProfileSnapshot, type MovProfileSnapshot } from "@/app/admin/mov-profile-actions";

type Props = { userId: string };

export function AdminMovProfilePanel({ userId }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<MovProfileSnapshot | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    const r = await getAdminMovProfileSnapshot(userId);
    setLoading(false);
    if (!r.ok) {
      setError(r.error);
      return;
    }
    setData(r.data);
  }

  return (
    <section id="perfil-mov" className="scroll-mt-6 rounded-xl border border-movApp-border bg-movApp-paper p-5">
      <h2 className="font-display text-lg font-semibold text-movApp-ink">Perfil MOV</h2>
      <p className="mt-1 text-sm text-movApp-muted">
        Derivado das respostas (carregamento sob pedido — não bloqueia o render inicial da página).
      </p>

      {data === null ? (
        <div className="mt-4">
          <button
            type="button"
            disabled={loading}
            onClick={() => void load()}
            className="rounded-lg border border-movApp-border bg-white px-4 py-2 text-sm font-medium text-movApp-ink hover:bg-movApp-subtle disabled:opacity-50"
          >
            {loading ? "A carregar…" : "Mostrar Perfil MOV"}
          </button>
          {error && (
            <p className="mt-2 text-sm text-red-800" role="alert">
              {error}
            </p>
          )}
        </div>
      ) : (
        <div className="mt-4 space-y-4">
          <p className="text-lg font-semibold text-movApp-ink">{data.shortLabel}</p>
          <div className="flex flex-wrap gap-2">
            {data.tags.map((t) => (
              <span key={t} className="rounded border border-movApp-border px-2 py-1 text-xs">
                {t}
              </span>
            ))}
          </div>
          <ul className="space-y-2 text-sm">
            {data.axes.map((a) => (
              <li key={a.key} className="flex justify-between border-b border-movApp-border/50 py-1">
                <span>{a.label}</span>
                <span className="font-semibold text-movApp-accent">{a.score ?? "—"}</span>
              </li>
            ))}
          </ul>
          <div className="space-y-2 text-sm">
            <p>
              <strong>Mesa (texto base):</strong> {data.mesaSuggestion}
            </p>
            <p>
              <strong>Evento (texto base):</strong> {data.eventSuggestion}
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
