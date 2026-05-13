import { db } from "@/lib/db";

/**
 * Rate limiting baseado na tabela RateLimit do Prisma.
 * Funciona em ambiente serverless (sem in-memory state).
 *
 * Estratégia: cada chave (ex: "signup:ip:1.2.3.4") tem um contador e
 * um `resetAt`. Quando `resetAt` passa, a janela expirou e o contador
 * é zerado na próxima requisição.
 *
 * Não é distribuído de forma atômica, mas pra abuso típico (humano,
 * brute-force, scripts simples) é suficiente. Pra escala maior, migrar
 * pra Upstash Redis com `@upstash/ratelimit`.
 */
export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
}

export async function checkRateLimit(
  key: string,
  options: { max: number; windowMs: number }
): Promise<RateLimitResult> {
  const now = new Date();
  const nextResetAt = new Date(now.getTime() + options.windowMs);

  const existing = await db.rateLimit.findUnique({ where: { key } });

  // Janela nova ou expirada — reseta
  if (!existing || existing.resetAt <= now) {
    await db.rateLimit.upsert({
      where: { key },
      create: { key, count: 1, resetAt: nextResetAt },
      update: { count: 1, resetAt: nextResetAt },
    });
    return {
      allowed: true,
      remaining: options.max - 1,
      resetAt: nextResetAt,
    };
  }

  // Janela ainda ativa — passou do limite?
  if (existing.count >= options.max) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: existing.resetAt,
    };
  }

  // Incrementa
  const updated = await db.rateLimit.update({
    where: { key },
    data: { count: { increment: 1 } },
  });

  return {
    allowed: true,
    remaining: Math.max(0, options.max - updated.count),
    resetAt: existing.resetAt,
  };
}

/**
 * Pega o IP do request, lidando com Vercel proxy headers.
 * Usado como chave do rate limiter quando não temos um identificador
 * mais específico (email, userId).
 */
export function getRequestIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    // Pode vir como "client, proxy1, proxy2" — pegamos o primeiro
    return forwarded.split(",")[0].trim();
  }
  const real = req.headers.get("x-real-ip");
  if (real) return real;
  return "unknown";
}

/**
 * Resposta padrão 429 Too Many Requests.
 * O cliente recebe um Retry-After com segundos para esperar.
 */
export function rateLimitResponse(result: RateLimitResult, message?: string) {
  const retryAfter = Math.max(
    1,
    Math.ceil((result.resetAt.getTime() - Date.now()) / 1000)
  );
  return new Response(
    JSON.stringify({
      error: message ?? "Muitas tentativas. Tente novamente em alguns minutos.",
      retryAfter,
    }),
    {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "Retry-After": String(retryAfter),
      },
    }
  );
}
