import { NextRequest, NextResponse } from "next/server";

// Middleware leve (Edge-safe): NÃO importa Auth.js para manter abaixo de 1MB.
// Verifica o cookie de sessão diretamente.
// CSRF inline (sem import @/) para compatibilidade com Vercel Edge runtime.

const PROTECTED_PATHS = [
  "/conta",
  "/pedidos",
  "/settings",
  "/onboarding",
  "/admin",
];
const AUTH_COOKIE = "authjs.session-token";
const SECURE_AUTH_COOKIE = "__Secure-authjs.session-token";

const MUTATING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

// Rotas /api/* excluídas do CSRF (validam autenticidade por outros meios)
const CSRF_EXEMPT_PREFIXES = [
  "/api/stripe/webhook",
  "/api/auth/callback",
  "/api/auth/signin",
  "/api/auth/signout",
  "/api/auth/csrf",
  "/api/auth/session",
  "/api/auth/providers",
];

const ALLOWED_ORIGINS = [
  "https://ilumiluz.com",
  "https://www.ilumiluz.com",
  // Vercel preview URLs
  "https://ilumiluz-store.vercel.app",
  // Dev local
  "http://localhost:3000",
  "http://localhost:3001",
  "http://127.0.0.1:3000",
];

/**
 * Verifica CSRF usando Fetch Metadata Request Headers.
 * Embutido aqui para compatibilidade com Vercel Edge Functions
 * (path alias @/ não resolve no edge bundler).
 */
function csrfCheck(req: NextRequest): NextResponse | null {
  const fetchSite = req.headers.get("sec-fetch-site");

  if (fetchSite) {
    const safe =
      fetchSite === "same-origin" ||
      fetchSite === "same-site" ||
      fetchSite === "none";
    if (safe) return null;
    return new NextResponse(
      JSON.stringify({ error: "Forbidden", reason: "CSRF: cross-site request blocked." }),
      { status: 403, headers: { "Content-Type": "application/json" } }
    );
  }

  const origin = req.headers.get("origin");
  const referer = req.headers.get("referer");

  if (origin) {
    if (ALLOWED_ORIGINS.includes(origin)) return null;
    return new NextResponse(
      JSON.stringify({ error: "Forbidden", reason: "CSRF: origin not allowed." }),
      { status: 403, headers: { "Content-Type": "application/json" } }
    );
  }
  if (referer) {
    try {
      const refOrigin = new URL(referer).origin;
      if (ALLOWED_ORIGINS.includes(refOrigin)) return null;
    } catch {
      // referer malformado
    }
    return new NextResponse(
      JSON.stringify({ error: "Forbidden", reason: "CSRF: referer not allowed." }),
      { status: 403, headers: { "Content-Type": "application/json" } }
    );
  }

  return new NextResponse(
    JSON.stringify({ error: "Forbidden", reason: "CSRF: missing origin headers." }),
    { status: 403, headers: { "Content-Type": "application/json" } }
  );
}

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
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)",
  ],
};
