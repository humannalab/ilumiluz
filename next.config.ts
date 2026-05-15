import type { NextConfig } from "next";
// withSentryConfig desativado temporariamente — Sentry ainda não tem DSN
// configurada no Vercel, e o wrap quebra o middleware Edge sem token.
// Reabilitar quando SENTRY_DSN estiver configurado.
// import { withSentryConfig } from "@sentry/nextjs";

/**
 * Security headers aplicados em TODAS as rotas.
 *
 * Defesas:
 * - X-Frame-Options: DENY → impede o site de ser carregado em <iframe>
 *   (proteção contra clickjacking)
 * - X-Content-Type-Options: nosniff → impede browsers de "adivinhar"
 *   o content-type de respostas (mitiga XSS via MIME confusion)
 * - Referrer-Policy: strict-origin-when-cross-origin → vaza menos info
 *   pro destinatário em links externos
 * - Strict-Transport-Security (HSTS): força HTTPS por 2 anos.
 *   includeSubDomains + preload é o padrão recomendado
 * - Permissions-Policy: nega câmera/microfone/geolocalização (não usamos)
 * - X-DNS-Prefetch-Control: on → deixa browser resolver DNS antecipado
 *   pra recursos que serão carregados (perf)
 * - Cross-Origin-Opener-Policy: same-origin → janelas abertas via
 *   window.open ficam isoladas. Bloqueia ataques cross-window e
 *   habilita cross-origin isolation (defesa contra Spectre).
 * - Cross-Origin-Resource-Policy: same-origin → impede outros sites
 *   de fazer fetch/embed dos nossos recursos. Bloqueia ataques de
 *   cross-origin loading que exfiltram via timing/cache.
 * - Cross-Origin-Embedder-Policy: NÃO setamos require-corp porque
 *   carregamos avatares Google/GitHub que não enviam CORP — habilitar
 *   quebraria a UI. Pra v2, opção é proxy via /api/avatar.
 * - Content-Security-Policy: fonte permitida explicita pra cada tipo
 *   de recurso. Defesa principal contra XSS e exfiltração
 */

/**
 * Content Security Policy.
 *
 * Estratégia: "default-deny + allowlist explícito" com 'unsafe-inline'
 * em scripts/styles porque o Next.js injeta hydration scripts/styles
 * inline que não conseguimos controlar sem nonce-based config (próxima
 * iteração).
 *
 * Externals que precisamos permitir:
 * - Imagens de avatar Google e GitHub (next/image otimiza mas mantém
 *   o original como fonte — daí permitir o domínio aqui)
 * - Stripe Checkout: nós redirecionamos pra checkout.stripe.com mas
 *   isso é navigation, não fetch nem iframe. Nenhuma exceção CSP.
 * - Google OAuth: tudo via redirect, não precisa exceção pro CSP.
 *
 * frame-ancestors 'none' substitui (e é mais forte que) X-Frame-Options.
 */
const isDev = process.env.NODE_ENV === "development";

// CSP para a loja (tudo exceto /studio)
const csp = [
  "default-src 'self'",
  // 'unsafe-inline' necessário pra hydration scripts do Next.js.
  // Iteração futura: migrar pra nonce-based via middleware.
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://lh3.googleusercontent.com https://avatars.githubusercontent.com https://cdn.sanity.io",
  "font-src 'self' data:",
  "connect-src 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "object-src 'none'",
  "upgrade-insecure-requests",
].join("; ");

// CSP permissivo só para /studio — Sanity Studio exige eval + CDN externos.
// Aplicado apenas à rota /studio; não afeta a loja.
const studioCsp = [
  "default-src 'self'",
  // unsafe-eval necessário: styled-components (usado pelo Sanity) gera CSS em runtime.
  // unsafe-inline necessário: Next.js hydration + estilos inline do Studio.
  // core.sanity-cdn.com: bridge.js embutido na página pelo next-sanity.
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://core.sanity-cdn.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "img-src 'self' data: blob: https://cdn.sanity.io https://lh3.googleusercontent.com https://avatars.githubusercontent.com",
  "font-src 'self' data: https://fonts.gstatic.com",
  // api.sanity.io: GROQ queries e mutações. wss: atualizações em tempo real.
  // telemetry.sanity.io: telemetria do Studio (bloqueado silenciosamente mas não deve crashar).
  "connect-src 'self' https://*.api.sanity.io wss://*.api.sanity.io https://api.sanity.io https://telemetry.sanity.io" + (isDev ? " ws://localhost:3001 ws://localhost:3000" : ""),
  "form-action 'self'",
  // frame-ancestors 'self': Sanity Studio v3 usa iframes same-origin para preview de documentos.
  // 'none' bloqueia isso e causa "Failed to fetch iframe URL".
  "frame-ancestors 'self'",
  // frame-src 'self': permite que o Studio carregue iframes de preview da mesma origem.
  "frame-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "upgrade-insecure-requests",
].join("; ");

const sharedHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
  { key: "X-DNS-Prefetch-Control", value: "on" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "Cross-Origin-Resource-Policy", value: "same-site" },
];

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  ...sharedHeaders,
];

// Headers do Studio: igual ao sharedHeaders mas SEM X-Frame-Options: DENY
// (Sanity Studio usa iframes same-origin para preview; DENY bloqueia e causa crash)
const studioHeaders = [
  { key: "Content-Security-Policy", value: studioCsp },
  // X-Frame-Options: SAMEORIGIN (em vez de DENY) permite iframes same-origin do Studio
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
  { key: "X-DNS-Prefetch-Control", value: "on" },
  // Cross-Origin-Opener-Policy: unsafe-none para /studio — o Studio precisa de
  // cross-origin window access para algumas funcionalidades de preview.
  { key: "Cross-Origin-Opener-Policy", value: "unsafe-none" },
  { key: "Cross-Origin-Resource-Policy", value: "same-site" },
];

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
      { protocol: "https", hostname: "cdn.sanity.io" },
    ],
  },
  async headers() {
    return [
      {
        // /studio e todos os seus sub-paths — CSP permissivo para o Studio
        source: "/studio/:path*",
        headers: studioHeaders,
      },
      {
        // Tudo o resto — CSP estrito da loja
        source: "/((?!studio).*)",
        headers: securityHeaders,
      },
    ];
  },
};

// Sentry desativado até DSN estar configurado no Vercel.
// Para reativar: descomentar o import withSentryConfig acima e
// substituir `export default nextConfig` por `export default withSentryConfig(nextConfig, { ... })`.
export default nextConfig;
