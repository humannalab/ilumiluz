/**
 * POST /api/stripe/webhook
 *
 * Recebe eventos do Stripe e atualiza o Order no banco.
 * Isenção de CSRF já configurada no middleware.ts.
 * Verificação de assinatura obrigatória.
 */
import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { db } from '@/lib/db'
import type Stripe from 'stripe'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')

  if (!sig) {
    return NextResponse.json({ error: 'Assinatura ausente.' }, { status: 400 })
  }

  const secret = process.env.STRIPE_WEBHOOK_SECRET
  if (!secret) {
    console.error('[webhook] STRIPE_WEBHOOK_SECRET não configurado.')
    return NextResponse.json({ error: 'Webhook não configurado.' }, { status: 500 })
  }

  let event: Stripe.Event
  try {
    event = getStripe().webhooks.constructEvent(body, sig, secret)
  } catch (err) {
    console.error('[webhook] Assinatura inválida:', err)
    return NextResponse.json({ error: 'Assinatura inválida.' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const pi = event.data.object as Stripe.PaymentIntent
        await db.order.update({
          where: { stripePaymentIntentId: pi.id },
          data: {
            status: 'paid',
            stripeChargeId:
              typeof pi.latest_charge === 'string' ? pi.latest_charge : null,
          },
        })
        console.log(`[webhook] Pedido pago. PI: ${pi.id}`)
        break
      }

      case 'payment_intent.payment_failed': {
        const pi = event.data.object as Stripe.PaymentIntent
        await db.order.update({
          where: { stripePaymentIntentId: pi.id },
          data: { status: 'payment_failed' },
        })
        console.log(`[webhook] Pagamento falhou. PI: ${pi.id}`)
        break
      }

      case 'payment_intent.canceled': {
        const pi = event.data.object as Stripe.PaymentIntent
        await db.order.update({
          where: { stripePaymentIntentId: pi.id },
          data: { status: 'cancelled' },
        })
        break
      }

      default:
        // Ignora eventos não tratados
        break
    }
  } catch (err) {
    console.error(`[webhook] Erro ao processar evento ${event.type}:`, err)
    // Retorna 200 mesmo assim — Stripe não vai retentar se der erro interno nosso
    return NextResponse.json({ received: true, error: String(err) })
  }

  return NextResponse.json({ received: true })
}
