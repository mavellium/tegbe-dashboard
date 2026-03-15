import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Definimos apenas as rotas que NÃO precisam de senha
  const publicRoutes = ["/login"];
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));

  // Pegamos o token seguro dos cookies
  const token = request.cookies.get("token")?.value;

  // 2. Regra de Conforto: Usuário logado não precisa ver a tela de login de novo
  if (isPublicRoute && token) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // 3. Se for uma rota pública e ele não tem token, deixa passar (ex: tela de login)
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // 4. REGRA DE OURO SAAS: Se chegou até aqui, é uma rota privada.
  // Se NÃO tem token, bloqueia na hora e manda pro login.
  if (!token) {
    // Você pode até salvar a URL que ele tentou acessar para redirecionar depois do login,
    // mas o padrão simples e seguro é mandar pro /login:
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 5. Tem token e a rota é privada: Acesso Liberado!
  return NextResponse.next();
}

// O Matcher garante que o Proxy NÃO rode em imagens, arquivos do Next.js e APIs internas.
export const config = {
  matcher: [
    /*
     * Intercepta TODAS as rotas da aplicação, EXCETO:
     * - api/ (Sua API já deve ter validação de token interna se necessário)
     * - _next/static (Arquivos javascript/css do Next)
     * - _next/image (Otimização de imagens do Next)
     * - Extensões estáticas (imagens, fontes, favicon, txt)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|site.webmanifest|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};