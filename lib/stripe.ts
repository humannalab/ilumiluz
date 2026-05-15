/**
 * Stripe server-side client — lazy initialization.
 *
 * Usa `getStripe()` em vez de exportar a instância diretamente para
 * evitar que `new Stripe('')` seja chamado na build estática do Next.js,
 * quando STRIPE_SECRET_KEY pode ainda não estar disponível.
 *
 * Uso: const stripe = getStripe()
 */
import Stripe from 'stripe'

let _stripe: Stripe | null = null

export function getStripe(): Stripe {
  if (_stripe) return _stripe
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) throw new Error('STRIPE_SECRET_KEY não está configurado.')
  _stripe = new Stripe(key, { apiVersion: '2025-02-24.acacia' })
  return _stripe
}
