'use client'

import Link from 'next/link'
import { useState } from 'react'
import type { ProductCard } from '@/lib/sanity-queries'
import { productImageUrl } from '@/lib/sanity-queries'

interface Props {
  product: ProductCard
}

export default function SanityProductCard({ product }: Props) {
  const [hovered, setHovered] = useState(false)

  const href = `/colecao/${product.slug.current}`
  const tag = product.category?.title ?? 'Destaque'
  const imageUrl = product.images?.[0]
    ? productImageUrl(product.images[0], 600)
    : null

  const priceFormatted = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
  }).format(product.price)

  return (
    <Link href={href} style={{ textDecoration: 'none' }}>
      <article
        className="il-card"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div style={{ height: 280, overflow: 'hidden', background: 'var(--il-warm-mid)' }}>
          {imageUrl ? (
            <div
              className="il-card-img"
              style={{
                height: '100%',
                width: '100%',
                backgroundImage: `url(${imageUrl})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                transform: hovered ? 'scale(1.05)' : 'scale(1)',
              }}
            />
          ) : (
            /* Placeholder enquanto não há imagem no Sanity */
            <div style={{ height: '100%', background: 'var(--il-warm-mid)' }} />
          )}
        </div>

        <div style={{ padding: '22px 26px 26px' }}>
          <p className="il-label" style={{ marginBottom: 10 }}>{tag}</p>
          <h3 style={{
            fontFamily: 'var(--il-font-serif)',
            fontStyle: 'italic',
            fontWeight: 300,
            fontSize: 24,
            color: 'var(--il-deep)',
            margin: '0 0 10px',
          }}>
            {product.title}
          </h3>
          <p style={{ fontSize: 12.5, lineHeight: 1.7, color: 'var(--il-muted)', margin: 0 }}>
            {priceFormatted}
          </p>
          <div
            className="il-card-cta"
            style={{
              marginTop: 18,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              fontFamily: 'var(--il-font-display)',
              fontSize: 9,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: 'var(--il-deep)',
            }}
          >
            <span style={{ width: 16, height: 0.5, background: 'var(--il-gold)', display: 'block' }} />
            Ver peça
          </div>
        </div>

        <span className="il-card-bar" />
      </article>
    </Link>
  )
}
