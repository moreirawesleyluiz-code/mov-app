"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { updateContaProfileExtra } from "@/lib/conta-actions";
import { CameraIcon } from "@/components/conta/conta-icons";
import { ContaAvatar } from "@/components/conta/conta-avatar";
import type { AppProfileExtra } from "@/lib/app-profile-extra";
import { cn } from "@/lib/utils";

const GENDER_OPTIONS = ["Prefiro não informar", "Feminino", "Masculino", "Não-binário", "Outro"];
const REL_OPTIONS = [
  "Prefiro não informar",
  "Solteiro(a)",
  "Em um relacionamento",
  "Casado(a)",
  "Outro",
];
const COUNTRY_OPTIONS = ["Brasil", "Portugal", "Outro"];

type Props = {
  displayName: string;
  imageUrl: string | null;
  city: string | null;
  extra: AppProfileExtra;
};

export function ContaEditarForm({ displayName, imageUrl, city, extra }: Props) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [firstName, setFirstName] = useState(extra.firstName ?? "");
  const [lastName, setLastName] = useState(extra.lastName ?? "");
  const [phone, setPhone] = useState(extra.phone ?? "");
  const [gender, setGender] = useState(extra.gender ?? "");
  const [relationship, setRelationship] = useState(extra.relationshipStatus ?? "");
  const [industry, setIndustry] = useState(extra.industry ?? "");
  const [birthCountry, setBirthCountry] = useState(extra.birthCountry ?? "Brasil");
  const [birthDate, setBirthDate] = useState(extra.birthDate ?? "");

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  function onPhotoFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !file.type.startsWith("image/")) return;
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    startTransition(async () => {
      try {
        await updateContaProfileExtra({
          firstName: firstName.trim() || undefined,
          lastName: lastName.trim() || undefined,
          phone: phone.trim() || undefined,
          gender: gender || undefined,
          relationshipStatus: relationship || undefined,
          industry: industry.trim() || undefined,
          birthCountry: birthCountry || undefined,
          birthDate: birthDate || undefined,
        });
        setMsg("Perfil atualizado.");
        router.refresh();
      } catch {
        setMsg("Não foi possível guardar. Tente de novo.");
      }
    });
  }

  const cityDisplay = city?.trim() || "—";

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="flex flex-col items-center">
        <div className="relative">
          <ContaAvatar name={displayName} imageUrl={previewUrl ?? imageUrl} />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="sr-only"
            aria-hidden
            tabIndex={-1}
            onChange={onPhotoFileChange}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-1 right-1 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-movApp-border bg-movApp-paper shadow-md transition hover:bg-movApp-subtle"
            aria-label="Alterar foto de perfil"
          >
            <CameraIcon className="text-movApp-accent" />
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-movApp-border bg-movApp-paper p-5 shadow-sm ring-1 ring-movApp-border/60 sm:p-6">
        <div className="space-y-4">
          <Field label="Primeiro nome">
            <input
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className={inputContaClass}
              autoComplete="given-name"
            />
          </Field>
          <Field label="Apelido / sobrenome">
            <input
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className={inputContaClass}
              autoComplete="family-name"
            />
          </Field>
          <Field label="Telefone">
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className={inputContaClass}
              inputMode="tel"
              autoComplete="tel"
            />
          </Field>
          <Field label="Género">
            <select value={gender} onChange={(e) => setGender(e.target.value)} className={inputContaClass}>
              <option value="">Selecionar</option>
              {GENDER_OPTIONS.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Estado de relacionamento">
            <select value={relationship} onChange={(e) => setRelationship(e.target.value)} className={inputContaClass}>
              <option value="">Selecionar</option>
              {REL_OPTIONS.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Indústria / área de trabalho">
            <input value={industry} onChange={(e) => setIndustry(e.target.value)} className={inputContaClass} />
          </Field>
          <Field label="País de nascimento">
            <select value={birthCountry} onChange={(e) => setBirthCountry(e.target.value)} className={inputContaClass}>
              {COUNTRY_OPTIONS.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Data de nascimento">
            <input
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className={inputContaClass}
            />
          </Field>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-movApp-muted">Cidade</p>
            <p
              className={cn(
                "mt-1.5 min-h-[48px] rounded-xl border border-movApp-border bg-movApp-subtle/40 px-3 py-2.5 text-sm",
                cityDisplay === "—" ? "text-movApp-muted" : "text-movApp-ink",
              )}
            >
              {cityDisplay}
            </p>
          </div>
        </div>
      </div>

      {msg ? <p className="text-center text-sm text-movApp-muted">{msg}</p> : null}

      <button
        type="submit"
        disabled={pending}
        className="flex h-12 w-full items-center justify-center rounded-xl bg-movApp-accent text-sm font-semibold text-white shadow-sm transition hover:bg-movApp-accentHover disabled:opacity-70"
      >
        {pending ? "A guardar…" : "Guardar"}
      </button>
    </form>
  );
}

const inputContaClass =
  "mt-1.5 w-full rounded-xl border border-movApp-border bg-white px-3 py-2.5 text-sm text-movApp-ink shadow-sm outline-none transition focus:border-movApp-accent/50 focus:ring-2 focus:ring-movApp-accent/20";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-[11px] font-semibold uppercase tracking-wide text-movApp-muted">{label}</span>
      {children}
    </label>
  );
}
