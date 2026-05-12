"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShieldCheck, ShieldOff, Copy, Eye, EyeOff } from "lucide-react";
// eslint-disable-next-line @next/next/no-img-element

interface Props {
  totpEnabled: boolean;
  hasPassword: boolean;
  backupCodesRemaining: number;
}

interface SetupResponse {
  secret: string;
  qrCode: string;
}

async function setupTotp(): Promise<SetupResponse> {
  const res = await fetch("/api/user/totp/setup", { method: "POST" });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || "Erro ao iniciar configuração");
  }
  return res.json();
}

async function enableTotp(code: string): Promise<{ backupCodes: string[] }> {
  const res = await fetch("/api/user/totp/enable", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || "Erro ao ativar 2FA");
  }
  return res.json();
}

async function disableTotp(data: { currentPassword: string; code: string }) {
  const res = await fetch("/api/user/totp/disable", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || "Erro ao desativar 2FA");
  }
  return res.json();
}

export function TwoFactorSection({
  totpEnabled,
  hasPassword,
  backupCodesRemaining,
}: Props) {
  const router = useRouter();

  // Estados do fluxo de setup
  const [setupData, setSetupData] = useState<SetupResponse | null>(null);
  const [enableCode, setEnableCode] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[] | null>(null);

  // Estados do fluxo de disable
  const [showDisable, setShowDisable] = useState(false);
  const [disablePassword, setDisablePassword] = useState("");
  const [disableCode, setDisableCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const setupMutation = useMutation({
    mutationFn: setupTotp,
    onSuccess: (data) => setSetupData(data),
    onError: (err: Error) => toast.error(err.message),
  });

  const enableMutation = useMutation({
    mutationFn: enableTotp,
    onSuccess: (data) => {
      setBackupCodes(data.backupCodes);
      setSetupData(null);
      setEnableCode("");
      toast.success("2FA ativado!");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const disableMutation = useMutation({
    mutationFn: disableTotp,
    onSuccess: () => {
      toast.success("2FA desativado");
      setShowDisable(false);
      setDisablePassword("");
      setDisableCode("");
      router.refresh();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const handleDoneShowingBackup = () => {
    setBackupCodes(null);
    router.refresh(); // re-renderiza pra mostrar estado "ativado"
  };

  const copyBackupCodes = () => {
    if (!backupCodes) return;
    const text = backupCodes.join("\n");
    navigator.clipboard.writeText(text);
    toast.success("Códigos copiados!");
  };

  // ─── Estado: mostrando backup codes recém-gerados ───
  if (backupCodes) {
    return (
      <Card className="border-income/40">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-income">
            <ShieldCheck className="h-5 w-5" />
            2FA ativado — salve seus códigos de recuperação
          </CardTitle>
          <CardDescription>
            <strong>Salve esses códigos em um lugar seguro AGORA.</strong> Eles
            só aparecem uma vez. Cada código é usável uma única vez se você
            perder acesso ao seu app autenticador.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-md border border-border bg-muted/30 p-4 font-mono text-sm">
            <div className="grid grid-cols-2 gap-2">
              {backupCodes.map((c) => (
                <div key={c}>{c}</div>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={copyBackupCodes}>
              <Copy className="mr-2 h-4 w-4" />
              Copiar todos
            </Button>
            <Button onClick={handleDoneShowingBackup}>
              Já salvei, continuar
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // ─── Estado: setup em andamento (QR sendo mostrado) ───
  if (setupData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Configurar 2FA</CardTitle>
          <CardDescription>
            1. Abre um app autenticador (Google Authenticator, 1Password, Authy,
            Microsoft Authenticator)
            <br />
            2. Escaneia o QR code abaixo (ou cola o código manualmente)
            <br />
            3. Digita o código de 6 dígitos que aparecer no app
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={setupData.qrCode}
              alt="QR Code 2FA"
              className="rounded-md border border-border"
              width={240}
              height={240}
            />
            <details className="text-xs text-muted-foreground">
              <summary className="cursor-pointer">
                Não consegue escanear? Digite o código manualmente
              </summary>
              <code className="mt-2 block break-all rounded bg-muted px-2 py-1.5 text-foreground">
                {setupData.secret}
              </code>
            </details>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="enableCode">Código do app</Label>
            <Input
              id="enableCode"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={enableCode}
              onChange={(e) =>
                setEnableCode(e.target.value.replace(/\D/g, "").slice(0, 6))
              }
              placeholder="000000"
              disabled={enableMutation.isPending}
            />
          </div>

          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => {
                setSetupData(null);
                setEnableCode("");
              }}
              disabled={enableMutation.isPending}
            >
              Cancelar
            </Button>
            <Button
              onClick={() => enableMutation.mutate(enableCode)}
              disabled={enableCode.length !== 6 || enableMutation.isPending}
            >
              {enableMutation.isPending ? "Verificando..." : "Ativar 2FA"}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // ─── Estado: 2FA já ativado ───
  if (totpEnabled) {
    return (
      <Card className="border-income/40">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-income">
            <ShieldCheck className="h-5 w-5" />
            Verificação em duas etapas (2FA) ativa
          </CardTitle>
          <CardDescription>
            Sua conta está protegida por 2FA. Você tem{" "}
            <strong>{backupCodesRemaining}</strong> código(s) de recuperação
            restante(s).
            {backupCodesRemaining <= 3 && backupCodesRemaining > 0 && (
              <span className="mt-2 block text-expense">
                Atenção: poucos códigos restantes. Considere desativar e ativar
                novamente pra gerar uma nova lista.
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!showDisable ? (
            <Button
              variant="outline"
              onClick={() => setShowDisable(true)}
              className="border-expense/50 text-expense hover:bg-expense/5 hover:text-expense"
            >
              <ShieldOff className="mr-2 h-4 w-4" />
              Desativar 2FA
            </Button>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Pra desativar 2FA, confirme sua senha e um código atual do app:
              </p>
              <div className="space-y-1.5">
                <Label htmlFor="disablePassword">Senha atual</Label>
                <div className="relative">
                  <Input
                    id="disablePassword"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    value={disablePassword}
                    onChange={(e) => setDisablePassword(e.target.value)}
                    disabled={disableMutation.isPending}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="disableCode">Código 2FA (ou de recuperação)</Label>
                <Input
                  id="disableCode"
                  inputMode="text"
                  autoComplete="one-time-code"
                  value={disableCode}
                  onChange={(e) => setDisableCode(e.target.value)}
                  placeholder="000000"
                  disabled={disableMutation.isPending}
                />
              </div>
              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowDisable(false);
                    setDisablePassword("");
                    setDisableCode("");
                  }}
                  disabled={disableMutation.isPending}
                >
                  Cancelar
                </Button>
                <Button
                  variant="destructive"
                  onClick={() =>
                    disableMutation.mutate({
                      currentPassword: disablePassword,
                      code: disableCode,
                    })
                  }
                  disabled={
                    !disablePassword ||
                    !disableCode ||
                    disableMutation.isPending
                  }
                >
                  {disableMutation.isPending
                    ? "Desativando..."
                    : "Confirmar desativação"}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // ─── Estado: 2FA desativado (entry point) ───
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5" />
          Verificação em duas etapas (2FA)
        </CardTitle>
        <CardDescription>
          Adicione uma camada extra de segurança. Mesmo se alguém descobrir sua
          senha, vai precisar do código gerado no seu celular pra entrar.
          {!hasPassword && (
            <span className="mt-2 block text-expense">
              Você precisa cadastrar uma senha antes de ativar 2FA (login por
              Google/Magic Link já é protegido pelo provedor).
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          onClick={() => setupMutation.mutate()}
          disabled={!hasPassword || setupMutation.isPending}
        >
          {setupMutation.isPending ? "Preparando..." : "Ativar 2FA"}
        </Button>
      </CardContent>
    </Card>
  );
}
