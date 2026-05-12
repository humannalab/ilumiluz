import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

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
const csp = [
  "default-src 'self'",
  // 'unsafe-inline' necessário pra hydration scripts do Next.js.
  // Iteração 3: migrar pra nonce-based via middleware.
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://lh3.googleusercontent.com https://avatars.githubusercontent.com https://cdn.sanity.io",
  "font-src 'self' data:",
  // Fetch/XHR só pra nosso próprio domínio
  "connect-src 'self'",
  // Forms só submetem pra nós (nada externo)
  "form-action 'self'",
  // Ninguém pode embarcar nosso site em iframe (anti-clickjacking)
  "frame-ancestors 'none'",
  // base href fixo
  "base-uri 'self'",
  // Sem plugins (Flash/Java/etc)
  "object-src 'none'",
  // HTTP→HTTPS automático em recursos
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
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
  // Cross-origin isolation. "same-origin" é o setting mais forte que
  // ainda permite popups (necessário pro fluxo Stripe Checkout que abre
  // em nova aba). Pra "same-origin-allow-popups" se quebrar algo.
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  // CORP "same-site" permite que subdomínios (futuro: api.barthofinance.com,
  // app.barthofinance.com) carreguem recursos. Em "same-origin" seria
  // mais restritivo mas quebra qualquer multi-domain setup.
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
        // Aplica a TODAS as rotas
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

/**
 * Wrap com Sentry pra:
 * - Upload de source maps no build (precisa SENTRY_AUTH_TOKEN no env)
 * - Tunneling de eventos via /monitoring → escapa ad-blockers + mantém
 *   CSP estrito (sem precisar liberar ingest.sentry.io no connect-src)
 * - Annotation de componentes React pra stack traces mais legíveis
 */
export default withSentryConfig(nextConfig, {
  org: "humanna-lab",
project: "ilumiluz-store",

  // Suprime logs do plugin no build local (só fala em CI)
  silent: !process.env.CI,

  // Upload source maps de mais lugares — pega chunks dinâmicos do App Router
  widenClientFileUpload: true,

  // Esconde source maps em produção (ainda upload pro Sentry, mas não
  // expõe publicamente em /_next/static/*.map)
  sourcemaps: {
    deleteSourcemapsAfterUpload: true,
  },

  // Remove logger do Sentry do bundle de produção (-2kb)
  disableLogger: true,

  // Habilita monitoring automático de Cron jobs / ISR via Vercel
  automaticVercelMonitors: true,

  // Tunneling — eventos do client passam por /monitoring no nosso domínio
  // antes de irem pro Sentry. Bypass de ad-blockers + permite manter CSP
  // sem allowlist de ingest.sentry.io. Vercel rewrite handles isso.
  tunnelRoute: "/monitoring",
});
