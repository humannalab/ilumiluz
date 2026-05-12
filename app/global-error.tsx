"use client";

/**
 * Root error boundary — capturado pelo Next.js quando algo quebra
 * fora de qualquer error.tsx mais específico. Reporta pro Sentry
 * antes de renderizar fallback.
 */
import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="pt-BR">
      <body>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100vh",
            padding: "2rem",
            fontFamily:
              "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            backgroundColor: "#fafafa",
            color: "#111",
          }}
        >
          <h1 style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>
            Algo deu errado
          </h1>
          <p style={{ color: "#666", marginBottom: "1.5rem" }}>
            Já fomos notificados e estamos investigando. Tente recarregar a
            página.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: "0.5rem 1.25rem",
              borderRadius: "0.375rem",
              border: "none",
              backgroundColor: "#111",
              color: "#fff",
              cursor: "pointer",
              fontSize: "0.875rem",
            }}
          >
            Recarregar
          </button>
        </div>
      </body>
    </html>
  );
}
