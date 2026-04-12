import Link from "next/link";
import { ArrowBackIcon } from "@/components/conta/conta-icons";

type Props = {
  backHref: string;
  title: string;
};

/** Cabeçalho com seta à esquerda e título centrado (mobile-first). */
export function ContaSubpageHeader({ backHref, title }: Props) {
  return (
    <div className="relative mb-8 flex min-h-[48px] items-center justify-center px-2">
      <Link
        href={backHref}
        className="absolute left-0 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-xl text-movApp-ink transition hover:bg-movApp-subtle"
        aria-label="Voltar"
      >
        <ArrowBackIcon />
      </Link>
      <h1 className="pointer-events-none text-center font-display text-xl leading-tight text-movApp-ink sm:text-2xl">
        {title}
      </h1>
    </div>
  );
}
