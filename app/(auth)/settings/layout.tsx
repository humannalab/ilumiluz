import Link from "next/link";
import { SettingsNav } from "./_components/settings-nav";

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-6 md:space-y-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-foreground">Configurações</h1>
        <p className="text-sm text-muted-foreground">
          Gerencie sua conta, assinatura e preferências.
        </p>
      </div>

      <SettingsNav />

      <div>{children}</div>
    </div>
  );
}
