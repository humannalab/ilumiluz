import { Suspense } from 'react'
import { getAllCategories, getProducts, productImageUrl } from '@/lib/sanity-queries'
import type { ProductCard } from '@/lib/sanity-queries'
import Link from 'next/link'
import Image from 'next/image'
import Nav from '@/components/nav'
import Footer from '@/components/footer'

export const metadata = { title: 'Coleção — Ilumiluz' }

interface Props {
  searchParams: Promise<{ categoria?: string }>
}

export default async function ColecaoPage({ searchParams }: Props) {
  const { categoria } = await searchParams
  const [categories, products] = await Promise.all([
    getAllCategories(),
    getProducts(categoria),
  ])

  return (
    <>
      <Nav />
      <main style={{ background: 'var(--il-off)', minHeight: '100vh' }}>
        {/* Header da seção */}
        <section style={{
          padding: '80px 80px 48px',
          borderBottom: '0.5px solid var(--il-line)',
        }}>
          <p className="il-eyebrow" style={{ marginBottom: 16 }}>Ilumiluz</p>
          <h1 className="il-h" style={{ fontSize: 48, marginBottom: 0 }}>
            {categoria
              ? categories.find(c => c.slug.current === categoria)?.title ?? 'Coleção'
              : <><em>Todas</em> as peças.</>
            }
          </h1>
        </section>

        {/* Filtros de categoria */}
        {categories.length > 0 && (
          <section style={{
            padding: '24px 80px',
            borderBottom: '0.5px solid var(--il-line)',
            display: 'flex',
            gap: 8,
            flexWrap: 'wrap',
          }}>
            <Link
              href="/colecao"
              className="il-chip"
              style={!categoria ? activeChip : undefined}
            >
              Todas
            </Link>
            {categories.map(cat => (
              <Link
                key={cat._id}
                href={`/colecao?categoria=${cat.slug.current}`}
                className="il-chip"
                style={categoria === cat.slug.current ? activeChip : undefined}
              >
                {cat.title}
              </Link>
            ))}
          </section>
        )}

        {/* Grade de produtos */}
        <section style={{ padding: '48px 80px 96px' }}>
          {products.length === 0 ? (
            <p className="il-body" style={{ color: 'var(--il-muted)' }}>
              Nenhuma peça disponível nesta categoria.
            </p>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: 32,
            }}>
              {products.map(product => (
                <ProductCardItem key={product._id} product={product} />
              ))}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  )
}

const activeChip: React.CSSProperties = {
  background: 'var(--il-gold)',
  color: 'var(--il-off)',
  borderColor: 'var(--il-gold)',
}

function ProductCardItem({ product }: { product: ProductCard }) {
  const firstImage = product.images?.[0]
  const imgUrl = firstImage ? productImageUrl(firstImage, 600) : null

  return (
    <Link href={`/colecao/${product.slug.current}`} className="il-card" style={{ display: 'block' }}>
      <div className="il-card-img" style={{ position: 'relative', aspectRatio: '3/4', background: 'var(--il-warm-mid)' }}>
        {imgUrl && (
          <Image
            src={imgUrl}
            alt={firstImage.alt}
            fill
            sizes="(max-width: 768px) 100vw, 350px"
            style={{ objectFit: 'cover' }}
          />
        )}
        {!product.inStock && (
          <span className="il-chip" style={{
            position: 'absolute', top: 16, left: 16,
            background: 'var(--il-deep)', color: 'var(--il-off)', borderColor: 'var(--il-deep)',
          }}>
            Indisponível
          </span>
        )}
      </div>
      <div style={{ padding: '20px 0 0' }}>
        {product.category && (
          <p className="il-eyebrow" style={{ marginBottom: 6, fontSize: 10.5 }}>
            {product.category.title}
          </p>
        )}
        <p style={{
          fontFamily: 'var(--il-font-body)',
          fontSize: 14,
          fontWeight: 400,
          color: 'var(--il-text)',
          margin: '0 0 8px',
        }}>
          {product.title}
        </p>
        <p style={{
          fontFamily: 'var(--il-font-serif)',
          fontStyle: 'italic',
          fontSize: 17,
          fontWeight: 300,
          color: 'var(--il-gold)',
          margin: 0,
        }}>
          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price)}
        </p>
      </div>
    </Link>
  )
}
