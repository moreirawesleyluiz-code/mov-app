"use client";

import type { PartnerRestaurant } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { savePartnerRestaurantStructured } from "@/app/admin/restaurant-actions";
import {
  AVAILABILITY_KEY_PRESETS,
  CURATION_TAG_PRESETS,
  PARTNER_EXPERIENCE_TYPE_IDS,
  PARTNER_EXPERIENCE_TYPE_LABELS,
} from "@/lib/partner-restaurant-constants";
import { defaultPartnerSavePayload, partnerRestaurantRowToPayload } from "@/lib/partner-restaurant-form-initial";
import type { PartnerRestaurantSavePayload } from "@/lib/partner-restaurant-save";
import { BUDGET_OPTIONS, DIETARY_OPTIONS } from "@/lib/dinner-prefs";
import { AdminPartnerScheduleEditor } from "@/components/admin/admin-partner-schedule-editor";

type Props = {
  initial?: PartnerRestaurant | null;
  title?: string;
};

export function AdminPartnerRestaurantForm({ initial, title }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [customTag, setCustomTag] = useState("");
  const [customAvail, setCustomAvail] = useState("");

  const base = useMemo(
    () => (initial ? partnerRestaurantRowToPayload(initial) : defaultPartnerSavePayload()),
    [initial],
  );
  const [form, setForm] = useState<PartnerRestaurantSavePayload>(base);

  const isEdit = Boolean(initial?.id);

  function set<K extends keyof PartnerRestaurantSavePayload>(key: K, v: PartnerRestaurantSavePayload[K]) {
    setForm((f) => ({ ...f, [key]: v }));
  }

  function submit() {
    setError(null);
    startTransition(async () => {
      try {
        await savePartnerRestaurantStructured(form);
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Erro ao guardar.");
      }
    });
  }

  return (
    <section className="rounded-xl border border-movApp-border bg-movApp-paper p-4">
      <h2 className="font-display text-lg font-semibold text-movApp-ink">
        {title ?? (isEdit ? "Editar parceiro" : "Novo parceiro")}
      </h2>
      {error && (
        <p className="mt-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900" role="alert">
          {error}
        </p>
      )}

      <div className="mt-4 space-y-8">
        <fieldset className="space-y-3">
          <legend className="text-xs font-semibold uppercase tracking-wide text-movApp-muted">Identificação</legend>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-xs text-movApp-muted sm:col-span-2">
              Nome
              <input
                required
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                className="mt-1 w-full rounded border border-movApp-border px-2 py-1.5 text-sm"
              />
            </label>
            <label className="text-xs text-movApp-muted">
              Tipo de parceiro
              <select
                className="mt-1 w-full rounded border border-movApp-border px-2 py-1.5 text-sm"
                value={form.partnerType}
                onChange={(e) =>
                  set("partnerType", e.target.value as PartnerRestaurantSavePayload["partnerType"])
                }
              >
                <option value="restaurant">Restaurante</option>
                <option value="bar">Bar</option>
                <option value="experience_venue">Espaço de experiência</option>
                <option value="other">Outro</option>
              </select>
            </label>
            <label className="text-xs text-movApp-muted">
              Nível
              <select
                className="mt-1 w-full rounded border border-movApp-border px-2 py-1.5 text-sm"
                value={form.premiumLevel}
                onChange={(e) =>
                  set("premiumLevel", e.target.value as PartnerRestaurantSavePayload["premiumLevel"])
                }
              >
                <option value="standard">Standard</option>
                <option value="classico">Clássico</option>
                <option value="sensorial">Sensorial</option>
                <option value="exclusivo">Exclusivo</option>
              </select>
            </label>
            <label className="flex items-center gap-2 text-sm text-movApp-ink sm:col-span-2">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(e) => set("active", e.target.checked)}
                className="rounded"
              />
              Parceiro ativo (elegível para sugestão automática)
            </label>
          </div>
        </fieldset>

        <fieldset className="space-y-3">
          <legend className="text-xs font-semibold uppercase tracking-wide text-movApp-muted">Localização</legend>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-xs text-movApp-muted sm:col-span-2">
              regionKey (zona operacional da reserva)
              <input
                value={form.regionKey ?? ""}
                onChange={(e) => set("regionKey", e.target.value || null)}
                placeholder="ex.: pinheiros-vila-madalena"
                className="mt-1 w-full rounded border border-movApp-border px-2 py-1.5 text-sm"
              />
            </label>
            <label className="text-xs text-movApp-muted">
              Cidade
              <input
                value={form.city ?? ""}
                onChange={(e) => set("city", e.target.value || null)}
                className="mt-1 w-full rounded border border-movApp-border px-2 py-1.5 text-sm"
              />
            </label>
            <label className="text-xs text-movApp-muted">
              Bairro
              <input
                value={form.neighborhood ?? ""}
                onChange={(e) => set("neighborhood", e.target.value || null)}
                className="mt-1 w-full rounded border border-movApp-border px-2 py-1.5 text-sm"
              />
            </label>
            <label className="text-xs text-movApp-muted sm:col-span-2">
              Endereço
              <input
                value={form.address ?? ""}
                onChange={(e) => set("address", e.target.value || null)}
                className="mt-1 w-full rounded border border-movApp-border px-2 py-1.5 text-sm"
              />
            </label>
            <label className="text-xs text-movApp-muted sm:col-span-2">
              Observações de localização
              <textarea
                value={form.locationNotes ?? ""}
                onChange={(e) => set("locationNotes", e.target.value || null)}
                rows={2}
                className="mt-1 w-full rounded border border-movApp-border px-2 py-1.5 text-sm"
              />
            </label>
          </div>
        </fieldset>

        <fieldset className="space-y-3">
          <legend className="text-xs font-semibold uppercase tracking-wide text-movApp-muted">Operação &amp; ambiente</legend>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-xs text-movApp-muted">
              Tipo de ambiente
              <input
                value={form.environmentType ?? ""}
                onChange={(e) => set("environmentType", e.target.value || null)}
                className="mt-1 w-full rounded border border-movApp-border px-2 py-1.5 text-sm"
              />
            </label>
            <label className="text-xs text-movApp-muted">
              Estilo da casa
              <input
                value={form.houseStyle ?? ""}
                onChange={(e) => set("houseStyle", e.target.value || null)}
                className="mt-1 w-full rounded border border-movApp-border px-2 py-1.5 text-sm"
              />
            </label>
            <label className="text-xs text-movApp-muted sm:col-span-2">
              Categorias culinárias
              <input
                value={form.cuisineCategories ?? ""}
                onChange={(e) => set("cuisineCategories", e.target.value || null)}
                className="mt-1 w-full rounded border border-movApp-border px-2 py-1.5 text-sm"
              />
            </label>
            <label className="text-xs text-movApp-muted">
              Lugares por mesa (máx. MOV 6)
              <input
                type="number"
                min={1}
                max={6}
                value={form.seatsPerTableMax}
                onChange={(e) => set("seatsPerTableMax", Number(e.target.value) || 1)}
                className="mt-1 w-full rounded border border-movApp-border px-2 py-1.5 text-sm"
              />
            </label>
            <label className="text-xs text-movApp-muted">
              Limite de mesas simultâneas / evento
              <input
                type="number"
                min={1}
                value={form.tableCapacity}
                onChange={(e) => set("tableCapacity", Number(e.target.value) || 1)}
                className="mt-1 w-full rounded border border-movApp-border px-2 py-1.5 text-sm"
              />
            </label>
            <label className="text-xs text-movApp-muted sm:col-span-2">
              Contato interno
              <input
                value={form.internalContact ?? ""}
                onChange={(e) => set("internalContact", e.target.value || null)}
                className="mt-1 w-full rounded border border-movApp-border px-2 py-1.5 text-sm"
              />
            </label>
            <label className="text-xs text-movApp-muted sm:col-span-2">
              Observações operacionais
              <textarea
                value={form.operationalNotes ?? ""}
                onChange={(e) => set("operationalNotes", e.target.value || null)}
                rows={2}
                className="mt-1 w-full rounded border border-movApp-border px-2 py-1.5 text-sm"
              />
            </label>
          </div>
        </fieldset>

        <fieldset className="space-y-3">
          <legend className="text-xs font-semibold uppercase tracking-wide text-movApp-muted">Agenda</legend>
          <AdminPartnerScheduleEditor value={form.schedule} onChange={(schedule) => set("schedule", schedule)} />
        </fieldset>

        <fieldset className="space-y-3">
          <legend className="text-xs font-semibold uppercase tracking-wide text-movApp-muted">
            Chaves de disponibilidade (cruzamento com a reserva)
          </legend>
          <p className="text-xs text-movApp-muted">
            Só restringe a alocação se preencher pelo menos uma chave. Alinhar com o que os clientes escolhem no fluxo de
            inscrição.
          </p>
          <div className="flex flex-wrap gap-2">
            {AVAILABILITY_KEY_PRESETS.map((k) => {
              const on = form.availabilityKeys.includes(k);
              return (
                <button
                  key={k}
                  type="button"
                  onClick={() =>
                    set(
                      "availabilityKeys",
                      on ? form.availabilityKeys.filter((x) => x !== k) : [...form.availabilityKeys, k],
                    )
                  }
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    on ? "bg-movApp-accent text-white" : "border border-movApp-border bg-white text-movApp-ink"
                  }`}
                >
                  {k}
                </button>
              );
            })}
          </div>
          <div className="flex flex-wrap gap-2">
            <input
              value={customAvail}
              onChange={(e) => setCustomAvail(e.target.value)}
              onKeyDown={(e) => {
                if (e.key !== "Enter") return;
                e.preventDefault();
                const t = customAvail.trim().replace(/\s+/g, "-");
                if (!t || form.availabilityKeys.includes(t)) return;
                set("availabilityKeys", [...form.availabilityKeys, t]);
                setCustomAvail("");
              }}
              placeholder="Outra chave + Enter"
              className="min-w-[180px] flex-1 rounded border border-movApp-border px-2 py-1.5 text-sm"
            />
          </div>
        </fieldset>

        <fieldset className="space-y-3">
          <legend className="text-xs font-semibold uppercase tracking-wide text-movApp-muted">Faixa de preço aceite</legend>
          <div className="flex flex-wrap gap-2">
            {BUDGET_OPTIONS.map((b) => {
              const on = form.priceTierIds.includes(b.id);
              return (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => {
                    if (on && form.priceTierIds.length <= 1) return;
                    set(
                      "priceTierIds",
                      on ? form.priceTierIds.filter((x) => x !== b.id) : [...form.priceTierIds, b.id],
                    );
                  }}
                  className={`rounded-full px-4 py-1.5 text-sm font-medium ${
                    on ? "bg-movApp-ink text-white" : "border border-movApp-border bg-white text-movApp-ink"
                  }`}
                >
                  {b.label}
                </button>
              );
            })}
          </div>
          <label className="text-xs text-movApp-muted">
            Ticket médio estimado (centavos, opcional)
            <input
              type="number"
              min={0}
              value={form.estimatedTicketCents ?? ""}
              onChange={(e) =>
                set("estimatedTicketCents", e.target.value === "" ? null : Number(e.target.value))
              }
              className="mt-1 w-full max-w-xs rounded border border-movApp-border px-2 py-1.5 text-sm"
            />
          </label>
        </fieldset>

        <fieldset className="space-y-3">
          <legend className="text-xs font-semibold uppercase tracking-wide text-movApp-muted">Tipos de experiência / evento</legend>
          <p className="text-xs text-movApp-muted">Seleccione em que tipos de evento este espaço pode ser usado.</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {PARTNER_EXPERIENCE_TYPE_IDS.map((id) => {
              const on = form.experienceTypeIds.includes(id);
              return (
                <label key={id} className="flex items-center gap-2 rounded border border-movApp-border bg-white px-2 py-1.5 text-sm">
                  <input
                    type="checkbox"
                    checked={on}
                    onChange={() =>
                      set(
                        "experienceTypeIds",
                        on ? form.experienceTypeIds.filter((x) => x !== id) : [...form.experienceTypeIds, id],
                      )
                    }
                  />
                  <span>{PARTNER_EXPERIENCE_TYPE_LABELS[id]}</span>
                  <span className="ml-auto font-mono text-[10px] text-movApp-muted">{id}</span>
                </label>
              );
            })}
          </div>
        </fieldset>

        <fieldset className="space-y-3">
          <legend className="text-xs font-semibold uppercase tracking-wide text-movApp-muted">Tags de curadoria</legend>
          <div className="flex flex-wrap gap-2">
            {CURATION_TAG_PRESETS.map((t) => {
              const on = form.curationTags.includes(t);
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() =>
                    set("curationTags", on ? form.curationTags.filter((x) => x !== t) : [...form.curationTags, t])
                  }
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    on ? "bg-movApp-accent text-white" : "border border-movApp-border bg-white text-movApp-ink"
                  }`}
                >
                  {t}
                </button>
              );
            })}
          </div>
          <div className="flex flex-wrap gap-2">
            <input
              value={customTag}
              onChange={(e) => setCustomTag(e.target.value)}
              onKeyDown={(e) => {
                if (e.key !== "Enter") return;
                e.preventDefault();
                const t = customTag.trim();
                if (!t || form.curationTags.includes(t)) return;
                set("curationTags", [...form.curationTags, t]);
                setCustomTag("");
              }}
              placeholder="Nova tag + Enter"
              className="min-w-[180px] flex-1 rounded border border-movApp-border px-2 py-1.5 text-sm"
            />
          </div>
        </fieldset>

        <fieldset className="space-y-3">
          <legend className="text-xs font-semibold uppercase tracking-wide text-movApp-muted">Público mais aderente</legend>
          <label className="text-xs text-movApp-muted">
            Descrição livre (texto curado para a equipa)
            <textarea
              value={form.audienceSummary ?? ""}
              onChange={(e) => set("audienceSummary", e.target.value || null)}
              rows={3}
              className="mt-1 w-full rounded border border-movApp-border px-2 py-1.5 text-sm"
            />
          </label>
        </fieldset>

        <fieldset className="space-y-3">
          <legend className="text-xs font-semibold uppercase tracking-wide text-movApp-muted">Alimentação</legend>
          <label className="flex items-center gap-2 text-sm text-movApp-ink">
            <input
              type="checkbox"
              checked={form.acceptsAllDiets}
              onChange={(e) => set("acceptsAllDiets", e.target.checked)}
              className="rounded"
            />
            Aceita todas as restrições / dietas (equivalente a [&quot;*&quot;])
          </label>
          {!form.acceptsAllDiets && (
            <div className="grid gap-2 sm:grid-cols-2">
              {DIETARY_OPTIONS.map((o) => {
                const on = form.dietaryIds.includes(o.id);
                return (
                  <label key={o.id} className="flex items-center gap-2 rounded border border-movApp-border bg-white px-2 py-1.5 text-sm">
                    <input
                      type="checkbox"
                      checked={on}
                      onChange={() =>
                        set(
                          "dietaryIds",
                          on ? form.dietaryIds.filter((x) => x !== o.id) : [...form.dietaryIds, o.id],
                        )
                      }
                    />
                    {o.label}
                  </label>
                );
              })}
            </div>
          )}
          <label className="text-xs text-movApp-muted">
            Flexibilidade para adaptar pratos
            <select
              className="mt-1 w-full max-w-xs rounded border border-movApp-border px-2 py-1.5 text-sm"
              value={form.dietaryFlexibility}
              onChange={(e) =>
                set("dietaryFlexibility", e.target.value as PartnerRestaurantSavePayload["dietaryFlexibility"])
              }
            >
              <option value="alta">Alta</option>
              <option value="moderada">Moderada</option>
              <option value="baixa">Baixa</option>
            </select>
          </label>
        </fieldset>

        <fieldset className="space-y-4">
          <legend className="text-xs font-semibold uppercase tracking-wide text-movApp-muted">
            Sinais de adequação da casa (0–100)
          </legend>
          <p className="text-xs text-movApp-muted">Usados no fit de experiência da alocação automática.</p>
          {(
            [
              ["fitLightTables", "Mesas mais leves"],
              ["fitDeepTables", "Mesas mais profundas"],
              ["fitPremiumExperience", "Experiência premium"],
              ["fitFirstEncounter", "Primeiro encontro"],
              ["fitExtrovertedGroup", "Grupos extrovertidos"],
              ["fitIntimateGroup", "Grupos intimistas"],
            ] as const
          ).map(([key, label]) => (
            <label key={key} className="block text-xs text-movApp-muted">
              {label}: <strong className="text-movApp-ink">{form[key]}</strong>
              <input
                type="range"
                min={0}
                max={100}
                value={form[key]}
                onChange={(e) => set(key, Number(e.target.value))}
                className="mt-1 block w-full accent-movApp-accent"
              />
            </label>
          ))}
        </fieldset>

        <fieldset className="space-y-3">
          <legend className="text-xs font-semibold uppercase tracking-wide text-movApp-muted">Notas internas</legend>
          <label className="text-xs text-movApp-muted">
            Curadoria humana
            <textarea
              value={form.curadoriaNotes ?? ""}
              onChange={(e) => set("curadoriaNotes", e.target.value || null)}
              rows={3}
              className="mt-1 w-full rounded border border-movApp-border px-2 py-1.5 text-sm"
            />
          </label>
          <label className="text-xs text-movApp-muted">
            Notas gerais
            <textarea
              value={form.notes ?? ""}
              onChange={(e) => set("notes", e.target.value || null)}
              rows={2}
              className="mt-1 w-full rounded border border-movApp-border px-2 py-1.5 text-sm"
            />
          </label>
        </fieldset>

        <button
          type="button"
          disabled={pending}
          onClick={submit}
          className="rounded-lg bg-movApp-accent px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {isEdit ? "Guardar alterações" : "Cadastrar parceiro"}
        </button>
      </div>
    </section>
  );
}
