"use client";

import { SessionProvider } from "next-auth/react";
import { DevLoopbackOriginSync } from "./dev-loopback-origin-sync";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider refetchOnWindowFocus={false} refetchWhenOffline={false}>
      <DevLoopbackOriginSync />
      {children}
    </SessionProvider>
  );
}
