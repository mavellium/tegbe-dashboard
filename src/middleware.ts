import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Rotas públicas
  const publicRoutes = ["/login"];
  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Token do cookie
  const token = request.cookies.get("token")?.value;

  // Usuário logado não acessa login
  if (isPublicRoute && token) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Libera rotas públicas
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Bloqueia se não tiver token
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Liberado
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|site.webmanifest|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};