import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { AccessGate } from "@/components/paywall/access-gate";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  // Onboarding gate: usuários sem onboarding ainda não viram pra dentro do app
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { onboardedAt: true },
  });
  if (user && !user.onboardedAt) {
    // Backfill: quem já tem centro de custo cadastrado (usuários antigos
    // anteriores ao onboarding) é marcado como onboarded automaticamente
    // pra não cair em loop de wizard.
    const existingCount = await db.costCenter.count({
      where: { userId: session.user.id },
    });
    if (existingCount > 0) {
      await db.user.update({
        where: { id: session.user.id },
        data: { onboardedAt: new Date() },
      });
    } else {
      redirect("/onboarding");
    }
  }

  return (
    <AccessGate>
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar fixa em desktop (md+). Em mobile a navegação vai pelo
            MobileNav (hamburger) dentro do Header. */}
        <div className="hidden md:flex">
          <Sidebar />
        </div>
        <div className="flex flex-1 flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto bg-background">
            {children}
          </main>
        </div>
      </div>
    </AccessGate>
  );
}
