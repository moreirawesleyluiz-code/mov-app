import { prisma } from "./prisma";

/**
 * Liga o login Google a um utilizador na base de dados.
 * Se o e-mail já existir (conta por senha), devolve esse utilizador — o mesmo e-mail pode usar Google ou credenciais.
 */
export async function upsertGoogleUser(opts: {
  email: string;
  name: string | null;
  image: string | null;
}) {
  const email = opts.email.toLowerCase().trim();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    if (existing.deletedAt) return null;
    return existing;
  }
  return prisma.user.create({
    data: {
      email,
      name: opts.name,
      image: opts.image,
      passwordHash: null,
    },
  });
}
