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
  const path = request.nextUrl.pathname;
  
  if (path === "/login") {
    return NextResponse.next();
  }

  const token = request.cookies.get("accessToken")?.value;
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const payload = parseJwt(token);
  if (!payload) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Verifica se o token expirou
  const now = Math.floor(Date.now() / 1000); 
  if (payload.exp && payload.exp < now) {
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete("accessToken"); 
    return response;
  }

  const groups = payload?.groups;
  const isAdmin = Array.isArray(groups)
    ? groups.includes("Administrador")
    : typeof groups === "string"
    ? groups.split(",").map((s: string) => s.trim()).includes("Administrador")
    : false;

  if (path === "/") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (path.startsWith("/dashboard")) {
    return NextResponse.next();
  }

  if (path.startsWith("/adm")) {
    if (isAdmin) return NextResponse.next();
   return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|img/).*)",
  ],
};