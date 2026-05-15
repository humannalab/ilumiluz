/**
 * POST /api/checkout/create-intent
 *
 * Cria um Stripe Payment Intent com preços validados no servidor (Sanity)
 * e persiste o pedido como "pending" no Postgres.
 *
 * Retorna: { clientSecret, orderId }
 */
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getStripe } from '@/lib/stripe'
import { db } from '@/lib/db'
import { sanityClient } from '@/lib/sanity'
import { z } from 'zod'

// ─── Validação do body ───────────────────────────────────────────────────────

const CartItemSchema = z.object({
  sanityProductId: z.string().min(1),
  quantity: z.number().int().positive().max(99),
})

const AddressSchema = z.object({
  name: z.string().min(2).max(120),
  line1: z.string().min(3).max(200),
  line2: z.string().max(100).optional(),
  city: z.string().min(2).max(100),
  state: z.string().length(2),           // e.g. "SP"
  postalCode: z.string().regex(/^\d{5}-?\d{3}$/),
  phone: z.string().max(20).optional(),
})

const BodySchema = z.object({
  cartItems: z.array(CartItemSchema).min(1).max(50),
  shippingAddress: AddressSchema,
})

// ─── Handler ─────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    // 1. Autenticação obrigatória
    const session = await auth()
    if (!session?.user?.id || !session.user.email) {
      return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 })
    }

    const userId = session.user.id
    const userEmail = session.user.email
    const userName = session.user.name ?? userEmail

    // 2. Valida body
    const raw = await req.json()
    const parsed = BodySchema.safeParse(raw)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Dados inválidos.', details: parsed.error.flatten() },
        { status: 400 }
      )
    }
    const { cartItems, shippingAddress } = parsed.data

    // 3. Valida preços via Sanity (servidor — não confia no cliente)
    const ids = cartItems.map(i => i.sanityProductId)
    const products = await sanityClient.fetch<
      Array<{
        _id: string
        title: string
        price: number
        slug: { current: string }
        inStock: boolean
        images: Array<{ asset: unknown; alt: string; ordem: number }> | null
      }>
    >(
      `*[_type == "product" && _id in $ids] {
        _id, title, price, slug, inStock,
        "images": images[0..0] { asset, alt, ordem }
      }`,
      { ids }
    )

    // Indexa por _id para lookup rápido
    const productMap = new Map(products.map(p => [p._id, p]))

    // Verifica que todos os produtos existem e estão em estoque
    for (const item of cartItems) {
      const p = productMap.get(item.sanityProductId)
      if (!p) {
        return NextResponse.json(
          { error: `Produto não encontrado: ${item.sanityProductId}` },
          { status: 422 }
        )
      }
      if (!p.inStock) {
        return NextResponse.json(
          { error: `Produto fora de estoque: ${p.title}` },
          { status: 422 }
        )
      }
    }

    // 4. Calcula total em centavos
    const totalAmount = cartItems.reduce((sum, item) => {
      const p = productMap.get(item.sanityProductId)!
      return sum + Math.round(p.price * 100) * item.quantity
    }, 0)

    if (totalAmount < 50) {   // Stripe mínimo: 50 centavos
      return NextResponse.json({ error: 'Valor mínimo não atingido.' }, { status: 422 })
    }

    // 5. Cria Stripe Payment Intent
    const paymentIntent = await getStripe().paymentIntents.create({
      amount: totalAmount,
      currency: 'brl',
      automatic_payment_methods: { enabled: true },
      metadata: { userId, userEmail },
      receipt_email: userEmail,
    })

    // 6. Persiste o endereço no banco
    const address = await db.address.create({
      data: {
        userId,
        type: 'shipping',
        name: shippingAddress.name,
        line1: shippingAddress.line1,
        line2: shippingAddress.line2 ?? null,
        city: shippingAddress.city,
        state: shippingAddress.state.toUpperCase(),
        postalCode: shippingAddress.postalCode.replace(/\D/g, '').replace(/(\d{5})(\d{3})/, '$1-$2'),
        phone: shippingAddress.phone ?? null,
        country: 'BR',
        isDefault: false,
      },
    })

    // 7. Cria o pedido "pending" no banco
    const order = await db.order.create({
      data: {
        userId,
        customerEmail: userEmail,
        customerName: userName,
        status: 'pending',
        totalAmount,
        shippingAmount: 0,
        stripePaymentIntentId: paymentIntent.id,
        shippingAddressId: address.id,
        billingAddressId: address.id,
        items: {
          create: cartItems.map(item => {
            const p = productMap.get(item.sanityProductId)!
            return {
              sanityProductId: item.sanityProductId,
              quantity: item.quantity,
              unitAmount: Math.round(p.price * 100),
              productSnapshot: {
                title: p.title,
                price: p.price,
                slug: p.slug.current,
              },
            }
          }),
        },
      },
    })

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      orderId: order.id,
    })
  } catch (err) {
    console.error('[create-intent] erro:', err)
    return NextResponse.json(
      { error: 'Erro interno. Tente novamente.' },
      { status: 500 }
    )
  }
}
