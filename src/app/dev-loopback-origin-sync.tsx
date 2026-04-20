"use client";

import { useLayoutEffect } from "react";

/**
 * Desvio Playwright vs browser real: testes fixam uma origem; uso manual mistura `localhost` e `127.0.0.1`
 * (cookies e sessão não são partilhados). Redirect no middleware para o outro host é pouco fiável no Next
 * (header Location pode ser normalizado). Este sync corre no cliente o mais cedo possível.
 */
export function DevLoopbackOriginSync() {
  useLayoutEffect(() => {
    if (process.env.NODE_ENV === "production") return;
    const raw = process.env.NEXT_PUBLIC_APP_URL;
    if (!raw) return;
    let canonical: URL;
    try {
      canonical = new URL(raw);
    } catch {
      return;
    }
    const want = canonical.hostname;
    const cur = window.location.hostname;
    if (cur === want) return;
    if (
      (cur !== "localhost" && cur !== "127.0.0.1") ||
      (want !== "localhost" && want !== "127.0.0.1")
    ) {
      return;
    }
    const next = new URL(window.location.href);
    next.hostname = want;
    if (next.href !== window.location.href) {
      window.location.replace(next.href);
    }
  }, []);

  return null;
}
