import type { ReactNode } from "react";

export const dynamic = "force-dynamic";

export default function ContaLayout({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-lg pb-8 font-sans text-movApp-ink sm:max-w-xl lg:max-w-2xl">{children}</div>
  );
}
