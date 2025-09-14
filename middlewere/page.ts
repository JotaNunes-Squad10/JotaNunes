

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function parseJwt(token: string) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const token = request.cookies.get("accessToken")?.value;
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const payload = parseJwt(token);
  const isAdmin = payload?.groups?.includes("Administrador");

  if (!isAdmin) {
    // Se não for administrador, redireciona para login
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Se for admin e não estiver na rota /adm, redireciona para /adm
  if (!request.nextUrl.pathname.startsWith("/adm")) {
    return NextResponse.redirect(new URL("/adm", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/adm/:path*"],
};