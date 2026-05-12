import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { createCheckoutSession, createCustomerPortalSession } from "@/lib/stripe";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { isSubscribed, isVoucherActive } from "@/lib/subscription";
import { CheckCircle } from "lucide-react";

async function handleUpgrade() {
  "use server";
  const session = await auth();
  if (!session?.user) redirect("/login");

  const user = await db.user.findUnique({ where: { id: session.user.id } });
  if (!user) redirect("/login");

  const checkoutSession = await createCheckoutSession({
    userId: user.id,
    email: user.email!,
    priceId: process.env.STRIPE_PRICE_ID_PRO!,
    stripeCustomerId: user.stripeCustomerId,
  });

  redirect(checkoutSession.url!);
}

async function handlePortal() {
  "use server";
  const session = await auth();
  if (!session?.user) redirect("/login");

  const user = await db.user.findUnique({ where: { id: session.user.id } });
  if (!user?.stripeCustomerId) redirect("/settings/billing");

  const portalSession = await createCustomerPortalSession(user.stripeCustomerId);
  redirect(portalSession.url);
}

const PRO_FEATURES = [
  "Transações ilimitadas",
  "Centros de custo ilimitados",
  "Categorias ilimitadas",
  "Suposições ilimitadas",
  "Gráfico anual completo",
  "Suporte prioritário",
];

export default async function BillingPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const user = await db.user.findUnique({ where: { id: session.user.id } });
  if (!user) redirect("/login");

  const isPro = isSubscribed(user);
  const isTrial = isVoucherActive(user);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Plano atual</CardTitle>
            <Badge variant={isPro ? "default" : isTrial ? "secondary" : "outline"}>
              {isPro ? "PRO" : isTrial ? "Trial (Voucher)" : "Sem acesso"}
            </Badge>
          </div>
          <CardDescription>
            {isPro && user.stripeCurrentPeriodEnd
              ? `Renova em ${new Intl.DateTimeFormat("pt-BR").format(user.stripeCurrentPeriodEnd)}`
              : isTrial
              ? "Acesso completo durante o período do voucher"
              : "Insira um voucher ou assine o plano PRO para ter acesso."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isPro ? (
            <form action={handlePortal}>
              <Button type="submit" variant="outline">
                Gerenciar assinatura
              </Button>
            </form>
          ) : (
            <form action={handleUpgrade}>
              <Button type="submit">Fazer upgrade para PRO</Button>
            </form>
          )}
        </CardContent>
      </Card>

      {!isPro && (
        <Card className="border-primary/50">
          <CardHeader>
            <CardTitle>Plano PRO</CardTitle>
            <CardDescription>Tudo ilimitado, sem surpresas.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-2">
              {PRO_FEATURES.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-income" />
                  {f}
                </li>
              ))}
            </ul>
            <form action={handleUpgrade}>
              <Button type="submit" className="w-full">
                Assinar agora
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
