'use client'

import Link from 'next/link'
import { useState } from 'react'

interface ProductCardProps {
  img: string
  tag: string
  title: string
  desc: string
  href: string
}

export default function ProductCard({ img, tag, title, desc, href }: ProductCardProps) {
  const [hovered, setHovered] = useState(false)

  return (
    <Link href={href} style={{ textDecoration: 'none' }}>
      <article
        className="il-card"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div style={{ height: 280, overflow: 'hidden', background: 'var(--il-warm-mid)' }}>
          <div
            className="il-card-img"
            style={{
              height: '100%',
              width: '100%',
              backgroundImage: `url(/${img})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              transform: hovered ? 'scale(1.05)' : 'scale(1)',
            }}
          />
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
            {title}
          </h3>
          <p style={{ fontSize: 12.5, lineHeight: 1.7, color: 'var(--il-muted)', margin: 0 }}>
            {desc}
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
