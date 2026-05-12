import { db } from "@/lib/db";

/**
 * Rate limiting baseado em janela deslizante usando a tabela RateLimit
 * do Prisma. Funciona em ambiente serverless (sem in-memory state).
 *
 * Estratégia: cada chave (ex: "signup:ip:1.2.3.4") tem um contador e o
 * timestamp de início da janela. Quando o intervalo expira, o contador
 * é resetado automaticamente na próxima verificação.
 *
 * Não é distribuído de forma atômica (poderia haver pequena race entre
 * múltiplas requisições simultâneas), mas pra abuso típico (humano,
 * brute force, scripts simples) é suficiente. Pra escala maior, migrar
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
  const windowAgo = new Date(now.getTime() - options.windowMs);

  // Tenta encontrar e atualizar atomicamente. Se a janela expirou, reset.
  const existing = await db.rateLimit.findUnique({ where: { key } });

  if (!existing || existing.windowStart < windowAgo) {
    // Janela nova ou expirada — reseta
    await db.rateLimit.upsert({
      where: { key },
      create: { key, count: 1, windowStart: now },
      update: { count: 1, windowStart: now },
    });
    return {
      allowed: true,
      remaining: options.max - 1,
      resetAt: new Date(now.getTime() + options.windowMs),
    };
  }

  // Janela ainda ativa — verifica se passou do limite
  if (existing.count >= options.max) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: new Date(existing.windowStart.getTime() + options.windowMs),
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
    resetAt: new Date(existing.windowStart.getTime() + options.windowMs),
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
 * O cliente recebe um Retry-After com segundos pra esperar.
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
