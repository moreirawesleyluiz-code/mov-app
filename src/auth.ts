import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";

const googleConfigured =
  Boolean(process.env.AUTH_GOOGLE_ID?.trim()) && Boolean(process.env.AUTH_GOOGLE_SECRET?.trim());

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "E-mail", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        try {
          const { authorizeCredentials } = await import("./lib/credentials-authorize");
          return await authorizeCredentials(credentials ?? {});
        } catch (err) {
          console.error("[MOV auth] credentials authorize:", err);
          return null;
        }
      },
    }),
    ...(googleConfigured
      ? [
          Google({
            clientId: process.env.AUTH_GOOGLE_ID!,
            clientSecret: process.env.AUTH_GOOGLE_SECRET!,
          }),
        ]
      : []),
  ],
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  pages: { signIn: "/login" },
  callbacks: {
    async signIn({ account, profile }) {
      if (account?.provider !== "google") return true;
      const emailRaw = profile && typeof profile === "object" && "email" in profile ? profile.email : undefined;
      if (typeof emailRaw !== "string" || !emailRaw.trim()) return false;
      const { prisma } = await import("./lib/prisma");
      const email = emailRaw.toLowerCase().trim();
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing?.deletedAt) return false;
      return true;
    },
    async jwt({ token, user, account, profile }) {
      if (account?.provider === "google") {
        const emailRaw = profile && typeof profile === "object" && "email" in profile ? profile.email : undefined;
        if (typeof emailRaw !== "string") return token;
        const { upsertGoogleUser } = await import("./lib/google-auth-user");
        const name =
          profile && typeof profile === "object" && "name" in profile && typeof profile.name === "string"
            ? profile.name
            : null;
        const picture =
          profile && typeof profile === "object" && "picture" in profile && typeof profile.picture === "string"
            ? profile.picture
            : null;
        const dbUser = await upsertGoogleUser({
          email: emailRaw,
          name,
          image: picture,
        });
        if (!dbUser) return token;
        token.sub = dbUser.id;
        token.email = dbUser.email;
        token.name = dbUser.name;
        token.role = dbUser.role;
        token.picture = dbUser.image ?? undefined;
        return token;
      }
      if (user) {
        token.sub = user.id;
        token.email = user.email;
        token.name = user.name;
        token.role = (user as { role?: string }).role ?? "user";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
        session.user.role = (token.role as string) ?? "user";
        if (typeof token.picture === "string") {
          session.user.image = token.picture;
        }
      }
      return session;
    },
  },
});
