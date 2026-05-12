import NextAuth, { CredentialsSignin } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Google from "next-auth/providers/google";
import Resend from "next-auth/providers/resend";
import Credentials from "next-auth/providers/credentials";
import { db } from "@/lib/db";
import { verifyPassword } from "@/lib/password";
import { logAudit } from "@/lib/audit";
import {
  isNewDeviceLogin,
  sendAccountLockedEmail,
  sendNewDeviceLoginEmail,
} from "@/lib/security-emails";
import {
  consumeBackupCode,
  decryptSecret,
  normalizeBackupCode,
  verifyTotp,
} from "@/lib/totp";

// Erros customizados — em Auth.js v5, herdar de CredentialsSignin faz o
// `code` ser propagado pro client via res.error / URL query "?code=...".
export class TwoFactorRequiredError extends CredentialsSignin {
  code = "2FA_REQUIRED";
}
export class TwoFactorInvalidError extends CredentialsSignin {
  code = "2FA_INVALID";
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(db),
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
      // Permite que um usuário com email já cadastrado vincule um novo
      // provider Google ao mesmo User. Necessário pra fluxo de migração
      // de conta (User existe no banco mas a Account ainda não foi criada
      // pelo provider novo). Seguro porque só temos provedores que validam
      // email (Google + Resend magic link) — não há risco de account takeover.
      allowDangerousEmailAccountLinking: true,
    }),
    Resend({
      apiKey: process.env.AUTH_RESEND_KEY!,
      // Endereço "from" via env var pra trocar sem código quando o domínio
      // próprio (barthofinance.com) for verificado. Default: sandbox.
      from: process.env.RESEND_FROM_EMAIL ?? "Bartho Finance <onboarding@resend.dev>",
      // Magic link já é "email-based" por natureza — vincula User existente
      // pelo email automaticamente, sem precisar de allowDangerousEmailAccountLinking.
    }),
    // Credentials: login com e-mail + senha + brute-force protection
    //
    // Política:
    // - 5 tentativas falhas → conta bloqueada por 15min (lockedUntil)
    // - Login bem-sucedido → reseta failedLoginAttempts pra 0
    // - Sempre retorna mesmo erro (null) pra não vazar se email existe
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "E-mail", type: "email" },
        password: { label: "Senha", type: "password" },
        totpCode: { label: "Código 2FA", type: "text" },
      },
      async authorize(credentials, request) {
        const email = (credentials?.email as string | undefined)?.trim().toLowerCase();
        const password = credentials?.password as string | undefined;
        const totpCode = (credentials?.totpCode as string | undefined)?.trim();
        if (!email || !password) return null;

        // Extrai IP/UA do request pra audit + security emails
        const req = request as Request | undefined;
        const ip =
          req?.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
          req?.headers.get("x-real-ip") ??
          null;
        const userAgent = req?.headers.get("user-agent") ?? null;

        const user = await db.user.findUnique({
          where: { email },
          select: {
            id: true,
            email: true,
            name: true,
            image: true,
            passwordHash: true,
            failedLoginAttempts: true,
            lockedUntil: true,
            totpEnabled: true,
            totpSecret: true,
            totpBackupCodes: true,
          },
        });
        if (!user || !user.passwordHash) {
          // Tentativa em email inexistente ou sem senha — loga sem userId
          await logAudit({
            action: "auth.login.failure",
            ip,
            userAgent,
            metadata: { reason: "no_user_or_password", email },
          });
          return null;
        }

        // Conta bloqueada? Não nem testa a senha.
        if (user.lockedUntil && user.lockedUntil > new Date()) {
          await logAudit({
            action: "auth.login.locked",
            userId: user.id,
            ip,
            userAgent,
            metadata: { lockedUntil: user.lockedUntil.toISOString() },
          });
          return null;
        }

        const ok = await verifyPassword(password, user.passwordHash);

        if (!ok) {
          // Falha — incrementa contador e bloqueia se passou de 5
          const attempts = user.failedLoginAttempts + 1;
          const LOCK_THRESHOLD = 5;
          const LOCK_MINUTES = 15;
          const update: {
            failedLoginAttempts: number;
            lockedUntil?: Date;
          } = { failedLoginAttempts: attempts };
          let lockedNow = false;
          if (attempts >= LOCK_THRESHOLD) {
            update.lockedUntil = new Date(Date.now() + LOCK_MINUTES * 60 * 1000);
            lockedNow = true;
          }
          await db.user.update({ where: { id: user.id }, data: update });
          await logAudit({
            action: lockedNow ? "auth.login.locked" : "auth.login.failure",
            userId: user.id,
            ip,
            userAgent,
            metadata: { reason: "wrong_password", attempts },
          });
          // Quando bloqueia agora, alerta o usuário por e-mail
          if (lockedNow) {
            await sendAccountLockedEmail(
              { email: user.email, name: user.name, ip, userAgent, when: new Date() },
              user.id
            );
          }
          return null;
        }

        // ── 2FA ──
        // Se o usuário tem 2FA ativo, exigir código TOTP (ou backup) ANTES
        // de considerar o login válido. Senha sozinha não basta.
        if (user.totpEnabled && user.totpSecret) {
          if (!totpCode) {
            // Senha tá certa mas falta o segundo fator. Cliente detecta
            // este erro e mostra o campo TOTP. NÃO incrementa failedAttempts
            // pra não bloquear conta legítima.
            throw new TwoFactorRequiredError();
          }

          // 1ª tentativa: TOTP code (6 dígitos)
          let totpOk = false;
          let backupUsedHash: string | null = null;

          if (/^\d{6}$/.test(totpCode)) {
            const secret = decryptSecret(user.totpSecret);
            totpOk = verifyTotp(totpCode, secret);
          } else {
            // 2ª tentativa: backup code (alfanumérico)
            const normalized = normalizeBackupCode(totpCode);
            if (normalized.length === 10) {
              backupUsedHash = await consumeBackupCode(
                totpCode,
                user.totpBackupCodes
              );
              totpOk = backupUsedHash !== null;
            }
          }

          if (!totpOk) {
            await logAudit({
              action: "auth.2fa.failure",
              userId: user.id,
              ip,
              userAgent,
            });
            throw new TwoFactorInvalidError();
          }

          // Se foi backup code, remove ele da array (1 uso só)
          if (backupUsedHash) {
            await db.user.update({
              where: { id: user.id },
              data: {
                totpBackupCodes: user.totpBackupCodes.filter(
                  (h) => h !== backupUsedHash
                ),
              },
            });
            await logAudit({
              action: "auth.2fa.backup_used",
              userId: user.id,
              ip,
              userAgent,
              metadata: {
                remaining: user.totpBackupCodes.length - 1,
              },
            });
          } else {
            await logAudit({
              action: "auth.2fa.success",
              userId: user.id,
              ip,
              userAgent,
            });
          }
        }

        // Login OK — limpa contador e qualquer lockout anterior
        if (user.failedLoginAttempts > 0 || user.lockedUntil) {
          await db.user.update({
            where: { id: user.id },
            data: { failedLoginAttempts: 0, lockedUntil: null },
          });
        }

        // Novo dispositivo? Alerta (não bloqueia login)
        const isNew = await isNewDeviceLogin({ userId: user.id, ip });
        if (isNew) {
          await sendNewDeviceLoginEmail(
            { email: user.email, name: user.name, ip, userAgent, when: new Date() },
            user.id
          );
        }

        await logAudit({
          action: "auth.login.success",
          userId: user.id,
          ip,
          userAgent,
          metadata: { provider: "credentials" },
        });

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
      },
    }),
  ],
  // Credentials provider exige JWT strategy. Mudamos a sessao toda
  // pra JWT (cookie assinado) — funciona pros 3 providers (Google,
  // Resend, Credentials) sem precisar de tabelas Session.
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    // No JWT strategy o session callback recebe o token (não o user).
    // Carregamos campos custom do banco quando necessário.
    async session({ session, token }) {
      if (token.sub) {
        session.user.id = token.sub;
      }
      // plan vem direto do token (injetado no jwt callback)
      const plan = (token as unknown as { plan?: "FREE" | "TRIAL" | "PRO" }).plan;
      if (plan) session.user.plan = plan;
      return session;
    },
    // Carrega o plan no token na primeira sign-in e em refreshes
    async jwt({ token, user }) {
      // 1ª chamada após sign-in: user vem populado, salva o id
      if (user?.id) token.sub = user.id;
      // Sempre que o token é refrescado, busca plan atualizado do banco
      // (afeta UX quando user faz upgrade Stripe ou trial expira)
      if (token.sub) {
        const dbUser = await db.user.findUnique({
          where: { id: token.sub },
          select: { plan: true },
        });
        if (dbUser) {
          (token as unknown as { plan: typeof dbUser.plan }).plan = dbUser.plan;
        }
      }
      return token;
    },
  },
  events: {
    async createUser({ user }) {
      // Novo usuário (via Google ou Magic Link) ganha trial de 30 dias
      // automaticamente. Acesso pago via Stripe acontece quando o trial
      // expira.
      //
      // Defensivo: só seta trial se ainda não existir (cenários de
      // migração ou re-criação).
      const dbUser = await db.user.findUnique({
        where: { id: user.id },
        select: { plan: true, trialEndsAt: true },
      });
      if (!dbUser) return;

      const TRIAL_DAYS = 30;
      const updates: { plan?: "TRIAL"; trialEndsAt?: Date } = {};
      if (dbUser.plan === "FREE") updates.plan = "TRIAL";
      if (!dbUser.trialEndsAt) {
        updates.trialEndsAt = new Date(Date.now() + TRIAL_DAYS * 24 * 60 * 60 * 1000);
      }
      if (Object.keys(updates).length > 0) {
        await db.user.update({ where: { id: user.id }, data: updates });
      }
      await logAudit({
        action: "auth.signup.success",
        userId: user.id,
        metadata: { source: "oauth_or_magic_link" },
      });
    },
    async signIn({ user, account }) {
      // Captura login bem-sucedido pelos providers Google/Resend.
      // O Credentials provider já loga dentro do authorize() — pular ele
      // aqui pra não duplicar.
      if (!user?.id || account?.provider === "credentials") return;

      // Tenta extrair IP/UA do request via next/headers (App Router).
      // Dynamic import pra não quebrar runtimes que não tenham essa API.
      let ip: string | null = null;
      let userAgent: string | null = null;
      try {
        const { headers } = await import("next/headers");
        const h = await headers();
        ip =
          h.get("x-forwarded-for")?.split(",")[0].trim() ??
          h.get("x-real-ip") ??
          null;
        userAgent = h.get("user-agent");
      } catch {
        // Sem contexto de request — segue sem IP
      }

      await logAudit({
        action: "auth.login.success",
        userId: user.id,
        ip,
        userAgent,
        metadata: { provider: account?.provider ?? "unknown" },
      });

      // Novo dispositivo? Alerta por e-mail (não bloqueia login)
      const email = user.email;
      if (email) {
        const isNew = await isNewDeviceLogin({ userId: user.id, ip });
        if (isNew) {
          await sendNewDeviceLoginEmail(
            { email, name: user.name, ip, userAgent, when: new Date() },
            user.id
          );
        }
      }
    },
  },
});
