"use client";

import Image from "next/image";

/** Seta — header de voltar (welcome, onboarding, /entrar). */
export function IconBack({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M15 18 9 12l6-6" />
    </svg>
  );
}

/** Wordmark no canto superior — `public/mov-logo.svg`. */
export function MovWelcomeLogo() {
  return (
    <div className="flex shrink-0 items-start justify-start">
      <Image
        src="/mov-logo.svg"
        alt="MOV"
        width={104}
        height={28}
        priority
        className="h-7 w-auto max-w-[6.5rem] object-contain object-left"
      />
    </div>
  );
}
