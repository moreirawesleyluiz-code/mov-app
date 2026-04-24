import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const secret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;
const CANDIDATE_COOKIE_NAMES = [
  "__Secure-authjs.session-token",
  "authjs.session-token",
  "__Secure-next-auth.session-token",
  "next-auth.session-token",
] as const;

async function resolveJwtToken(req: NextRequest) {
  const baseArgs = {
    req,
    ...(secret ? { secret } : {}),
  } as const;

  const first = await getToken(baseArgs).catch(() => null);
  if (first) return first;

  for (const cookieName of CANDIDATE_COOKIE_NAMES) {
    const token = await getToken({
      ...baseArgs,
      cookieName,
    }).catch(() => null);
    if (token) return token;
  }
  return null;
}

/**
 * - `/app/*`: sessão obrigatória (cliente).
 * - `/admin` e subrotas exceto `/admin/login`: JWT com `role === "admin"` (Edge: `getToken` lê o cookie; `req.auth.user.role` pode falhar).
 * - `/admin/login`: público; se já autenticado como admin, redireciona para `/admin`.
 * - `/app/*`: sessão obrigatória; admins podem navegar no app (validação de eventos e UX).
 */
export async function middleware(req: NextRequest) {
  if (!secret && process.env.NODE_ENV === "production") {
    console.error("[MOV auth] AUTH_SECRET/NEXTAUTH_SECRET ausente no middleware; sessão pode falhar.");
  }
  const path = req.nextUrl.pathname;
  const isLegacyAplicativo = path === "/aplicativo" || path.startsWith("/aplicativo/");

  if (isLegacyAplicativo) {
    const to = new URL(path.replace(/^\/aplicativo/, "/app"), req.nextUrl.origin);
    to.search = req.nextUrl.search;
    return NextResponse.redirect(to);
  }

  const isApp = path === "/app" || path.startsWith("/app/");
  const isAdminRoute = path === "/admin" || path.startsWith("/admin/");
  const isAdminLogin = path === "/admin/login";

  const token = await resolveJwtToken(req);
  const role = typeof token?.role === "string" ? token.role : undefined;

  if (isAdminRoute) {
    if (isAdminLogin) {
      if (role === "admin") {
        return NextResponse.redirect(new URL("/admin", req.nextUrl.origin));
      }
      const loginRes = NextResponse.next();
      loginRes.headers.set("Cache-Control", "private, no-store, must-revalidate");
      return loginRes;
    }

    if (!token) {
      const login = new URL("/admin/login", req.nextUrl.origin);
      login.searchParams.set("callbackUrl", `${path}${req.nextUrl.search}`);
      return NextResponse.redirect(login);
    }

    if (role !== "admin") {
      return NextResponse.redirect(new URL("/app", req.nextUrl.origin));
    }
    const res = NextResponse.next();
    res.headers.set("Cache-Control", "private, no-store, must-revalidate");
    return res;
  }

  if (isApp) {
    if (!token) {
      if (process.env.NODE_ENV === "production" && req.cookies.getAll().length > 0) {
        console.error("[MOV auth] /app sem token JWT decodificado apesar de cookies presentes.");
      }
      const login = new URL("/login", req.nextUrl.origin);
      login.searchParams.set("callbackUrl", `${path}${req.nextUrl.search}`);
      return NextResponse.redirect(login);
    }
    /** Admins podem abrir `/app/*` para validar o mesmo ecrã que o utilizador (eventos, agenda, etc.). */
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/app", "/app/:path*", "/aplicativo", "/aplicativo/:path*", "/admin", "/admin/:path*"],
};
