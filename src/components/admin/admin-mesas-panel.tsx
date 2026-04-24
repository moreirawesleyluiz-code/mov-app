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
  resuggestMesaRestaurant,
  setMemberPinned,
  setMesaPartnerRestaurant,
  setMesaStatus,
  suggestMesasForEvent,
  suggestMesasForUnallocated,
} from "@/app/admin/mesa-actions";
import type { RestaurantPickResult } from "@/lib/mov-restaurant-allocation";
import type { TableLevelScores } from "@/lib/mov-mesa-engine";
import { MAX_MESA_SIZE } from "@/lib/admin-mesa-suggest";
import { cn } from "@/lib/utils";

type MesaVM = {
  id: string;
  name: string;
  status: string;
  sortOrder: number;
  eventId?: string | null;
  eventTitle?: string | null;
  partnerRestaurantId?: string | null;
  partnerRestaurantName?: string | null;
  allocationRestaurantLine?: string | null;
  restaurantPick?: RestaurantPickResult | null;
  manualRestaurant?: boolean;
  operationalAlert?: string | null;
  /** Tags curtas para leitura operacional (dieta, agenda, capacidade, aderência…). */
  conflictLabels?: string[];
  hasConflict?: boolean;
  hasLowAdherence?: boolean;
  partnerActive?: boolean | null;
  availabilitySlotsOnTable?: string[];
  /** Texto principal do motor de mesas (compatibilidade humana). */
  mesaFormationLine?: string | null;
  tableCompatibilityScores?: TableLevelScores;
  /** Confiança legível na última sugestão automática de restaurante. */
  restaurantConfidence?: "alta" | "media" | "baixa" | null;
  weakestMember?: { name: string | null; score: number; attention: string | null } | null;
  members: Array<{
    memberId: string;
    userId: string;
    pinned: boolean;
    name: string | null;
    email: string;
    city: string | null;
    shortLabel: string;
    tagsPreview: string;
    fitScore: number;
    fitAttention: string | null;
  }>;
  summaryLine: string;
  summaryAlert: string | null;
};

type PickerUser = { id: string; name: string | null; email: string; shortLabel: string };

const CONFLICT_LABEL_DISPLAY: Record<string, string> = {
  "parceiro-inativo": "Parceiro inativo",
  "lugares-mesa": "Lugares > limite",
  dieta: "Dieta",
  regiao: "Região",
  "regiao-mista": "Região mista",
  orcamento: "Orçamento",
  agenda: "Agenda",
  "capacidade-mesas": "Mesas saturadas",
  "capacidade-lugares": "Lugares saturados",
  "aderencia-baixa": "Aderência baixa",
  "sugestao-automatica-divergente": "≠ sugestão automática",
  "manual-vs-sugestao": "Manual ≠ sugestão",
  "sem-restaurante": "Sem restaurante",
  disponibilidade: "Disponibilidade",
};

function confidenceBadgeClass(c: "alta" | "media" | "baixa" | null | undefined): string {
  if (c === "alta") return "border-emerald-300 bg-emerald-50 text-emerald-950";
  if (c === "media") return "border-amber-300 bg-amber-50 text-amber-950";
  if (c === "baixa") return "border-red-200 bg-red-50 text-red-950";
  return "border-movApp-border bg-movApp-bg text-movApp-muted";
}

function confidenceLabel(c: "alta" | "media" | "baixa" | null | undefined): string {
  if (c === "alta") return "Alta";
  if (c === "media") return "Média";
  if (c === "baixa") return "Baixa";
  return "—";
}

type Props = {
  /** Em `/admin/mesas`: só lista e acções sobre mesas já criadas. Em `/admin/montagem`: inclui sugestão e candidatos. */
  showCurationBlocks?: boolean;
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
  events: Array<{ id: string; title: string }>;
  /** Lista completa; o select por mesa mostra só activos + o vínculo actual (mesmo inactivo). */
  restaurants: Array<{ id: string; name: string; active: boolean }>;
};

