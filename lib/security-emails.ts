import { Resend } from "resend";
import { db } from "@/lib/db";
import { checkRateLimit } from "@/lib/rate-limit";

/**
 * E-mails transacionais de SEGURANÇA.
 *
 * Princípios:
 * - Fire-and-forget — nunca bloqueiam fluxo de auth. Erros vão pro Sentry.
 * - Rate-limited por (tipo, userId, contexto) pra evitar spam em loop.
 * - Sempre incluem timestamp, IP e contexto pra usuário saber "fui eu mesmo?"
 * - Link de "não fui eu" leva pra fluxo de reset (em iteração futura).
 *
 * Templates inline pra reduzir setup. Quando crescer, migrar pra MJML ou
 * Resend React Email.
 */

const FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL ?? "Ilumiluz <onboarding@resend.dev>";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3001";

function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

// Formata data no fuso de Brasília. Datas em e-mail de segurança PRECISAM
// ser legíveis — usuário tem que conseguir reconhecer "às 14h32 de hoje".
function formatBR(date: Date = new Date()): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Sao_Paulo",
  }).format(date);
}

function baseTemplate(opts: {
  title: string;
  intro: string;
  details: Array<{ label: string; value: string }>;
  cta?: { label: string; url: string };
  outro: string;
}): string {
  const detailsHtml = opts.details
    .map(
      (d) => `
      <tr>
        <td style="padding: 6px 0; color: #5a6278; font-size: 13px;">${d.label}</td>
        <td style="padding: 6px 0; color: #141827; font-size: 13px; text-align: right; font-weight: 500;">${d.value}</td>
      </tr>`
    )
    .join("");

  const ctaHtml = opts.cta
    ? `
    <p style="text-align: center; margin: 32px 0 16px 0;">
      <a href="${opts.cta.url}" style="background: #4a6cf7; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">
        ${opts.cta.label}
      </a>
    </p>`
    : "";

  return `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; color: #141827;">
  <h2 style="color: #141827; margin: 0 0 12px 0; font-size: 20px;">${opts.title}</h2>
  <p style="color: #5a6278; line-height: 1.6; font-size: 14px; margin: 0 0 16px 0;">
    ${opts.intro}
  </p>
  <table style="width: 100%; border-top: 1px solid #e5e7eb; border-bottom: 1px solid #e5e7eb; margin: 16px 0;">
    ${detailsHtml}
  </table>
  ${ctaHtml}
  <p style="color: #5a6278; line-height: 1.6; font-size: 13px; margin: 16px 0 0 0;">
    ${opts.outro}
  </p>
  <p style="color: #94a3b8; font-size: 12px; margin-top: 32px; border-top: 1px solid #e5e7eb; padding-top: 16px;">
    Ilumiluz • <a href="${APP_URL}" style="color: #94a3b8;">${APP_URL.replace(/^https?:\/\//, "")}</a>
  </p>
</div>
  `.trim();
}

async function send(to: string, subject: string, html: string): Promise<void> {
  const resend = getResend();
  if (!resend) {
    console.warn("[security-emails] AUTH_RESEND_KEY não configurada — skip");
    return;
  }
  try {
    await resend.emails.send({ from: FROM_EMAIL, to, subject, html });
  } catch (err) {
    // Nunca quebra fluxo principal. Sentry pega.
    console.error("[security-emails] send failed:", subject, err);
  }
}

// ─── Detecção de novo dispositivo ──────────────────────────────────────────
//
// Heurística: scaneia audit log de auth.login.success dos últimos 90 dias
// e checa se o IP atual já aparece. Não é fingerprint forte (IP muda em
// rede móvel), mas funciona pro caso comum "alguém entrou da Rússia".

const DEVICE_LOOKBACK_DAYS = 90;

export async function isNewDeviceLogin(opts: {
  userId: string;
  ip: string | null;
}): Promise<boolean> {
  if (!opts.ip) return false; // Sem IP, não dá pra decidir — não alarma
  const since = new Date(Date.now() - DEVICE_LOOKBACK_DAYS * 24 * 60 * 60 * 1000);
  const known = await db.auditLog.findFirst({
    where: {
      userId: opts.userId,
      action: "auth.login.success",
      ipAddress: opts.ip,
      createdAt: { gte: since },
    },
    select: { id: true },
  });
  return !known;
}

// ─── Templates ─────────────────────────────────────────────────────────────

interface SecurityCtx {
  email: string;
  name?: string | null;
  ip?: string | null;
  userAgent?: string | null;
  when?: Date;
}

