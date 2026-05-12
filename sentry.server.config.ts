/**
 * Sentry — config do servidor (Node.js runtime).
 *
 * Captura erros em route handlers, server components, server actions,
 * e qualquer código que rode no Node.
 */
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  tracesSampleRate: 0.1,

  enabled: process.env.NODE_ENV === "production",

  // Não capturar erros de validação Zod ou similares — esperados, não bug
  beforeSend(event, hint) {
    const err = hint.originalException;
    if (err && typeof err === "object" && "name" in err) {
      const name = (err as Error).name;
      if (name === "ZodError") return null;
    }
    return event;
  },
});
