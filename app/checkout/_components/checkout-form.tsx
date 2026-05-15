'use client'

/**
 * Formulário de checkout com Stripe Payment Element (deferred intent).
 *
 * Fluxo:
 * 1. Renderiza resumo do carrinho + formulário de endereço + Payment Element
 * 2. No submit: valida o Payment Element → POST /api/checkout/create-intent
 *    → stripe.confirmPayment() → redireciona para /pedido/[id]
 */
import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { loadStripe } from '@stripe/stripe-js'
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js'
import { useCartStore } from '@/stores/cart-store'

// ─── Stripe promise (singleton, não recria por render) ─────────────────────

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? ''
)

// ─── Formatação ────────────────────────────────────────────────────────────

const fmt = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)

// ─── Tipos ─────────────────────────────────────────────────────────────────

interface Props {
  userId: string
  userEmail: string
  userName: string
}

interface AddressFields {
  name: string
  line1: string
  line2: string
  city: string
  state: string
  postalCode: string
  phone: string
}

// ─── Inner form (usa hooks do Stripe — deve estar dentro de <Elements>) ────

function InnerForm({
  userEmail,
  userName,
  orderId,
  setOrderId,
}: {
  userEmail: string
  userName: string
  orderId: string | null
  setOrderId: (id: string) => void
}) {
  const stripe   = useStripe()
  const elements = useElements()
  const router   = useRouter()
  const { items, totalAmount, clear } = useCartStore()
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState<string | null>(null)

  const [addr, setAddr] = useState<AddressFields>({
    name: userName,
    line1: '',
    line2: '',
    city: '',
    state: '',
    postalCode: '',
    phone: '',
  })

  function handleAddr(field: keyof AddressFields, value: string) {
    setAddr(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!stripe || !elements) return

    setLoading(true)
    setError(null)

    try {
      // 1. Valida o Payment Element (cartão preenchido etc.)
      const { error: elemError } = await elements.submit()
      if (elemError) {
        setError(elemError.message ?? 'Erro no pagamento.')
        setLoading(false)
        return
      }

      // 2. Cria o PaymentIntent + Order no servidor com preços validados
      const res = await fetch('/api/checkout/create-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cartItems: items.map(i => ({
            sanityProductId: i.sanityProductId,
            quantity: i.quantity,
          })),
          shippingAddress: {
            name: addr.name,
            line1: addr.line1,
            line2: addr.line2 || undefined,
            city: addr.city,
            state: addr.state,
            postalCode: addr.postalCode,
            phone: addr.phone || undefined,
          },
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Erro ao criar pedido.')
        setLoading(false)
        return
      }

      const { clientSecret, orderId: newOrderId } = data
      setOrderId(newOrderId)

      // 3. Confirma o pagamento com Stripe
      const { error: confirmError } = await stripe.confirmPayment({
        elements,
        clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/pedido/${newOrderId}`,
          payment_method_data: {
            billing_details: {
              name: addr.name,
              email: userEmail,
              phone: addr.phone || undefined,
              address: {
                line1: addr.line1,
                line2: addr.line2 || undefined,
                city: addr.city,
                state: addr.state,
                postal_code: addr.postalCode,
                country: 'BR',
              },
            },
          },
        },
        redirect: 'if_required',
      })

      if (confirmError) {
        setError(confirmError.message ?? 'Pagamento não aprovado.')
        setLoading(false)
        return
      }

      // 4. Pagamento confirmado — limpa carrinho e redireciona
      clear()
      router.push(`/pedido/${newOrderId}?status=paid`)
    } catch {
      setError('Erro inesperado. Tente novamente.')
      setLoading(false)
    }
  }

  const total = totalAmount()

  return (
    <form onSubmit={handleSubmit}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 380px',
          gap: 48,
          maxWidth: 1100,
          margin: '0 auto',
          padding: '48px 40px 80px',
        }}
      >
        {/* ── Coluna esquerda: formulários ── */}
        <div>
          {/* Dados pessoais */}
          <Section label="1. Seus dados">
            <FormRow>
              <Field
                label="Nome completo"
                value={addr.name}
                onChange={v => handleAddr('name', v)}
                required
              />
              <Field
                label="E-mail"
                type="email"
                value={userEmail}
                disabled
              />
            </FormRow>
          </Section>

          {/* Endereço */}
          <Section label="2. Endereço de entrega">
            <Field
              label="Rua e número"
              value={addr.line1}
              onChange={v => handleAddr('line1', v)}
              required
            />
            <Field
              label="Complemento (opcional)"
              value={addr.line2}
              onChange={v => handleAddr('line2', v)}
            />
            <FormRow>
              <Field
                label="Cidade"
                value={addr.city}
                onChange={v => handleAddr('city', v)}
                required
              />
              <Field
                label="Estado (UF)"
                value={addr.state}
                onChange={v => handleAddr('state', v.toUpperCase().slice(0, 2))}
                placeholder="SP"
                maxLength={2}
                required
              />
            </FormRow>
            <FormRow>
              <Field
                label="CEP"
                value={addr.postalCode}
                onChange={v => handleAddr('postalCode', v)}
                placeholder="00000-000"
                required
              />
              <Field
                label="Telefone (opcional)"
                type="tel"
                value={addr.phone}
                onChange={v => handleAddr('phone', v)}
                placeholder="(11) 9 0000-0000"
              />
            </FormRow>
          </Section>

          {/* Pagamento */}
          <Section label="3. Pagamento">
            <div
              style={{
                padding: '24px',
                border: '0.5px solid var(--il-line)',
                background: 'var(--il-white)',
              }}
            >
              <PaymentElement
                options={{
                  layout: 'tabs',
                  fields: { billingDetails: 'never' },
                }}
              />
            </div>
          </Section>

          {/* Erro global */}
          {error && (
            <p
              style={{
                fontFamily: 'var(--il-font-body)',
                fontSize: 13,
                color: '#c0392b',
                marginTop: 16,
                padding: '12px 16px',
                background: '#fdf2f2',
                border: '0.5px solid #f5c6c6',
              }}
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !stripe}
            className="il-solid"
            style={{
              marginTop: 24,
              width: '100%',
              justifyContent: 'center',
              opacity: loading ? 0.6 : 1,
              cursor: loading ? 'wait' : 'pointer',
            }}
          >
            {loading ? 'Processando...' : `Confirmar pagamento — ${fmt(total)}`}
          </button>
        </div>

        {/* ── Coluna direita: resumo do pedido ── */}
        <div>
          <div
            style={{
              position: 'sticky',
              top: 96,
              background: 'var(--il-white)',
              border: '0.5px solid var(--il-line)',
              padding: 32,
            }}
          >
            <p className="il-label" style={{ marginBottom: 24 }}>
              Resumo do pedido
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {items.map(item => (
                <div
                  key={item.sanityProductId}
                  style={{
                    display: 'flex',
                    gap: 12,
                    paddingBlock: 16,
                    borderBottom: '0.5px solid var(--il-line-dark)',
                  }}
                >
                  {/* Thumbnail */}
                  <div
                    style={{
                      width: 60,
                      height: 76,
                      flexShrink: 0,
                      background: 'var(--il-warm-mid)',
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                  >
                    {item.product.imageUrl && (
                      <Image
                        src={item.product.imageUrl}
                        alt={item.product.title}
                        fill
                        sizes="60px"
                        style={{ objectFit: 'cover' }}
                      />
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p
                      style={{
                        fontFamily: 'var(--il-font-body)',
                        fontSize: 13,
                        color: 'var(--il-text)',
                        marginBottom: 2,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {item.product.title}
                    </p>
                    <p
                      style={{
                        fontFamily: 'var(--il-font-body)',
                        fontSize: 11,
                        color: 'var(--il-muted)',
                      }}
                    >
                      Qtd: {item.quantity}
                    </p>
                    <p
                      style={{
                        fontFamily: 'var(--il-font-serif)',
                        fontStyle: 'italic',
                        fontSize: 15,
                        color: 'var(--il-gold)',
                        marginTop: 4,
                      }}
                    >
                      {fmt(item.product.price * item.quantity)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Totais */}
            <div style={{ marginTop: 20 }}>
              <SummaryRow label="Subtotal" value={fmt(total)} />
              <SummaryRow label="Frete" value="A calcular" muted />
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                  marginTop: 16,
                  paddingTop: 16,
                  borderTop: '0.5px solid var(--il-line)',
                }}
              >
                <span
                  style={{
                    fontFamily: 'var(--il-font-display)',
                    fontSize: 10.5,
                    letterSpacing: '0.2em',
                    textTransform: 'uppercase',
                    color: 'var(--il-deep)',
                  }}
                >
                  Total
                </span>
                <span
                  style={{
                    fontFamily: 'var(--il-font-serif)',
                    fontStyle: 'italic',
                    fontSize: 24,
                    fontWeight: 300,
                    color: 'var(--il-gold)',
                  }}
                >
                  {fmt(total)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  )
}

// ─── Componente principal ───────────────────────────────────────────────────

export default function CheckoutForm({ userId, userEmail, userName }: Props) {
  const { items, totalAmount } = useCartStore()
  const [mounted, setMounted] = useState(false)
  const [orderId, setOrderId] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => setMounted(true), [])

  // Redireciona se carrinho vazio (após hidratação)
  useEffect(() => {
    if (mounted && items.length === 0 && !orderId) {
      router.replace('/colecao')
    }
  }, [mounted, items.length, orderId, router])

  if (!mounted) {
    return <CheckoutSkeleton />
  }

  if (items.length === 0 && !orderId) {
    return <CheckoutSkeleton />  // redireciona via useEffect
  }

  const totalCents = Math.round(totalAmount() * 100)

  return (
    <div style={{ minHeight: '100vh', background: 'var(--il-off)' }}>
      {/* Cabeçalho minimal */}
      <header
        style={{
          height: 64,
          borderBottom: '0.5px solid var(--il-line)',
          display: 'flex',
          alignItems: 'center',
          padding: '0 40px',
          background: 'var(--il-white)',
        }}
      >
        <Link href="/" aria-label="Voltar para a loja">
          <Image
            src="/logo-ilumiluz.svg"
            alt="Ilumiluz"
            width={96}
            height={24}
            priority
          />
        </Link>
        <p
          style={{
            fontFamily: 'var(--il-font-display)',
            fontSize: 10,
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
            color: 'var(--il-muted)',
            marginLeft: 24,
          }}
        >
          Checkout seguro
        </p>
      </header>

      {/* Formulário com Stripe Elements */}
      <Elements
        stripe={stripePromise}
        options={{
          mode: 'payment',
          amount: totalCents,
          currency: 'brl',
          appearance: {
            theme: 'flat',
            variables: {
              colorPrimary: '#561730',
              colorBackground: '#FAF8F5',
              colorText: '#3D3830',
              colorDanger: '#c0392b',
              fontFamily:
                '"Barlow", system-ui, -apple-system, sans-serif',
              borderRadius: '0px',
              fontSizeBase: '13px',
            },
            rules: {
              '.Input': {
                border: '0.5px solid rgba(86, 23, 48, 0.18)',
                padding: '12px 14px',
                boxShadow: 'none',
              },
              '.Input:focus': {
                border: '0.5px solid #561730',
                boxShadow: 'none',
                outline: 'none',
              },
              '.Label': {
                fontSize: '10px',
                letterSpacing: '0.25em',
                textTransform: 'uppercase',
                marginBottom: '6px',
                color: '#8A857E',
              },
              '.Tab': {
                border: '0.5px solid rgba(86, 23, 48, 0.18)',
                boxShadow: 'none',
              },
              '.Tab--selected': {
                border: '0.5px solid #561730',
                boxShadow: 'none',
              },
            },
          },
        }}
      >
        <InnerForm
          userEmail={userEmail}
          userName={userName}
          orderId={orderId}
          setOrderId={setOrderId}
        />
      </Elements>
    </div>
  )
}

// ─── Sub-componentes de UI ──────────────────────────────────────────────────

function Section({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div style={{ marginBottom: 40 }}>
      <p className="il-eyebrow" style={{ marginBottom: 24 }}>
        {label}
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {children}
      </div>
    </div>
  )
}

function FormRow({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 16,
      }}
    >
      {children}
    </div>
  )
}

interface FieldProps {
  label: string
  value: string
  onChange?: (v: string) => void
  type?: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
  maxLength?: number
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  required,
  disabled,
  maxLength,
}: FieldProps) {
  return (
    <div>
      <label
        style={{
          display: 'block',
          fontFamily: 'var(--il-font-display)',
          fontSize: 10,
          letterSpacing: '0.25em',
          textTransform: 'uppercase',
          color: 'var(--il-muted)',
          marginBottom: 6,
        }}
      >
        {label}
        {required && (
          <span style={{ color: 'var(--il-gold)', marginLeft: 2 }}>*</span>
        )}
      </label>
      <input
        type={type}
        value={value}
        onChange={e => onChange?.(e.target.value)}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        maxLength={maxLength}
        style={{
          display: 'block',
          width: '100%',
          padding: '12px 14px',
          fontFamily: 'var(--il-font-body)',
          fontSize: 13,
          color: disabled ? 'var(--il-muted)' : 'var(--il-text)',
          background: disabled ? 'var(--il-off)' : 'var(--il-white)',
          border: '0.5px solid var(--il-line)',
          outline: 'none',
          transition: 'border-color 150ms',
        }}
        onFocus={e =>
          !disabled && (e.currentTarget.style.borderColor = 'var(--il-gold)')
        }
        onBlur={e =>
          (e.currentTarget.style.borderColor = 'var(--il-line)')
        }
      />
    </div>
  )
}

function SummaryRow({
  label,
  value,
  muted,
}: {
  label: string
  value: string
  muted?: boolean
}) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        marginBottom: 8,
      }}
    >
      <span
        style={{
          fontFamily: 'var(--il-font-body)',
          fontSize: 12,
          color: 'var(--il-muted)',
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontFamily: 'var(--il-font-body)',
          fontSize: 13,
          color: muted ? 'var(--il-muted)' : 'var(--il-text)',
          fontStyle: muted ? 'italic' : 'normal',
        }}
      >
        {value}
      </span>
    </div>
  )
}

function CheckoutSkeleton() {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--il-off)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <p
        style={{
          fontFamily: 'var(--il-font-serif)',
          fontStyle: 'italic',
          fontSize: 20,
          color: 'var(--il-muted)',
        }}
      >
        Carregando...
      </p>
    </div>
  )
}
