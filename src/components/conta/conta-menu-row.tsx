import Link from "next/link";
import { ChevronRightIcon } from "@/components/conta/conta-icons";

type Props = {
  href: string;
  label: string;
  description?: string;
};

export function ContaMenuRow({ href, label, description }: Props) {
  return (
    <Link
      href={href}
      className="flex min-h-[52px] items-center justify-between gap-3 rounded-2xl border border-movApp-border bg-movApp-paper px-4 py-3.5 shadow-sm ring-1 ring-movApp-border/50 transition active:scale-[0.995] hover:border-movApp-accent/30 hover:bg-movApp-subtle/50"
    >
      <div className="min-w-0 text-left">
        <p className="text-[15px] font-medium leading-snug text-movApp-ink">{label}</p>
        {description ? <p className="mt-0.5 text-xs leading-relaxed text-movApp-muted">{description}</p> : null}
      </div>
      <ChevronRightIcon className="h-5 w-5 shrink-0 text-movApp-muted" />
    </Link>
  );
}
