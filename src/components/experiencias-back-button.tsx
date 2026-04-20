"use client";

import { useRouter } from "next/navigation";
import { ArrowBackIcon } from "@/components/conta/conta-icons";

type Props = {
  /** Quando não há histórico suficiente para `router.back()`. */
  fallbackHref?: string;
};

export function ExperienciasBackButton({ fallbackHref = "/app" }: Props) {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => {
        if (typeof window !== "undefined" && window.history.length > 1) {
          router.back();
        } else {
          router.push(fallbackHref);
        }
      }}
      className="mb-1 inline-flex h-10 items-center gap-1.5 rounded-xl px-1.5 text-sm font-medium text-movApp-muted transition hover:bg-movApp-subtle hover:text-movApp-ink"
      aria-label="Voltar"
    >
      <ArrowBackIcon className="shrink-0" />
      <span>Voltar</span>
    </button>
  );
}
