import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PasswordForm } from "./_components/password-form";
import { TwoFactorSection } from "./_components/two-factor-section";
import { RecentActivity } from "./_components/recent-activity";

// Actions de segurança que o usuário deve ver no histórico próprio.
// Ignora ações de billing e admin — esses ficam só no /admin/audit.
const SECURITY_ACTIONS = [
  "auth.login.success",
  "auth.login.failure",
  "auth.login.locked",
  "auth.password.set",
  "auth.password.change",
  "auth.password.reset.request",
  "auth.password.reset.complete",
  "auth.2fa.enabled",
  "auth.2fa.disabled",
  "auth.2fa.success",
  "auth.2fa.failure",
  "auth.2fa.backup_used",
];

export default async function SecuritySettingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      passwordHash: true,
      totpEnabled: true,
      backupCodes: true,
    },
  });
  if (!user) redirect("/login");

  const hasPassword = Boolean(user.passwordHash);

  // Pega últimos 20 eventos de segurança do próprio usuário
  const activity = await db.auditLog.findMany({
    where: {
      userId: session.user.id,
      action: { in: SECURITY_ACTIONS },
    },
    orderBy: { createdAt: "desc" },
    take: 20,
    select: {
      id: true,
      action: true,
      ipAddress: true,
      userAgent: true,
      createdAt: true,
    },
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{hasPassword ? "Alterar senha" : "Cadastrar senha"}</CardTitle>
          <CardDescription>
            {hasPassword
              ? "Use uma senha forte e única. Trocar a senha não desconecta outros dispositivos."
              : "Você ainda não cadastrou uma senha. Cadastre uma agora pra poder fazer login com e-mail e senha — útil caso o acesso por Google ou link mágico falhe."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PasswordForm hasPassword={hasPassword} />
        </CardContent>
      </Card>

      <TwoFactorSection
        totpEnabled={user.totpEnabled}
        hasPassword={hasPassword}
        backupCodesRemaining={user.backupCodes.length}
      />

      <RecentActivity events={activity} />
    </div>
  );
}
