import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function fmtDate(date: Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function parseEvidenceLinks(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((x): x is string => typeof x === "string");
  } catch {
    return [];
  }
}

function categoryLabel(category: string): string {
  switch (category) {
    case "comportamento_inadequado":
      return "Comportamento inadequado";
    case "assedio":
      return "Assédio";
    case "desrespeito":
      return "Desrespeito";
    case "seguranca":
      return "Segurança";
    default:
      return "Outro";
  }
}

export default async function AdminDenunciasPage() {
  const reports = await prisma.safetyReport.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    select: {
      id: true,
      category: true,
      description: true,
      status: true,
      createdAt: true,
      event: { select: { id: true, title: true, startsAt: true } },
      reporterUser: { select: { id: true, email: true, name: true } },
      reportedUser: { select: { id: true, email: true, name: true } },
      reportedPersonRef: true,
      evidenceLinksJson: true,
    },
  });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-semibold tracking-tight text-movApp-ink">Denúncias</h1>
        <Link href="/admin" className="rounded-lg border border-movApp-border px-3 py-1.5 text-xs font-medium text-movApp-ink">
          Voltar ao dashboard
        </Link>
      </div>

      {reports.length === 0 ? (
        <p className="mt-6 rounded-xl border border-movApp-border bg-movApp-paper p-4 text-sm text-movApp-muted">
          Nenhuma denúncia registrada até o momento.
        </p>
      ) : (
        <div className="mt-5 space-y-4">
          {reports.map((report) => {
            const evidenceLinks = parseEvidenceLinks(report.evidenceLinksJson);
            return (
              <article key={report.id} className="rounded-2xl border border-movApp-border bg-movApp-paper p-4 shadow-sm">
                <div className="flex flex-wrap items-center gap-2 text-xs text-movApp-muted">
                  <span className="rounded-full border border-movApp-border px-2 py-0.5">{categoryLabel(report.category)}</span>
                  <span className="rounded-full border border-movApp-border px-2 py-0.5">{report.status}</span>
                  <span>{fmtDate(report.createdAt)}</span>
                </div>

                <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-movApp-ink">{report.description}</p>

                <div className="mt-3 grid gap-2 text-xs text-movApp-muted sm:grid-cols-2">
                  <p>
                    <strong className="text-movApp-ink">Reportante:</strong>{" "}
                    {report.reporterUser.name ?? report.reporterUser.email}
                  </p>
                  <p>
                    <strong className="text-movApp-ink">Pessoa citada:</strong>{" "}
                    {report.reportedUser?.email ?? report.reportedPersonRef ?? "Não informado"}
                  </p>
                  <p>
                    <strong className="text-movApp-ink">Evento:</strong>{" "}
                    {report.event ? `${report.event.title} (${fmtDate(report.event.startsAt)})` : "Sem vínculo"}
                  </p>
                  <p>
                    <strong className="text-movApp-ink">ID:</strong> {report.id}
                  </p>
                </div>

                {evidenceLinks.length > 0 ? (
                  <div className="mt-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-movApp-muted">Evidências</p>
                    <ul className="mt-1 space-y-1 text-xs">
                      {evidenceLinks.map((link, idx) => (
                        <li key={`${report.id}-${idx}`}>
                          <a
                            href={link}
                            target="_blank"
                            rel="noreferrer"
                            className="break-all text-movApp-accent underline underline-offset-2"
                          >
                            {link}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
