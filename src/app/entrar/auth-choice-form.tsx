"use client";

import { Suspense } from "react";
import { AuthChoiceInner } from "./auth-choice-inner";

type Props = {
  googleAuthEnabled: boolean;
};

export function AuthChoiceForm({ googleAuthEnabled }: Props) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[100dvh] items-center justify-center bg-movApp-bg text-[13px] text-movApp-muted [color-scheme:light]">
          Carregando…
        </div>
      }
    >
      <AuthChoiceInner googleAuthEnabled={googleAuthEnabled} />
    </Suspense>
  );
}
