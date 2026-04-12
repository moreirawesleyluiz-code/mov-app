import { redirect } from "next/navigation";
import { auth } from "@/auth";

/** Páginas server: redireciona se não for admin. */
export async function requireAdminPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/admin/login");
  }
  if (session.user.role !== "admin") {
    redirect("/app");
  }
  return session;
}

/** Server actions: falha com erro se não for admin (não redireciona). */
export async function assertAdminRole() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "admin") {
    throw new Error("Acesso negado.");
  }
  return session;
}
