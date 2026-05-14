/**
 * Next.js instrumentation hook — carrega configs do Sentry conforme
 * o runtime ativo. Sem isso o SDK do servidor não inicializa.
 *
 * https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 *
 * Nota: onRequestError (captureRequestError) removido temporariamente.
 * O import direto de @sentry/nextjs no topo do módulo causa crash no
 * Edge runtime quando Sentry não está configurado com DSN válida.
 * Reabilitar junto com a configuração do Sentry.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./sentry.server.config");
  }
  // Edge runtime: Sentry desativado até DSN estar configurada
  // if (process.env.NEXT_RUNTIME === "edge") {
  //   await import("./sentry.edge.config");
  // }
}
