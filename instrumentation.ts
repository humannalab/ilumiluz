/**
 * Next.js instrumentation hook — carrega configs do Sentry conforme
 * o runtime ativo. Sem isso o SDK do servidor não inicializa.
 *
 * https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./sentry.server.config");
  }
  if (process.env.NEXT_RUNTIME === "edge") {
    await import("./sentry.edge.config");
  }
}

// Re-exporta hook do Sentry pra capturar erros de request automaticamente
// em route handlers (App Router). Em v10 foi renomeado pra captureRequestError.
export { captureRequestError as onRequestError } from "@sentry/nextjs";
