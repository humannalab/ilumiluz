/**
 * Sentry — config do Edge runtime (middleware.ts).
 *
 * O middleware roda em V8 isolates da Vercel, não Node.js. SDK é
 * mais limitado mas captura erros do middleware.
 */
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  // DSN vazio desativa Sentry graciosamente (sem crash)
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || undefined,
  tracesSampleRate: 0.1,
  enabled: process.env.NODE_ENV === "production" && !!process.env.NEXT_PUBLIC_SENTRY_DSN,
});
