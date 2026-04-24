import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const secret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;

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

  const token = await getToken({
    req,
    ...(secret ? { secret } : {}),
  }).catch(() => null);
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
