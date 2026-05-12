import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AccountForm } from "./_components/account-form";
import { DangerZone } from "./_components/danger-zone";

export default async function AccountSettingsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      plan: true,
      createdAt: true,
      passwordHash: true,
    },
  });

  if (!user) redirect("/login");
  const hasPassword = Boolean(user.passwordHash);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Informações da conta</CardTitle>
          <CardDescription>
            Atualize seu nome. O e-mail está vinculado ao provedor de login.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AccountForm
            initialName={user.name ?? ""}
            email={user.email}
            image={user.image ?? null}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sobre a conta</CardTitle>
          <CardDescription>Detalhes do seu cadastro.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex justify-between border-b border-border pb-3">
            <span className="text-muted-foreground">E-mail</span>
            <span className="font-medium text-foreground">{user.email}</span>
          </div>
          <div className="flex justify-between border-b border-border pb-3">
            <span className="text-muted-foreground">Plano</span>
            <span className="font-medium text-foreground">{user.plan}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Membro desde</span>
            <span className="font-medium text-foreground">
              {new Intl.DateTimeFormat("pt-BR", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              }).format(user.createdAt)}
            </span>
          </div>
        </CardContent>
      </Card>

      <DangerZone hasPassword={hasPassword} />
    </div>
  );
}
