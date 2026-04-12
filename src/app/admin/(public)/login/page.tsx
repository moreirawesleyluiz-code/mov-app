import { AdminLoginEntry } from "@/components/admin/admin-login-entry";

/**
 * RSC mínimo: um único boundary cliente. Sem @/auth, sem next-auth, sem redirects no servidor.
 */
export default function AdminLoginPage() {
  return <AdminLoginEntry />;
}
