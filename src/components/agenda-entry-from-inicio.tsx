"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { JANTAR_FROM_INICIO_KEY } from "@/lib/jantar-nav-inicio";

function markJantarFromInicio() {
  try {
    sessionStorage.setItem(JANTAR_FROM_INICIO_KEY, "1");
  } catch {
    /* ignore */
  }
}

type Props = {
  href: string;
  className?: string;
  children: ReactNode;
};

/** Links para o fluxo do jantar a partir da página Início — mantém o item Início ativo no menu. */
export function AgendaEntryFromInicio({ href, className, children }: Props) {
  return (
    <Link href={href} className={className} onClick={markJantarFromInicio}>
      {children}
    </Link>
  );
}
