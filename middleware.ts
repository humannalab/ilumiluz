import { NextRequest, NextResponse } from "next/server";
import { csrfCheck } from "@/lib/csrf";

// Middleware leve (Edge-safe): NÃO importa Auth.js para manter abaixo de 1MB.
// Verifica o cookie de sessão diretamente.
const PROTECTED_PATHS = [
  "/conta",
  "/pedidos",
  "/settings",
  "/onboarding",
  "/admin",
];
const AUTH_COOKIE = "authjs.session-token";
const SECURE_AUTH_COOKIE = "__Secure-authjs.session-token";

// Métodos mutativos que precisam de check CSRF
const MUTATING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

// Rotas /api/* excluídas do CSRF (validam autenticidade por outros meios)
const CSRF_EXEMPT_PREFIXES = [
  // Stripe webhook: chama de servidores Stripe, valida via signature header
  "/api/stripe/webhook",
  // Auth.js: já tem CSRF próprio (token + cookie verification)
  "/api/auth/callback",
  "/api/auth/signin",
  "/api/auth/signout",
  "/api/auth/csrf",
  "/api/auth/session",
  "/api/auth/providers",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── 1. CSRF check em métodos mutativos do /api/* ──
  if (pathname.startsWith("/api/") && MUTATING_METHODS.has(request.method)) {
    const exempt = CSRF_EXEMPT_PREFIXES.some((p) => pathname.startsWith(p));
    if (!exempt) {
      const csrfBlock = csrfCheck(request);
      if (csrfBlock) return csrfBlock;
    }
  }

  // ── 2. Proteção de páginas autenticadas ──
  const isProtected = PROTECTED_PATHS.some((p) => pathname.startsWith(p));
  if (!isProtected) return NextResponse.next();

  const sessionToken =
    request.cookies.get(AUTH_COOKIE)?.value ||
    request.cookies.get(SECURE_AUTH_COOKIE)?.value;

  if (!sessionToken) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  // Inclui /api/* agora pra rodar CSRF check.
  // Exclui assets estáticos pra performance.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)",
  ],
};