export function AdminMesasPanel({
  showCurationBlocks = true,
  mesas,
  unallocated,
  tableOptions,
  pickerUsers,
  events,
  restaurants,
}: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [eventIdPick, setEventIdPick] = useState("");
  const [newMesaName, setNewMesaName] = useState("");
  const [pickForMesa, setPickForMesa] = useState<Record<string, string>>({});
  const [movePick, setMovePick] = useState<{ userId: string; targetTableId: string }>({
    userId: "",
    targetTableId: "",
  });

  const allocatedIds = new Set(mesas.flatMap((m) => m.members.map((x) => x.userId)));
  const availablePick = pickerUsers.filter((p) => !allocatedIds.has(p.id));

  function restaurantOptionsForMesa(mesa: MesaVM) {
    return restaurants.filter((r) => r.active || r.id === mesa.partnerRestaurantId);
  }

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
    <div className="mt-6 space-y-8">
      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900" role="alert">
          {error}
        </p>
      )}

      {showCurationBlocks ? (
      <section className="rounded-2xl border border-movApp-border bg-movApp-paper p-5 shadow-sm">
        <h2 className="font-display text-lg font-semibold text-movApp-ink">Sugestão automática</h2>
        <p className="mt-1 text-sm text-movApp-muted">
          Gera mesas só para participantes <strong>prontos para curadoria</strong> e <strong>sem mesa</strong>. Não altera
          vínculos fixados noutras mesas. A lista completa para rever estado e conflitos está em{" "}
          <Link href="/admin/mesas" className="font-medium text-movApp-accent hover:underline">
            Mesas
          </Link>
          .
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            disabled={pending}
            className="rounded-lg bg-movApp-accent px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50"
            onClick={() =>
              runAction(async () => {
                const r = await suggestMesasForUnallocated();
                if (r.message) window.alert(r.message);
              })
            }
          >
            Sugerir mesas (não alocados)
          </button>
          <span className="mx-1 self-center text-movApp-muted">|</span>
          <select
            className="h-10 rounded-lg border border-movApp-border px-3 text-sm"
            value={eventIdPick}
            onChange={(e) => setEventIdPick(e.target.value)}
          >
            <option value="">Escolher evento…</option>
            {events.map((ev) => (
              <option key={ev.id} value={ev.id}>
                {ev.title}
              </option>
            ))}
          </select>
          <button
            type="button"
            disabled={pending || !eventIdPick}
            className="rounded-lg bg-movApp-ink px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50"
            onClick={() =>
              runAction(async () => {
                const r = await suggestMesasForEvent(eventIdPick);
                if (r.message) window.alert(r.message);
              })
            }
          >
            Sugerir mesas (evento + reserva)
          </button>
          <button
            type="button"
            disabled={pending}
            className="rounded-lg border border-amber-400 bg-amber-50 px-4 py-2.5 text-sm font-medium text-amber-950 disabled:opacity-50"
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
        <p className="mt-2 text-xs text-movApp-muted">
          A opção <strong>evento + reserva</strong> usa região, orçamento, idiomas, restrições e disponibilidade gravados na
          inscrição, além do perfil MOV, e tenta alocar um restaurante parceiro compatível.
        </p>
      </section>
      ) : null}

      {showCurationBlocks ? (
      <section className="rounded-2xl border border-movApp-border bg-movApp-paper p-5 shadow-sm">
        <h2 className="font-display text-lg font-semibold text-movApp-ink">Nova mesa manual</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          <input
            type="text"
            value={newMesaName}
            onChange={(e) => setNewMesaName(e.target.value)}
            placeholder="Nome da mesa"
            className="h-10 min-w-[220px] flex-1 rounded-lg border border-movApp-border px-3 text-sm"
          />
          <button
            type="button"
            disabled={pending}
            className="rounded-lg border border-movApp-border px-4 py-2.5 text-sm font-medium disabled:opacity-50"
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
      ) : null}

      {showCurationBlocks ? (
      <section className="rounded-2xl border border-movApp-border bg-movApp-paper p-5 shadow-sm">
        <h2 className="font-display text-lg font-semibold text-movApp-ink">
          Não alocados ({unallocated.length})
        </h2>
        <p className="mt-1 text-sm text-movApp-muted">Prontos para curadoria e ainda sem mesa.</p>
        {unallocated.length === 0 ? (
          <p className="mt-3 text-sm text-movApp-muted">Nenhum.</p>
        ) : (
          <ul className="mt-3 space-y-2.5 text-sm">
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
      ) : null}

      <section className="space-y-6">
        {showCurationBlocks ? (
          <div className="space-y-1">
            <h2 className="font-display text-lg font-semibold text-movApp-ink">Mesas montadas</h2>
            <p className="mt-1 text-xs text-movApp-muted">
              Lista para contexto ao montar grupos; prioridade visual nos alertas e na composição.
            </p>
          </div>
        ) : null}
        {mesas.length === 0 ? (
          <p className="text-sm text-movApp-muted">
            Nenhuma mesa criada no momento.{" "}
            {showCurationBlocks ? (
              <>
                Crie manualmente ou use <strong>Sugestão automática</strong> acima.
              </>
            ) : (
              "Ajuste os filtros ou crie uma nova mesa em Montagem."
            )}
          </p>
        ) : (
          mesas.map((mesa) => (
            <article
              key={mesa.id}
              className={cn(
                "rounded-2xl border bg-white p-5 shadow-sm",
                mesa.hasConflict ? "border-amber-400/90 border-l-4 border-l-amber-500" : "border-movApp-border",
              )}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="font-display text-base font-semibold text-movApp-ink">
                    {mesa.name}
                    {mesa.partnerActive === false && mesa.partnerRestaurantName ? (
                      <span className="ml-2 align-middle rounded bg-red-50 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-red-900">
                        parceiro inativo
                      </span>
                    ) : null}
                  </h3>
                  <p className="text-xs text-movApp-muted">
                    {mesa.members.length}/{MAX_MESA_SIZE} lugares · estado: {mesa.status}
                    {mesa.eventTitle ? ` · evento: ${mesa.eventTitle}` : ""}
                    {mesa.partnerRestaurantName ? ` · restaurante: ${mesa.partnerRestaurantName}` : ""}
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
              {(mesa.conflictLabels?.length ||
                mesa.hasConflict ||
                mesa.summaryAlert ||
                mesa.operationalAlert) ? (
                <div
                  className={cn(
                    "mt-3 rounded-lg border px-3 py-2.5",
                    mesa.hasConflict
                      ? "border-amber-400 bg-amber-50/95 shadow-sm"
                      : "border-movApp-border/80 bg-movApp-bg/70",
                  )}
                >
                  <p className="text-[11px] font-bold uppercase tracking-wide text-movApp-ink">
                    {mesa.hasConflict ? "Conflito ou alerta — rever antes de confirmar" : "Sinais operacionais"}
                  </p>
                  {mesa.conflictLabels && mesa.conflictLabels.length > 0 ? (
                    <ul className="mt-2 flex flex-wrap gap-1.5" aria-label="Sinais operacionais">
                      {mesa.conflictLabels.map((lab) => (
                        <li
                          key={lab}
                          className={cn(
                            "rounded-full px-2 py-0.5 text-[11px] font-medium",
                            mesa.hasConflict
                              ? "border border-amber-500/80 bg-white text-amber-950"
                              : "border border-movApp-border/80 bg-white text-movApp-muted",
                          )}
                        >
                          {CONFLICT_LABEL_DISPLAY[lab] ?? lab}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                  {mesa.summaryAlert ? (
                    <p className="mt-2 text-sm font-medium text-amber-950">{mesa.summaryAlert}</p>
                  ) : null}
                  {mesa.operationalAlert ? (
                    <p className="mt-1 text-sm text-movApp-ink">
                      <span className="font-semibold">Restaurante / operação: </span>
                      {mesa.operationalAlert}
                    </p>
                  ) : null}
                </div>
              ) : null}

              <p className="mt-3 text-sm leading-relaxed text-movApp-ink">
                <span className="mr-1 text-[11px] font-bold uppercase tracking-wide text-movApp-muted">Resumo · </span>
                {mesa.summaryLine}
              </p>

              {mesa.mesaFormationLine ? (
                <details
                  className="mt-3 rounded-lg border border-movApp-border/80 bg-movApp-bg/40 p-3 text-xs text-movApp-ink"
                >
                  <summary className="cursor-pointer list-none font-semibold text-movApp-ink [&::-webkit-details-marker]:hidden">
                    Por que esta composição? (perfil MOV + reserva)
                  </summary>
                  <p className="mt-2 leading-relaxed">{mesa.mesaFormationLine}</p>
                  <p className="mt-1 text-movApp-muted">
                    {mesa.availabilitySlotsOnTable && mesa.availabilitySlotsOnTable.length > 0
                      ? `Disponibilidade na reserva (união): ${mesa.availabilitySlotsOnTable.join(", ")}.`
                      : "Nenhum slot de disponibilidade declarado na reserva — confirmar turno com o grupo se necessário."}
                  </p>
                  {mesa.tableCompatibilityScores ? (
                    <dl className="mt-2 grid gap-x-3 gap-y-1 sm:grid-cols-2 lg:grid-cols-3">
                      <div className="flex justify-between gap-2">
                        <dt className="text-movApp-muted">Afinidade</dt>
                        <dd className="font-medium">{mesa.tableCompatibilityScores.affinity}</dd>
                      </div>
                      <div className="flex justify-between gap-2">
                        <dt className="text-movApp-muted">Diversidade</dt>
                        <dd className="font-medium">{mesa.tableCompatibilityScores.healthyDiversity}</dd>
                      </div>
                      <div className="flex justify-between gap-2">
                        <dt className="text-movApp-muted">Fluência social</dt>
                        <dd className="font-medium">{mesa.tableCompatibilityScores.socialFluency}</dd>
                      </div>
                      <div className="flex justify-between gap-2">
                        <dt className="text-movApp-muted">Viabilidade</dt>
                        <dd className="font-medium">{mesa.tableCompatibilityScores.practicalViability}</dd>
                      </div>
                      <div className="flex justify-between gap-2 sm:col-span-2 lg:col-span-3">
                        <dt className="text-movApp-muted">Score da mesa</dt>
                        <dd className="font-medium">{mesa.tableCompatibilityScores.finalScore}/100</dd>
                      </div>
                    </dl>
                  ) : null}
                  {mesa.weakestMember ? (
                    <p className="mt-3 rounded-md border border-amber-200/80 bg-amber-50/80 px-2 py-1.5 text-amber-950">
                      <span className="font-semibold">Participante com menor aderência ao grupo: </span>
                      {mesa.weakestMember.name ?? "—"} ({mesa.weakestMember.score}/100)
                      {mesa.weakestMember.attention ? ` · ${mesa.weakestMember.attention}` : ""}
                    </p>
                  ) : null}
                </details>
              ) : null}

              {mesa.allocationRestaurantLine ? (
                <p className="mt-2 text-xs text-movApp-muted">
                  <span className="font-medium text-movApp-ink">Texto de alocação: </span>
                  {mesa.allocationRestaurantLine}
                </p>
              ) : null}

              {mesa.restaurantPick ? (
                <details className="mt-2 rounded-lg border border-movApp-border/70 bg-white text-xs text-movApp-ink shadow-sm">
                  <summary className="cursor-pointer list-none px-3 py-2.5 font-semibold text-movApp-ink [&::-webkit-details-marker]:hidden">
                    Encaixe do restaurante (última sugestão automática)
                    {mesa.manualRestaurant ? (
                      <span className="ml-2 inline-block rounded bg-violet-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-violet-900">
                        Curador alterou manualmente
                      </span>
                    ) : null}
                  </summary>
                  <div className="space-y-2 border-t border-movApp-border/60 px-3 pb-3 pt-2">
                    {mesa.restaurantConfidence ? (
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-movApp-muted">Confiança na sugestão:</span>
                        <span
                          className={cn(
                            "inline-flex rounded-full border px-2 py-0.5 text-[11px] font-semibold",
                            confidenceBadgeClass(mesa.restaurantConfidence),
                          )}
                        >
                          {confidenceLabel(mesa.restaurantConfidence)}
                        </span>
                        {mesa.hasLowAdherence ? (
                          <span className="text-[11px] font-medium text-amber-900">
                            Aderência baixa — rever encaixe antes de confirmar.
                          </span>
                        ) : null}
                      </div>
                    ) : null}
                    <ul className="grid gap-1 sm:grid-cols-2">
                      <li>Orçamento: {mesa.restaurantPick.fitBudget}</li>
                      <li>Região: {mesa.restaurantPick.fitRegion}</li>
                      <li>Dieta: {mesa.restaurantPick.fitDiet}</li>
                      <li>Experiência: {mesa.restaurantPick.fitExperience}</li>
                      <li>Agenda: {mesa.restaurantPick.fitSchedule}</li>
                      <li>Disponibilidade: {mesa.restaurantPick.fitAvailability}</li>
                      <li>Capacidade: {mesa.restaurantPick.fitCapacity}</li>
                      <li>Fit mesa: {mesa.restaurantPick.fitTableProfile}</li>
                      <li className="sm:col-span-2 font-medium">Total: {mesa.restaurantPick.aggregateScore}/100</li>
                    </ul>
                    {mesa.restaurantPick.positiveReasons?.length ? (
                      <p className="text-movApp-muted">
                        <span className="font-semibold text-emerald-900">Por que este restaurante: </span>
                        {mesa.restaurantPick.positiveReasons.join(" · ")}
                      </p>
                    ) : null}
                    {mesa.restaurantPick.rejectionSummary?.length ? (
                      <p className="text-movApp-muted">
                        <span className="font-semibold text-movApp-ink">Outros candidatos afastados: </span>
                        {mesa.restaurantPick.rejectionSummary.join(" | ")}
                      </p>
                    ) : null}
                    {mesa.restaurantPick.alerts?.length ? (
                      <p className="text-amber-900">Alertas do motor: {mesa.restaurantPick.alerts.join(" · ")}</p>
                    ) : null}
                    {mesa.manualRestaurant ? (
                      <p className="border-t border-movApp-border/50 pt-2 text-movApp-muted">
                        A escolha no menu abaixo foi feita pelo curador; pode divergir da última sugestão automática acima.
                      </p>
                    ) : null}
                  </div>
                </details>
              ) : null}

              <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-movApp-border pt-3.5">
                <span className="text-xs font-semibold uppercase tracking-wide text-movApp-muted">Restaurante</span>
                <select
                  className="h-9 rounded-lg border border-movApp-border px-2.5 text-xs"
                  defaultValue={mesa.partnerRestaurantId ?? ""}
                  onChange={(e) => {
                    const v = e.target.value;
                    runAction(async () => setMesaPartnerRestaurant(mesa.id, v === "" ? null : v));
                  }}
                  aria-label="Restaurante parceiro"
                >
                  <option value="">(não atribuído)</option>
                  {restaurantOptionsForMesa(mesa).map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                      {!r.active ? " (inativo — só mantém vínculo existente)" : ""}
                    </option>
                  ))}
                </select>
                {mesa.eventId ? (
                  <button
                    type="button"
                    disabled={pending}
                    className="h-9 rounded-lg border border-movApp-border px-3 text-xs font-medium text-movApp-ink disabled:opacity-50"
                    onClick={() =>
                      runAction(async () => {
                        const r = await resuggestMesaRestaurant(mesa.id);
                        if (r?.message) window.alert(r.message);
                      })
                    }
                  >
                    Nova sugestão de restaurante
                  </button>
                ) : null}
              </div>

              <div className="mt-4 border-t border-movApp-border pt-3.5">
                <p className="text-xs font-semibold uppercase tracking-wide text-movApp-muted">Adicionar participante</p>
                {mesa.members.length >= MAX_MESA_SIZE ? (
                  <p className="mt-2 text-sm text-amber-900">Mesa cheia ({MAX_MESA_SIZE} lugares). Mova ou remova alguém para adicionar.</p>
                ) : (
                  <div className="mt-2 flex flex-wrap gap-2">
                    <select
                      className="h-10 rounded-lg border border-movApp-border px-3 text-sm"
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
                      className="rounded-lg bg-movApp-accent px-4 py-2 text-sm text-white disabled:opacity-50"
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

              <ul className="mt-4 space-y-2.5">
                {mesa.members.map((m) => (
                  <li
                    key={m.memberId}
                    className="flex flex-col gap-2 rounded-lg border border-movApp-border/60 bg-movApp-bg/35 px-3.5 py-2.5 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <Link href={`/admin/users/${m.userId}`} className="font-medium text-movApp-accent hover:underline">
                        {m.name ?? "—"}
                      </Link>
                      <span className="ml-2 text-xs text-movApp-muted">{m.email}</span>
                      <p className="text-xs text-movApp-ink">
                        {m.city ?? "—"} · {m.shortLabel}
                        <span className="ml-1 text-[10px] text-movApp-muted">· aderência ao grupo {m.fitScore}/100</span>
                      </p>
                      {m.fitAttention ? (
                        <p className="text-[11px] text-amber-900">Atenção: {m.fitAttention}</p>
                      ) : null}
                      <details className="mt-1 text-[11px] text-movApp-muted">
                        <summary className="cursor-pointer">Ver tags de perfil</summary>
                        <p className="mt-1">{m.tagsPreview}</p>
                      </details>
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
                        className="h-8 rounded border border-movApp-border px-2 text-xs"
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

      <section className="rounded-2xl border border-dashed border-movApp-border bg-movApp-paper/50 p-5">
        <h3 className="text-sm font-semibold text-movApp-ink">Mover por ID (alternativa)</h3>
        <p className="text-xs text-movApp-muted">Escolha um participante que já está numa mesa e a mesa destino.</p>
        <div className="mt-2 flex flex-wrap gap-2">
          <select
            className="h-10 rounded-lg border px-3 text-sm"
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
            className="h-10 rounded-lg border px-3 text-sm"
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
            className="rounded-lg bg-movApp-accent px-4 py-2 text-sm text-white disabled:opacity-50"
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
