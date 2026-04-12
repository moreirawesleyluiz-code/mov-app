import Link from "next/link";
import { ResetPasswordForm } from "./reset-password-form";

type Props = { searchParams?: Promise<Record<string, string | string[] | undefined>> };

export default async function ResetPasswordPage({ searchParams }: Props) {
  const sp = searchParams ? await searchParams : {};
  const raw = sp.token;
  const token = typeof raw === "string" ? raw : Array.isArray(raw) ? raw[0] : undefined;

  if (!token) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <p className="text-movApp-ink">Link inválido ou incompleto.</p>
        <Link href="/forgot-password" className="mt-4 inline-block text-movApp-accent hover:underline">
          Pedir novo link
        </Link>
      </div>
    );
  }

  return <ResetPasswordForm token={token} />;
}
