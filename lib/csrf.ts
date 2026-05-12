import { NextRequest, NextResponse } from "next/server";

/**
 * CSRF defense usando Fetch Metadata Request Headers.
 *
 * Estratégia (recomendada pelo OWASP em 2024+ pra SPAs same-origin):
 *
 * 1. PRIMÁRIO: Sec-Fetch-Site (suportado em todos browsers desde 2020)
 *    - "same-origin" → mesma URL → seguro
 *    - "same-site" → subdomínio próprio → seguro
 *    - "none" → digitado direto na barra ou bookmark → seguro
 *    - "cross-site" → veio de outro site → BLOQUEAR
 *
 * 2. FALLBACK: Origin header (browsers antigos / sem Sec-Fetch-Site)
 *    Compara contra a lista de origins permitidas.
 *
 * Por que NÃO usar tokens CSRF tradicionais:
 * - Cookie já é SameSite=Lax (default Auth.js v5) → CSRF clássico
 *   já bloqueado pelo browser pra POST cross-site
 * - Sec-Fetch-Site adiciona uma camada redundante moderna
 * - Tokens CSRF exigem state server-side ou cookie duplo → mais
 *   complexidade sem ganho real pro nosso modelo de ameaça
 */

const ALLOWED_ORIGINS_PROD = [
  "https://barthofinance.com",
  "https://www.barthofinance.com",
];

const ALLOWED_ORIGINS_DEV = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
];

function getAllowedOrigins(): string[] {
  // Em dev, aceita ambos. Em prod, só os de produção.
  if (process.env.NODE_ENV === "production") {
    return ALLOWED_ORIGINS_PROD;
  }
  return [...ALLOWED_ORIGINS_PROD, ...ALLOWED_ORIGINS_DEV];
}

/**
 * Verifica se a requisição passa o check CSRF. Retorna:
 * - null se OK (deixa passar)
 * - NextResponse 403 se bloqueado
 *
 * Use só em métodos mutativos (POST/PUT/PATCH/DELETE).
 */
export function csrfCheck(req: NextRequest): NextResponse | null {
  const fetchSite = req.headers.get("sec-fetch-site");

  // Path mais comum: header presente. Fail-closed: se não for um dos valores
  // seguros conhecidos, bloqueia.
  if (fetchSite) {
    const safe = fetchSite === "same-origin" || fetchSite === "same-site" || fetchSite === "none";
    if (safe) return null;
    return forbidden("CSRF: cross-site request blocked.");
  }

  // Fallback pra browsers/clientes sem Sec-Fetch-Site (raríssimo em 2026,
  // mas postman/curl/scripts caem aqui)
  const origin = req.headers.get("origin");
  const referer = req.headers.get("referer");
  const allowed = getAllowedOrigins();

  if (origin) {
    if (allowed.includes(origin)) return null;
    return forbidden("CSRF: origin not allowed.");
  }
  if (referer) {
    try {
      const refOrigin = new URL(referer).origin;
      if (allowed.includes(refOrigin)) return null;
    } catch {
      // referer malformado → cai no bloqueio
    }
    return forbidden("CSRF: referer not allowed.");
  }

  // Sem nenhum header de origem identificável → bloqueia.
  // Clients legítimos server-to-server (Stripe webhook, etc.) devem
  // ser excluídos do middleware ANTES de chegar aqui.
  return forbidden("CSRF: missing origin headers.");
}

function forbidden(reason: string): NextResponse {
  return new NextResponse(
    JSON.stringify({ error: "Forbidden", reason }),
    { status: 403, headers: { "Content-Type": "application/json" } }
  );
}
