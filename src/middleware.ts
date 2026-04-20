import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const secret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;

/**
 * - `/app/*`: sessão obrigatória (cliente).
 * - `/admin` e subrotas exceto `/admin/login`: JWT com `role === "admin"` (Edge: `getToken` lê o cookie; `req.auth.user.role` pode falhar).
 * - `/admin/login`: público; se já autenticado como admin, redireciona para `/admin`.
 */
export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const isApp = path === "/app" || path.startsWith("/app/");
  const isAdminRoute = path === "/admin" || path.startsWith("/admin/");
  const isAdminLogin = path === "/admin/login";

  const token = secret ? await getToken({ req, secret }).catch(() => null) : null;
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
    if (role === "admin") {
      return NextResponse.redirect(new URL("/admin", req.nextUrl.origin));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/app", "/app/:path*", "/admin", "/admin/:path*"],
};
