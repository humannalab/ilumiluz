"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GoogleSigninButton } from "@/components/auth/google-signin-button";

/**
 * Bloco de login completo: Google + email/senha + magic link.
 * Magic link agora é uma opção secundária ("não lembra a senha? entre
 * com link no e-mail").
 */
export function SignInButtons() {
  const router = useRouter();
  const search = useSearchParams();
  const callbackUrl = search.get("callbackUrl") ?? "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState<"password" | "magic" | null>(null);
  const [magicMode, setMagicMode] = useState(false);

  // 2FA: quando server responde "2FA_REQUIRED", expandimos o form
  const [needs2fa, setNeeds2fa] = useState(false);
  const [totpCode, setTotpCode] = useState("");

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || loading) return;
    setLoading("password");
    const res = await signIn("credentials", {
      email: email.trim().toLowerCase(),
      password,
      totpCode: needs2fa ? totpCode : "",
      redirect: false,
      callbackUrl,
    });
    setLoading(null);

    // ATENÇÃO: res.ok é TRUE mesmo em falha de auth (HTTP 200 do callback).
    // Precisa checar res.error PRIMEIRO. Sucesso = error indefinido.
    if (res?.error) {
      // Auth.js v5: CredentialsSignin → res.error = "CredentialsSignin",
      // res.code = nosso código custom ("2FA_REQUIRED", "2FA_INVALID", etc.)
      const code = (res as { code?: string }).code ?? "";
      if (code === "2FA_REQUIRED") {
        setNeeds2fa(true);
        toast.info("Digite o código do seu app autenticador.");
        return;
      }
      if (code === "2FA_INVALID") {
        toast.error("Código 2FA inválido. Tenta de novo.");
        setTotpCode("");
        return;
      }
      toast.error("E-mail ou senha incorretos.");
      // Reseta estado 2FA caso credenciais tenham mudado
      setNeeds2fa(false);
      setTotpCode("");
      return;
    }

    // Sucesso (sem error) → entra
    router.push(callbackUrl);
    router.refresh();
  };

  const handleMagicLink = async () => {
    if (!email || loading) return;
    setLoading("magic");
    const res = await signIn("resend", {
      email: email.trim().toLowerCase(),
      redirect: false,
      callbackUrl,
    });
    setLoading(null);
    if (res?.ok) {
      toast.success("Link de acesso enviado! Verifique seu e-mail.");
    } else {
      toast.error("Erro ao enviar o link. Tente novamente.");
    }
  };

  return (
    <div className="space-y-4">
      <GoogleSigninButton callbackUrl={callbackUrl} disabled={!!loading} />

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="px-2 text-muted-foreground">ou</span>
        </div>
      </div>

      {!magicMode ? (
        <form onSubmit={handlePasswordLogin} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="login-email">E-mail</Label>
            <Input
              id="login-email"
              type="email"
              autoComplete="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={!!loading}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="login-password">Senha</Label>
            <div className="relative">
              <Input
                id="login-password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={!!loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground"
              >
                {showPassword ? "Ocultar" : "Mostrar"}
              </button>
            </div>
          </div>

          {needs2fa && (
            <div className="space-y-1.5">
              <Label htmlFor="login-totp">Código 2FA</Label>
              <Input
                id="login-totp"
                inputMode="text"
                autoComplete="one-time-code"
                placeholder="000000 ou código de recuperação"
                value={totpCode}
                onChange={(e) => setTotpCode(e.target.value)}
                disabled={!!loading}
                autoFocus
              />
              <p className="text-xs text-muted-foreground">
                Abra seu app autenticador e digite o código de 6 dígitos. Se
                perdeu acesso ao app, use um código de recuperação.
              </p>
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={
              !email || !password || (needs2fa && !totpCode) || !!loading
            }
          >
            {loading === "password" ? "Entrando..." : "Entrar"}
          </Button>

          <div className="space-y-4 text-center text-xs text-muted-foreground">
            <p>
              Esqueceu a senha?{' '}
              <Link
                href="/forgot-password"
                className="text-primary hover:underline"
              >
                Clique aqui para recuperar
              </Link>
              .
            </p>

            <div className="relative flex items-center justify-center">
              <span className="px-2 text-muted-foreground uppercase">ou</span>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => setMagicMode(true)}
            >
              Faça o login com um link enviado por e-mail
            </Button>

            <Button variant="secondary" asChild className="w-full">
              <Link href="/signup">Cadastre-se grátis</Link>
            </Button>
          </div>
        </form>
      ) : (
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="magic-email">E-mail</Label>
            <Input
              id="magic-email"
              type="email"
              autoComplete="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleMagicLink()}
              disabled={!!loading}
            />
          </div>

          <Button
            className="w-full"
            onClick={handleMagicLink}
            disabled={!email || !!loading}
          >
            {loading === "magic" ? "Enviando link..." : "Enviar link de acesso"}
          </Button>

          <button
            type="button"
            onClick={() => setMagicMode(false)}
            className="w-full text-center text-xs text-muted-foreground hover:text-foreground"
          >
            ← Voltar para senha
          </button>
        </div>
      )}
    </div>
  );
}
