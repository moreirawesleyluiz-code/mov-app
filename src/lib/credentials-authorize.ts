import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

/**
 * Só é carregado quando o Credentials `authorize` corre (login), não no GET /api/auth/session.
 */
export async function authorizeCredentials(credentials: {
  email?: unknown;
  password?: unknown;
}): Promise<{
  id: string;
  email: string;
  name?: string;
  image?: string;
  role: string;
} | null> {
  if (!credentials?.email || !credentials?.password) return null;
  const email = String(credentials.email).toLowerCase().trim();
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return null;
  if (user.deletedAt) return null;
  if (!user.passwordHash) return null;
  const ok = await bcrypt.compare(String(credentials.password), user.passwordHash);
  if (!ok) return null;
  return {
    id: user.id,
    email: user.email,
    name: user.name ?? undefined,
    image: user.image ?? undefined,
    role: user.role,
  };
}
