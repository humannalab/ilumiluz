/**
 * /checkout — página de finalização de compra.
 *
 * Server component: verifica sessão e redireciona se não autenticado.
 * Passa dados do usuário para o CheckoutForm (client component).
 */
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import CheckoutForm from './_components/checkout-form'

export default async function CheckoutPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/login?callbackUrl=/checkout')
  }

  return (
    <CheckoutForm
      userId={session.user.id}
      userEmail={session.user.email ?? ''}
      userName={session.user.name ?? ''}
    />
  )
}
