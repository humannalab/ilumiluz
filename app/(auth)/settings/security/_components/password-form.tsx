"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";
import { validatePasswordStrength } from "@/lib/password";

interface Props {
  hasPassword: boolean;
}

async function apiSetPassword(password: string) {
  const res = await fetch("/api/user/password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || "Erro ao cadastrar senha");
  }
  return res.json();
}

async function apiChangePassword(data: {
  currentPassword: string;
  newPassword: string;
}) {
  const res = await fetch("/api/user/password", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || "Erro ao alterar senha");
  }
  return res.json();
}

export function PasswordForm({ hasPassword }: Props) {
  const router = useRouter();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const setMutation = useMutation({
    mutationFn: apiSetPassword,
    onSuccess: () => {
      toast.success("Senha cadastrada!");
      setNewPassword("");
      setConfirmPassword("");
      // Re-renderiza pra mostrar o estado "alterar" agora que tem senha
      router.refresh();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const changeMutation = useMutation({
    mutationFn: apiChangePassword,
    onSuccess: () => {
      toast.success("Senha alterada com sucesso!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const isPending = setMutation.isPending || changeMutation.isPending;

  // Validação client-side antes de mandar
  const strengthError = newPassword ? validatePasswordStrength(newPassword) : null;
  const mismatchError =
    confirmPassword && newPassword !== confirmPassword
      ? "As senhas não conferem."
      : null;
  const sameAsCurrentError =
    hasPassword && currentPassword && currentPassword === newPassword && newPassword
      ? "A nova senha precisa ser diferente da atual."
      : null;

  const canSubmit = hasPassword
    ? Boolean(
        currentPassword &&
          newPassword &&
          confirmPassword &&
          !strengthError &&
          !mismatchError &&
          !sameAsCurrentError
      )
    : Boolean(newPassword && confirmPassword && !strengthError && !mismatchError);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || isPending) return;
    if (hasPassword) {
      changeMutation.mutate({ currentPassword, newPassword });
    } else {
      setMutation.mutate(newPassword);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {hasPassword && (
        <div className="space-y-1.5">
          <Label htmlFor="currentPassword">Senha atual</Label>
          <div className="relative">
            <Input
              id="currentPassword"
              type={showCurrent ? "text" : "password"}
              autoComplete="current-password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              disabled={isPending}
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowCurrent((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              tabIndex={-1}
              aria-label={showCurrent ? "Ocultar senha" : "Mostrar senha"}
            >
              {showCurrent ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="newPassword">
          {hasPassword ? "Nova senha" : "Senha"}
        </Label>
        <div className="relative">
          <Input
            id="newPassword"
            type={showNew ? "text" : "password"}
            autoComplete="new-password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            disabled={isPending}
            placeholder="••••••••"
          />
          <button
            type="button"
            onClick={() => setShowNew((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            tabIndex={-1}
            aria-label={showNew ? "Ocultar senha" : "Mostrar senha"}
          >
            {showNew ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
        {strengthError ? (
          <p className="text-xs text-expense">{strengthError}</p>
        ) : (
          <p className="text-xs text-muted-foreground">
            Mínimo 8 caracteres, com ao menos 1 letra e 1 número.
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="confirmPassword">Confirmar senha</Label>
        <Input
          id="confirmPassword"
          type={showNew ? "text" : "password"}
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          disabled={isPending}
          placeholder="••••••••"
        />
        {mismatchError && (
          <p className="text-xs text-expense">{mismatchError}</p>
        )}
        {sameAsCurrentError && (
          <p className="text-xs text-expense">{sameAsCurrentError}</p>
        )}
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={!canSubmit || isPending}>
          {isPending
            ? "Salvando..."
            : hasPassword
              ? "Alterar senha"
              : "Cadastrar senha"}
        </Button>
      </div>
    </form>
  );
}
