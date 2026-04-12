"use client";

import { signOut } from "next-auth/react";
import { ChevronRightIcon } from "@/components/conta/conta-icons";

export function ContaSairRow() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/" })}
      className="flex min-h-[52px] w-full items-center justify-between gap-3 rounded-2xl border border-movApp-border bg-movApp-paper px-4 py-3.5 text-left shadow-sm ring-1 ring-movApp-border/50 transition active:scale-[0.995] hover:border-movApp-accent/30 hover:bg-movApp-subtle/50"
    >
      <span className="text-[15px] font-medium text-movApp-ink">Sair da conta</span>
      <ChevronRightIcon className="h-5 w-5 shrink-0 text-movApp-muted" />
    </button>
  );
}
