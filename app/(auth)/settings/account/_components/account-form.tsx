"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail } from "lucide-react";

interface Props {
  initialName: string;
  email: string;
  image: string | null;
}

async function updateProfile(data: { name: string }) {
  const res = await fetch("/api/user/profile", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || "Erro ao atualizar");
  }
  return res.json();
}

export function AccountForm({ initialName, email, image }: Props) {
  const { update } = useSession();
  const [name, setName] = useState(initialName);

  const mutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: async () => {
      toast.success("Conta atualizada!");
      await update(); // Refresh session so sidebar etc. reflect new name
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const initials = (initialName || email)
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const dirty = name.trim() !== initialName.trim();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt={initialName}
            className="h-16 w-16 rounded-full border border-border object-cover"
          />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-lg font-semibold text-primary">
            {initials || "?"}
          </div>
        )}
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground truncate">
            {initialName || "Sem nome"}
          </p>
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Mail className="h-3 w-3" />
            {email}
          </p>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="name">Nome</Label>
        <Input
          id="name"
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Seu nome"
          maxLength={80}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="email">E-mail</Label>
        <Input id="email" value={email} disabled />
        <p className="text-xs text-muted-foreground">
          O e-mail é definido pelo provedor de login e não pode ser alterado aqui.
        </p>
      </div>

      <div className="flex justify-end">
        <Button
          onClick={() => mutation.mutate({ name: name.trim() })}
          disabled={!dirty || !name.trim() || mutation.isPending}
        >
          {mutation.isPending ? "Salvando..." : "Salvar alterações"}
        </Button>
      </div>
    </div>
  );
}