export async function sendPasswordChangedEmail(ctx: SecurityCtx, userId: string) {
  // Rate limit: 1 e-mail por hora por user. Evita spam se alguém faz 3
  // trocas em sequência.
  const rl = await checkRateLimit(`secmail:pwd-change:${userId}`, {
    max: 1,
    windowMs: 60 * 60 * 1000,
  });
  if (!rl.allowed) return;

  const firstName = ctx.name?.split(" ")[0];
  const html = baseTemplate({
    title: "Sua senha foi alterada 🔐",
    intro: `${firstName ? `Oi, ${firstName}. ` : ""}Sua senha do Ilumiluz acabou de ser trocada.`,
    details: [
      { label: "Quando", value: formatBR(ctx.when) },
      ...(ctx.ip ? [{ label: "IP de origem", value: ctx.ip }] : []),
    ],
    outro: `Se foi você, ignora este e-mail. Se <strong>não foi você</strong>, sua conta pode ter sido acessada — peça uma redefinição de senha imediatamente em <a href="${APP_URL}/forgot-password">${APP_URL}/forgot-password</a>.`,
  });
  await send(ctx.email, "Sua senha foi alterada — Ilumiluz", html);
}

export async function sendNewDeviceLoginEmail(ctx: SecurityCtx, userId: string) {
  // Rate limit por (user, IP) — não envia 5 e-mails se usuário entrou 5x do
  // mesmo IP novo na mesma sessão.
  const rl = await checkRateLimit(
    `secmail:new-device:${userId}:${ctx.ip ?? "noip"}`,
    { max: 1, windowMs: 24 * 60 * 60 * 1000 }
  );
  if (!rl.allowed) return;

  const firstName = ctx.name?.split(" ")[0];
  const html = baseTemplate({
    title: "Novo login na sua conta 🐾",
    intro: `${firstName ? `Oi, ${firstName}. ` : ""}Detectamos um login na sua conta a partir de um IP que não conhecíamos.`,
    details: [
      { label: "Quando", value: formatBR(ctx.when) },
      ...(ctx.ip ? [{ label: "IP", value: ctx.ip }] : []),
      ...(ctx.userAgent
        ? [{ label: "Dispositivo", value: ctx.userAgent.slice(0, 60) }]
        : []),
    ],
    outro: `Se foi você (talvez um celular novo, hotel, café), pode ignorar este e-mail. Se <strong>não foi você</strong>, troque sua senha em <a href="${APP_URL}/settings/security">${APP_URL}/settings/security</a>.`,
  });
  await send(ctx.email, "Novo login detectado — Ilumiluz", html);
}

export async function sendAccountLockedEmail(ctx: SecurityCtx, userId: string) {
  // Rate limit conservador (1/dia) — usuário recebe 1 alerta mesmo se atacante
  // continuar tentando.
  const rl = await checkRateLimit(`secmail:locked:${userId}`, {
    max: 1,
    windowMs: 24 * 60 * 60 * 1000,
  });
  if (!rl.allowed) return;

  const firstName = ctx.name?.split(" ")[0];
  const html = baseTemplate({
    title: "Sua conta foi bloqueada temporariamente ⚠️",
    intro: `${firstName ? `Oi, ${firstName}. ` : ""}Detectamos várias tentativas de login com senha errada na sua conta. Por segurança, bloqueamos temporariamente (15 minutos).`,
    details: [
      { label: "Quando", value: formatBR(ctx.when) },
      ...(ctx.ip ? [{ label: "IP suspeito", value: ctx.ip }] : []),
    ],
    cta: { label: "Redefinir minha senha", url: `${APP_URL}/forgot-password` },
    outro: `Se foi você esquecendo a senha, redefina pelo botão acima. Se você não tentou entrar, alguém pode estar tentando — recomendamos trocar a senha mesmo assim.`,
  });
  await send(ctx.email, "Conta bloqueada por segurança — Ilumiluz", html);
}

export async function sendAccountDeletedEmail(ctx: SecurityCtx) {
  // Não tem rate limit — só é enviado uma vez (no momento da exclusão).
  const firstName = ctx.name?.split(" ")[0];
  const html = baseTemplate({
    title: "Sua conta foi excluída",
    intro: `${firstName ? `${firstName}, ` : ""}sua conta no Ilumiluz e todos os dados associados foram removidos permanentemente, conforme sua solicitação.`,
    details: [
      { label: "Quando", value: formatBR(ctx.when) },
      { label: "E-mail da conta", value: ctx.email },
    ],
    outro: `Se você mudar de ideia, é só criar uma nova conta — mas os dados antigos não podem ser recuperados. Obrigado por ter usado o Ilumiluz. 🐾`,
  });
  await send(ctx.email, "Conta excluída — Ilumiluz", html);
}
