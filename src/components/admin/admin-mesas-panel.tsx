"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  addMemberToMesa,
  createMesa,
  deleteMesa,
  moveMemberToMesa,
  recalculateNonPinnedMesas,
  removeMember,
  setMemberPinned,
  setMesaStatus,
  suggestMesasForUnallocated,
} from "@/app/admin/mesa-actions";
import { MAX_MESA_SIZE } from "@/lib/admin-mesa-suggest";

type MesaVM = {
  id: string;
  name: string;
  status: string;
  sortOrder: number;
  members: Array<{
    memberId: string;
    userId: string;
    pinned: boolean;
    name: string | null;
    email: string;
    city: string | null;
    shortLabel: string;
    tagsPreview: string;
  }>;
  summaryLine: string;
  summaryAlert: string | null;
};

type PickerUser = { id: string; name: string | null; email: string; shortLabel: string };

type Props = {
  mesas: MesaVM[];
  unallocated: Array<{
    id: string;
    name: string | null;
    email: string;
    city: string | null;
    shortLabel: string;
  }>;
  tableOptions: Array<{ id: string; name: string }>;
  pickerUsers: PickerUser[];
};

export function AdminMesasPanel({ mesas, unallocated, tableOptions, pickerUsers }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [newMesaName, setNewMesaName] = useState("");
  const [pickForMesa, setPickForMesa] = useState<Record<string, string>>({});
  const [movePick, setMovePick] = useState<{ userId: string; targetTableId: string }>({
    userId: "",
    targetTableId: "",
  });

  const allocatedIds = new Set(mesas.flatMap((m) => m.members.map((x) => x.userId)));
  const availablePick = pickerUsers.filter((p) => !allocatedIds.has(p.id));

  function runAction(fn: () => Promise<unknown>) {
    setError(null);
    startTransition(async () => {
      try {
        await fn();
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Erro ao executar ação.");
      }
    });
  }

  return (
    <div className="mt-8 space-y-10">
      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900" role="alert">
          {error}
        </p>
      )}

      <section className="rounded-xl border border-movApp-border bg-movApp-paper p-4">
        <h2 className="font-display text-lg font-semibold text-movApp-ink">Sugestão automática</h2>
        <p className="mt-1 text-sm text-movApp-muted">
          Gera mesas só para participantes <strong>prontos para curadoria</strong> e <strong>sem mesa</strong>. Não altera
          vínculos fixados noutras mesas.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            disabled={pending}
            className="rounded-lg bg-movApp-accent px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            onClick={() =>
              runAction(async () => {
                const r = await suggestMesasForUnallocated();
                if (r.message) window.alert(r.message);
              })
            }
          >
            Sugerir mesas (não alocados)
          </button>
          <button
            type="button"
            disabled={pending}
            className="rounded-lg border border-amber-400 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-950 disabled:opacity-50"
            onClick={() => {
              if (
                !window.confirm(
                  "Isto remove todos os participantes NÃO fixados das mesas e recria grupos automaticamente. Participantes fixados mantêm-se. Continuar?",
                )
              ) {
                return;
              }
              runAction(async () => {
                const r = await recalculateNonPinnedMesas();
                if (r.message) window.alert(r.message);
              });
            }}
          >
            Recalcular (remove não fixados)
          </button>
        </div>
      </section>

      <section className="rounded-xl border border-movApp-border bg-movApp-paper p-4">
        <h2 className="font-display text-lg font-semibold text-movApp-ink">Nova mesa manual</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          <input
            type="text"
            value={newMesaName}
            onChange={(e) => setNewMesaName(e.target.value)}
            placeholder="Nome da mesa"
            className="min-w-[200px] flex-1 rounded-lg border border-movApp-border px-3 py-2 text-sm"
          />
          <button
            type="button"
            disabled={pending}
            className="rounded-lg border border-movApp-border px-4 py-2 text-sm font-medium disabled:opacity-50"
            onClick={() =>
              runAction(async () => {
                await createMesa(newMesaName);
                setNewMesaName("");
              })
            }
          >
            Criar mesa vazia
          </button>
        </div>
      </section>

      <section className="rounded-xl border border-movApp-border bg-movApp-paper p-4">
        <h2 className="font-display text-lg font-semibold text-movApp-ink">
          Não alocados ({unallocated.length})
        </h2>
        <p className="mt-1 text-sm text-movApp-muted">Prontos para curadoria e ainda sem mesa.</p>
        {unallocated.length === 0 ? (
          <p className="mt-3 text-sm text-movApp-muted">Nenhum.</p>
        ) : (
          <ul className="mt-3 space-y-2 text-sm">
            {unallocated.map((u) => (
              <li key={u.id} className="flex flex-wrap items-baseline justify-between gap-2 border-b border-movApp-border/50 py-1">
                <span>
                  <strong>{u.name ?? "—"}</strong> <span className="text-movApp-muted">{u.email}</span> · {u.city ?? "—"}{" "}
                  · <span className="text-movApp-ink">{u.shortLabel}</span>
                </span>
                <Link href={`/admin/users/${u.id}`} className="text-movApp-accent hover:underline">
                  Ver perfil
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-6">
        <h2 className="font-display text-lg font-semibold text-movApp-ink">Mesas</h2>
        {mesas.length === 0 ? (
          <p className="text-sm text-movApp-muted">Ainda não há mesas. Crie manualmente ou use a sugestão automática.</p>
        ) : (
          mesas.map((mesa) => (
            <article key={mesa.id} className="rounded-xl border border-movApp-border bg-white p-4 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="font-display text-base font-semibold text-movApp-ink">{mesa.name}</h3>
                  <p className="text-xs text-movApp-muted">
                    {mesa.members.length}/{MAX_MESA_SIZE} lugares · estado: {mesa.status}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={pending}
                    className="text-xs font-medium text-movApp-accent underline"
                    onClick={() =>
                      runAction(async () => {
                        await setMesaStatus(mesa.id, mesa.status === "finalized" ? "draft" : "finalized");
                      })
                    }
                  >
                    {mesa.status === "finalized" ? "Reabrir (rascunho)" : "Marcar finalizada"}
                  </button>
                  <button
                    type="button"
                    disabled={pending}
                    className="text-xs text-red-700 underline"
                    onClick={() => {
                      if (!window.confirm("Apagar esta mesa e todos os lugares?")) return;
                      runAction(async () => deleteMesa(mesa.id));
                    }}
                  >
                    Apagar mesa
                  </button>
                </div>
              </div>
              <p className="mt-2 text-sm text-movApp-ink">{mesa.summaryLine}</p>
              {mesa.summaryAlert && (
                <p className="mt-1 text-sm text-amber-900">Alerta: {mesa.summaryAlert}</p>
              )}

              <div className="mt-4 border-t border-movApp-border pt-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-movApp-muted">Adicionar participante</p>
                {mesa.members.length >= MAX_MESA_SIZE ? (
                  <p className="mt-2 text-sm text-amber-900">Mesa cheia ({MAX_MESA_SIZE} lugares). Mova ou remova alguém para adicionar.</p>
                ) : (
                  <div className="mt-2 flex flex-wrap gap-2">
                    <select
                      className="rounded-lg border border-movApp-border px-2 py-1.5 text-sm"
                      value={pickForMesa[mesa.id] ?? ""}
                      onChange={(e) =>
                        setPickForMesa((s) => ({ ...s, [mesa.id]: e.target.value }))
                      }
                    >
                      <option value="">Escolher participante pronto…</option>
                      {availablePick.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name ?? p.email} — {p.shortLabel}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      disabled={pending || !(pickForMesa[mesa.id] ?? "").trim()}
                      className="rounded-lg bg-movApp-accent px-3 py-1.5 text-sm text-white disabled:opacity-50"
                      onClick={() => {
                        const uid = pickForMesa[mesa.id];
                        if (!uid) return;
                        runAction(async () => {
                          await addMemberToMesa(mesa.id, uid);
                          setPickForMesa((s) => ({ ...s, [mesa.id]: "" }));
                        });
                      }}
                    >
                      Adicionar à mesa
                    </button>
                  </div>
                )}
              </div>

              <ul className="mt-4 space-y-3">
                {mesa.members.map((m) => (
                  <li
                    key={m.memberId}
                    className="flex flex-col gap-2 rounded-lg border border-movApp-border/60 bg-movApp-bg/40 px-3 py-2 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <Link href={`/admin/users/${m.userId}`} className="font-medium text-movApp-accent hover:underline">
                        {m.name ?? "—"}
                      </Link>
                      <span className="ml-2 text-xs text-movApp-muted">{m.email}</span>
                      <p className="text-xs text-movApp-ink">
                        {m.city ?? "—"} · {m.shortLabel}
                      </p>
                      <p className="text-[11px] text-movApp-muted">{m.tagsPreview}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <label className="flex items-center gap-1 text-xs">
                        <input
                          type="checkbox"
                          checked={m.pinned}
                          disabled={pending}
                          onChange={() =>
                            runAction(async () => setMemberPinned(m.memberId, !m.pinned))
                          }
                        />
                        Fixar
                      </label>
                      <select
                        className="rounded border border-movApp-border px-1 py-1 text-xs"
                        defaultValue=""
                        onChange={(e) => {
                          const v = e.target.value;
                          if (!v) return;
                          if (v === "__remove") {
                            if (!window.confirm("Remover desta mesa?")) return;
                            runAction(async () => removeMember(m.memberId));
                          } else {
                            runAction(async () => moveMemberToMesa(m.userId, v));
                          }
                          e.target.value = "";
                        }}
                      >
                        <option value="">Mover para…</option>
                        {tableOptions
                          .filter((t) => t.id !== mesa.id)
                          .map((t) => (
                            <option key={t.id} value={t.id}>
                              {t.name}
                            </option>
                          ))}
                        <option value="__remove">Remover (não alocado)</option>
                      </select>
                      <button
                        type="button"
                        disabled={pending}
                        className="text-xs text-red-700 underline"
                        onClick={() => {
                          if (!window.confirm("Remover desta mesa?")) return;
                          runAction(async () => removeMember(m.memberId));
                        }}
                      >
                        Remover
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </article>
          ))
        )}
      </section>

      <section className="rounded-xl border border-dashed border-movApp-border p-4">
        <h3 className="text-sm font-semibold text-movApp-ink">Mover por ID (alternativa)</h3>
        <p className="text-xs text-movApp-muted">Escolha um participante que já está numa mesa e a mesa destino.</p>
        <div className="mt-2 flex flex-wrap gap-2">
          <select
            className="rounded border px-2 py-1 text-sm"
            value={movePick.userId}
            onChange={(e) => setMovePick((p) => ({ ...p, userId: e.target.value }))}
          >
            <option value="">Participante…</option>
            {mesas.flatMap((t) =>
              t.members.map((m) => (
                <option key={m.memberId} value={m.userId}>
                  {m.name ?? m.email} ({t.name})
                </option>
              )),
            )}
          </select>
          <select
            className="rounded border px-2 py-1 text-sm"
            value={movePick.targetTableId}
            onChange={(e) => setMovePick((p) => ({ ...p, targetTableId: e.target.value }))}
          >
            <option value="">Mesa destino…</option>
            {tableOptions.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
          <button
            type="button"
            disabled={pending || !movePick.userId || !movePick.targetTableId}
            className="rounded bg-movApp-accent px-3 py-1 text-sm text-white disabled:opacity-50"
            onClick={() =>
              runAction(async () => moveMemberToMesa(movePick.userId, movePick.targetTableId))
            }
          >
            Mover
          </button>
        </div>
      </section>
    </div>
  );
}
