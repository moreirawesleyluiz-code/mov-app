"use client";

import type { PartnerScheduleDocument, PartnerScheduleSlot, PartnerScheduleSlotKind } from "@/lib/partner-restaurant-schedule";
import { PARTNER_SCHEDULE_DAY_BASIS, SLOT_KIND_LABELS, WEEKDAY_LABELS_SHORT } from "@/lib/partner-restaurant-schedule";

type Props = {
  value: PartnerScheduleDocument;
  onChange: (next: PartnerScheduleDocument) => void;
};

const SLOT_KINDS: PartnerScheduleSlotKind[] = ["lunch", "dinner", "night", "other"];

function newSlot(): PartnerScheduleSlot {
  return {
    dayOfWeek: 4,
    slotKind: "dinner",
    active: true,
    slotKey: "",
    windowLabel: "",
    notes: "",
  };
}

export function AdminPartnerScheduleEditor({ value, onChange }: Props) {
  const slots = value.slots;

  function patchSlots(nextSlots: PartnerScheduleSlot[]) {
    onChange({ ...value, slots: nextSlots });
  }

  return (
    <div className="space-y-3 rounded-lg border border-movApp-border bg-white/60 p-3">
      <div className="rounded-md bg-movApp-bg/80 px-3 py-2 text-xs text-movApp-ink">
        <p className="font-semibold text-movApp-muted">Referência temporal</p>
        <p className="mt-1 leading-relaxed text-movApp-muted">
          O dia da semana de cada linha compara-se ao <strong className="text-movApp-ink">dia UTC</strong> de{" "}
          <code className="rounded bg-white px-1">Event.startsAt</code> (0=domingo … 6=sábado). Base:{" "}
          <code className="rounded bg-white px-1">{PARTNER_SCHEDULE_DAY_BASIS}</code>. Sem linhas activas = sem bloqueio
          por agenda na alocação.
        </p>
      </div>
      {slots.length === 0 ? (
        <p className="text-xs text-movApp-muted">Nenhum slot — o parceiro não fica restrito por dia da semana.</p>
      ) : (
        <ul className="space-y-3">
          {slots.map((slot, i) => (
            <li
              key={i}
              className="grid gap-2 rounded-lg border border-movApp-border/70 bg-movApp-paper/50 p-2 sm:grid-cols-2 lg:grid-cols-6"
            >
              <label className="text-xs text-movApp-muted lg:col-span-1">
                Dia (UTC do evento)
                <select
                  className="mt-1 w-full rounded border border-movApp-border px-2 py-1 text-sm"
                  value={slot.dayOfWeek}
                  onChange={(e) =>
                    patchSlots(
                      slots.map((s, j) => (j === i ? { ...s, dayOfWeek: Number(e.target.value) } : s)),
                    )
                  }
                >
                  {WEEKDAY_LABELS_SHORT.map((lab, dow) => (
                    <option key={dow} value={dow}>
                      {dow} — {lab}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-xs text-movApp-muted lg:col-span-1">
                Tipo de slot
                <select
                  className="mt-1 w-full rounded border border-movApp-border px-2 py-1 text-sm"
                  value={slot.slotKind}
                  onChange={(e) =>
                    patchSlots(
                      slots.map((s, j) =>
                        j === i ? { ...s, slotKind: e.target.value as PartnerScheduleSlotKind } : s,
                      ),
                    )
                  }
                >
                  {SLOT_KINDS.map((k) => (
                    <option key={k} value={k}>
                      {SLOT_KIND_LABELS[k]}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-xs text-movApp-muted lg:col-span-1">
                Chave (opcional)
                <input
                  className="mt-1 w-full rounded border border-movApp-border px-2 py-1 text-sm"
                  value={slot.slotKey ?? ""}
                  placeholder="ex.: quinta-noite"
                  onChange={(e) =>
                    patchSlots(slots.map((s, j) => (j === i ? { ...s, slotKey: e.target.value || undefined } : s)))
                  }
                />
              </label>
              <label className="text-xs text-movApp-muted lg:col-span-1">
                Janela (rótulo)
                <input
                  className="mt-1 w-full rounded border border-movApp-border px-2 py-1 text-sm"
                  value={slot.windowLabel ?? ""}
                  placeholder="ex.: 19h–23h"
                  onChange={(e) =>
                    patchSlots(
                      slots.map((s, j) => (j === i ? { ...s, windowLabel: e.target.value || undefined } : s)),
                    )
                  }
                />
              </label>
              <label className="text-xs text-movApp-muted lg:col-span-2">
                Notas do slot
                <input
                  className="mt-1 w-full rounded border border-movApp-border px-2 py-1 text-sm"
                  value={slot.notes ?? ""}
                  onChange={(e) =>
                    patchSlots(slots.map((s, j) => (j === i ? { ...s, notes: e.target.value || undefined } : s)))
                  }
                />
              </label>
              <div className="flex flex-wrap items-center gap-3 lg:col-span-6">
                <label className="flex items-center gap-2 text-xs text-movApp-ink">
                  <input
                    type="checkbox"
                    checked={slot.active}
                    onChange={(e) =>
                      patchSlots(slots.map((s, j) => (j === i ? { ...s, active: e.target.checked } : s)))
                    }
                  />
                  Slot activo (só estes entram na alocação)
                </label>
                <button
                  type="button"
                  className="text-xs text-red-700 underline"
                  onClick={() => patchSlots(slots.filter((_, j) => j !== i))}
                >
                  Remover linha
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
      <button
        type="button"
        className="rounded-lg border border-movApp-border bg-white px-3 py-1.5 text-xs font-medium text-movApp-ink"
        onClick={() => patchSlots([...slots, newSlot()])}
      >
        + Adicionar slot de agenda
      </button>
    </div>
  );
}
