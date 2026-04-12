import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminDeleteUserButton } from "@/components/admin/admin-delete-user-button";
import { AdminMovProfilePanel } from "@/components/admin/admin-mov-profile-panel";
import { adminListHref } from "@/lib/admin-list-href";
import { prisma } from "@/lib/prisma";

type Props = {
  params?: Promise<{ id: string | string[] }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function firstSegment(id: string | string[] | undefined): string | undefined {
  if (id === undefined) return undefined;
  const x = Array.isArray(id) ? id[0] : id;
  return typeof x === "string" ? x : undefined;
}

/** Detalhe estável: RSC sem `mov-admin-profile`; Perfil MOV via painel cliente + server action. */
export default async function AdminUserDetailPage({ params, searchParams }: Props) {
  const raw = params ? await params : undefined;
  const id = firstSegment(raw?.id);
  if (!id) notFound();

  const sp = searchParams ? await searchParams : {};
  const backHref = adminListHref(sp);

  const user = await prisma.user.findFirst({
    where: { id, deletedAt: null },
    select: {
      id: true,
      name: true,
      email: true,
      city: true,
      role: true,
      createdAt: true,
      subscription: { select: { status: true, planCode: true } },
      onboardingAnswers: {
        orderBy: { questionId: "asc" },
        select: {
          questionId: true,
          section: true,
          answerValue: true,
          answerLabel: true,
        },
      },
    },
  });

  if (!user) notFound();

  const answersForView = user.onboardingAnswers
    .map((a) => ({
      questionId: a.questionId,
      section: a.section ?? "Onboarding",
      answerLabel: a.answerLabel,
      answerValue: a.answerValue,
    }))
    .sort((a, b) => a.questionId.localeCompare(b.questionId));

  return (
    <div className="space-y-8">
      <Link href={backHref} className="text-sm font-medium text-movApp-accent hover:underline">
        ← Voltar à lista
      </Link>

      <div>
        <h1 className="font-display text-2xl font-semibold text-movApp-ink">{user.name ?? "Sem nome"}</h1>
        <p className="mt-1 text-sm text-movApp-muted">{user.email}</p>
        <p className="mt-2 text-sm text-movApp-ink">
          {user.city ?? "—"} · {user.role} · {user.subscription?.status ?? "—"} · cadastro{" "}
          {user.createdAt.toLocaleDateString("pt-BR")}
        </p>
        <div className="mt-4">
          <Link
            href="/admin/mesas"
            className="inline-flex rounded-lg border border-movApp-border px-3 py-1.5 text-sm font-medium text-movApp-ink hover:bg-movApp-subtle"
          >
            Montagem de mesas
          </Link>
        </div>
      </div>

      <section className="rounded-xl border border-red-200 bg-red-50/70 p-5">
        <h2 className="font-display text-lg font-semibold text-red-900">Zona de risco · Ações administrativas</h2>
        <p className="mt-1 text-sm text-red-900/90">
          A exclusão inativa o participante (soft delete), remove-o das mesas e bloqueia novo login dessa conta.
        </p>
        <div className="mt-4">
          <AdminDeleteUserButton userId={user.id} isAdmin={user.role === "admin"} />
        </div>
      </section>

      <AdminMovProfilePanel userId={user.id} />

      <section className="rounded-xl border border-movApp-border bg-movApp-paper p-5">
        <h2 className="font-display text-lg font-semibold text-movApp-ink">Respostas do onboarding</h2>
        <p className="mt-1 text-sm text-movApp-muted">Formato bruto: section, questionId, answerLabel, answerValue.</p>
        <ul className="mt-3 space-y-3 text-sm">
          {answersForView.length === 0 ? (
            <li className="text-movApp-muted">Nenhuma resposta.</li>
          ) : (
            answersForView.map((a) => (
              <li key={a.questionId} className="rounded-lg border border-movApp-border/60 px-3 py-2">
                <dl className="grid gap-1">
                  <div className="flex flex-wrap gap-x-2 gap-y-0.5">
                    <dt className="text-xs font-semibold uppercase tracking-wide text-movApp-muted">section</dt>
                    <dd className="text-xs text-movApp-ink">{a.section}</dd>
                  </div>
                  <div className="flex flex-wrap gap-x-2 gap-y-0.5">
                    <dt className="text-xs font-semibold uppercase tracking-wide text-movApp-muted">questionId</dt>
                    <dd>
                      <code className="text-xs text-movApp-ink">{a.questionId}</code>
                    </dd>
                  </div>
                  <div className="flex flex-wrap gap-x-2 gap-y-0.5">
                    <dt className="text-xs font-semibold uppercase tracking-wide text-movApp-muted">answerLabel</dt>
                    <dd className="text-sm text-movApp-ink">{a.answerLabel ?? "—"}</dd>
                  </div>
                  <div className="flex flex-wrap gap-x-2 gap-y-0.5">
                    <dt className="text-xs font-semibold uppercase tracking-wide text-movApp-muted">answerValue</dt>
                    <dd>
                      <code className="text-xs text-movApp-ink">{a.answerValue}</code>
                    </dd>
                  </div>
                </dl>
              </li>
            ))
          )}
        </ul>
      </section>
    </div>
  );
}
