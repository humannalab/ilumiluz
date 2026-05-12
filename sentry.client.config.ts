/**
 * Sentry — config do navegador (browser SDK).
 *
 * Captura erros de JS no client, navegação e performance.
 */
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Amostragem de traces de performance. Começa baixo (10%) pra não estourar
  // a cota grátis (5k events/mês). Subir conforme o tráfego.
  tracesSampleRate: 0.1,

  // Session replay desativado por padrão (custa bastante quota + privacidade).
  // Habilitar só pra debug específico via Sentry.replayIntegration().
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: 0,

  // Em dev, não polui o Sentry. Erros aparecem só no console.
  enabled: process.env.NODE_ENV === "production",

  // Filtra erros conhecidos que vêm de extensões/navegador, não da app
  ignoreErrors: [
    "ResizeObserver loop limit exceeded",
    "ResizeObserver loop completed with undelivered notifications",
    // Erros de extensão do Chrome
    /extension:\//i,
    // Network errors que são culpa do cliente (sem conexão, timeout)
    "NetworkError",
    "Failed to fetch",
  ],
});
