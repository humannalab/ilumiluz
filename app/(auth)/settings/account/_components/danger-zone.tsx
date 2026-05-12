"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { LogOut, Download, Trash2, AlertTriangle, Eye, EyeOff } from "lucide-react";

interface Props {
  hasPassword: boolean;
}

async function deleteAccount(data: {
  confirmation: string;
  currentPassword?: string;
}) {
  const res = await fetch("/api/user/account", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || "Erro ao excluir conta");
  }
  return res.json();
}

export function DangerZone({ hasPassword }: Props) {
  const [exporting, setExporting] = useState(false);

  // Estado do modal de exclusão
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [confirmation, setConfirmation] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleExport = async () => {
    if (exporting) return;
    setExporting(true);
    try {
      const res = await fetch("/api/user/export");
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Erro ao exportar");
      }
      // Pega filename do Content-Disposition (com fallback)
      const cd = res.headers.get("Content-Disposition") ?? "";
      const match = cd.match(/filename="([^"]+)"/);
      const filename = match?.[1] ?? `bartho-finance-export.json`;

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Exportação concluída!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao exportar");
    } finally {
      setExporting(false);
    }
  };

  const deleteMutation = useMutation({
    mutationFn: deleteAccount,
    onSuccess: async () => {
      toast.success("Conta excluída. Até logo.");
      // Limpa sessão e redireciona pra home
      await signOut({ callbackUrl: "/" });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const canDelete =
    confirmation === "EXCLUIR MINHA CONTA" &&
    (!hasPassword || currentPassword.length > 0);

  return (
    <>
      {/* Logout (card "leve") */}
      <Card>
        <CardHeader>
          <CardTitle>Sessão</CardTitle>
          <CardDescription>
            Encerre sua sessão neste dispositivo. Você precisará fazer login
            novamente.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="outline"
            onClick={() => signOut({ callbackUrl: "/" })}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sair da conta
          </Button>
        </CardContent>
      </Card>

      {/* Exportar dados — LGPD art. 18 portabilidade */}
      <Card>
        <CardHeader>
          <CardTitle>Seus dados</CardTitle>
          <CardDescription>
            Baixe uma cópia de todos os dados que armazenamos sobre você
            (transações, centros de custo, categorias e histórico de
            atividade). Limite: 3 exportações por dia.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" onClick={handleExport} disabled={exporting}>
            <Download className="mr-2 h-4 w-4" />
            {exporting ? "Preparando..." : "Baixar meus dados"}
          </Button>
        </CardContent>
      </Card>

      {/* Excluir conta — LGPD art. 18 V (anonimização/eliminação) */}
      <Card className="border-expense/40">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-expense">
            <AlertTriangle className="h-5 w-5" />
            Excluir conta
          </CardTitle>
          <CardDescription>
            Apaga sua conta e <strong>todos</strong> seus dados (transações,
            centros de custo, categorias) de forma permanente. Se você tiver
            assinatura PRO ativa, ela será cancelada. Esta ação é{" "}
            <strong>irreversível</strong>.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Dialog
            open={deleteOpen}
            onOpenChange={(open) => {
              setDeleteOpen(open);
              if (!open) {
                setConfirmation("");
                setCurrentPassword("");
              }
            }}
          >
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="border-expense/50 text-expense hover:bg-expense/5 hover:text-expense"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Excluir minha conta
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-expense">
                  <AlertTriangle className="h-5 w-5" />
                  Confirmar exclusão
                </DialogTitle>
                <DialogDescription className="space-y-2 pt-2">
                  <span className="block">
                    Esta ação <strong>não pode ser desfeita</strong>. Tudo será
                    apagado:
                  </span>
                  <ul className="list-inside list-disc text-sm">
                    <li>Sua conta e perfil</li>
                    <li>Todas as transações</li>
                    <li>Centros de custo e categorias</li>
                    <li>Assinatura Stripe (cancelada automaticamente)</li>
                  </ul>
                  <span className="block pt-2">
                    Se quiser uma cópia dos seus dados, baixe primeiro pelo
                    botão acima.
                  </span>
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 pt-2">
                <div className="space-y-1.5">
                  <Label htmlFor="confirmation">
                    Digite{" "}
                    <code className="rounded bg-muted px-1 py-0.5 text-xs">
                      EXCLUIR MINHA CONTA
                    </code>{" "}
                    pra confirmar
                  </Label>
                  <Input
                    id="confirmation"
                    value={confirmation}
                    onChange={(e) => setConfirmation(e.target.value)}
                    placeholder="EXCLUIR MINHA CONTA"
                    autoComplete="off"
                    disabled={deleteMutation.isPending}
                  />
                </div>

                {hasPassword && (
                  <div className="space-y-1.5">
                    <Label htmlFor="currentPassword">Sua senha</Label>
                    <div className="relative">
                      <Input
                        id="currentPassword"
                        type={showPassword ? "text" : "password"}
                        autoComplete="current-password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        disabled={deleteMutation.isPending}
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
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setDeleteOpen(false)}
                  disabled={deleteMutation.isPending}
                >
                  Cancelar
                </Button>
                <Button
                  variant="destructive"
                  disabled={!canDelete || deleteMutation.isPending}
                  onClick={() =>
                    deleteMutation.mutate({
                      confirmation,
                      currentPassword: hasPassword ? currentPassword : undefined,
                    })
                  }
                >
                  {deleteMutation.isPending
                    ? "Excluindo..."
                    : "Excluir definitivamente"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </>
  );
}
