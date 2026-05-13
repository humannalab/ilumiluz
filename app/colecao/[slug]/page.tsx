import { notFound } from 'next/navigation'
import { getProductBySlug, getRelatedProducts, productImageUrl } from '@/lib/sanity-queries'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { PortableText } from 'next-sanity'
import Nav from '@/components/nav'
import Footer from '@/components/footer'
import ProductGallery from './product-gallery'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const product = await getProductBySlug(slug)
  if (!product) return {}
  return {
    title: `${product.title} — Ilumiluz`,
    description: `${product.title} — ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price)}`,
  }
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params
  const product = await getProductBySlug(slug)
  if (!product) notFound()

  const related = await getRelatedProducts(product._id, product.category?.slug.current)
  const formattedPrice = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price)

  return (
    <>
      <Nav />
      <main style={{ background: 'var(--il-off)', minHeight: '100vh' }}>

        {/* Breadcrumb */}
        <div style={{ padding: '24px 80px', borderBottom: '0.5px solid var(--il-line)' }}>
          <nav style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <Link href="/colecao" style={{
              fontFamily: 'var(--il-font-body)',
              fontSize: 12,
              fontWeight: 300,
              color: 'var(--il-muted)',
              textDecoration: 'none',
            }}>
              Coleção
            </Link>
            <span style={{ color: 'var(--il-muted)', fontSize: 12 }}>—</span>
            {product.category && (
              <>
                <Link href={`/colecao?categoria=${product.category.slug.current}`} style={{
                  fontFamily: 'var(--il-font-body)',
                  fontSize: 12,
                  fontWeight: 300,
                  color: 'var(--il-muted)',
                  textDecoration: 'none',
                }}>
                  {product.category.title}
                </Link>
                <span style={{ color: 'var(--il-muted)', fontSize: 12 }}>—</span>
              </>
            )}
            <span style={{
              fontFamily: 'var(--il-font-body)',
              fontSize: 12,
              fontWeight: 400,
              color: 'var(--il-text)',
            }}>
              {product.title}
            </span>
          </nav>
        </div>

        {/* Layout principal: galeria + info */}
        <section style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 0,
          maxWidth: 1400,
          margin: '0 auto',
          padding: '0 80px',
        }}>
          {/* Galeria de imagens */}
          <ProductGallery images={product.images ?? []} title={product.title} />

          {/* Informações do produto */}
          <div style={{ padding: '64px 0 64px 72px' }}>
            {product.category && (
              <p className="il-eyebrow" style={{ marginBottom: 16 }}>{product.category.title}</p>
            )}

            <h1 className="il-h" style={{ fontSize: 40, marginBottom: 16, lineHeight: 1.1 }}>
              {product.title}
            </h1>

            <p style={{
              fontFamily: 'var(--il-font-serif)',
              fontStyle: 'italic',
              fontSize: 28,
              fontWeight: 300,
              color: 'var(--il-gold)',
              margin: '0 0 40px',
            }}>
              {formattedPrice}
            </p>

            {product.description && product.description.length > 0 && (
              <div style={{ marginBottom: 48 }}>
                <div style={{
                  fontFamily: 'var(--il-font-body)',
                  fontSize: 13.5,
                  fontWeight: 300,
                  lineHeight: 1.8,
                  color: 'var(--il-text)',
                }}>
                  <PortableText value={product.description} />
                </div>
              </div>
            )}

            {/* CTA */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {product.inStock ? (
                <button
                  className="il-out"
                  style={{ justifyContent: 'center' }}
                  data-product-id={product._id}
                  data-product-title={product.title}
                  data-product-price={product.price}
                >
                  Adicionar ao carrinho →
                </button>
              ) : (
                <button className="il-out" disabled style={{ justifyContent: 'center', opacity: 0.4 }}>
                  Indisponível
                </button>
              )}
              <Link href="/sob-medida" className="il-ghost">
                Quero uma joia sob medida
              </Link>
            </div>

            {/* Detalhes discretos */}
            <div style={{
              marginTop: 48,
              paddingTop: 32,
              borderTop: '0.5px solid var(--il-line)',
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
            }}>
              {product.sku && (
                <p style={{ fontFamily: 'var(--il-font-body)', fontSize: 11.5, color: 'var(--il-muted)', margin: 0 }}>
                  Ref. {product.sku}
                </p>
              )}
              <p style={{ fontFamily: 'var(--il-font-body)', fontSize: 11.5, color: 'var(--il-muted)', margin: 0 }}>
                Peça produzida no ateliê Ilumiluz, São Paulo.
              </p>
              <p style={{ fontFamily: 'var(--il-font-body)', fontSize: 11.5, color: 'var(--il-muted)', margin: 0 }}>
                Frete calculado no checkout. Envio em até 5 dias úteis.
              </p>
            </div>
          </div>
        </section>

        {/* Peças relacionadas */}
        {related.length > 0 && (
          <section style={{
            padding: '64px 80px 96px',
            borderTop: '0.5px solid var(--il-line)',
          }}>
            <p className="il-eyebrow" style={{ marginBottom: 40 }}>Você também pode gostar</p>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: 24,
            }}>
              {related.map(item => {
                const img = item.images?.[0]
                const imgUrl = img ? productImageUrl(img, 400) : null
                return (
                  <Link key={item._id} href={`/colecao/${item.slug.current}`} style={{ display: 'block', textDecoration: 'none' }}>
                    <div style={{ aspectRatio: '3/4', background: 'var(--il-warm-mid)', position: 'relative', marginBottom: 16 }}>
                      {imgUrl && (
                        <Image
                          src={imgUrl}
                          alt={img!.alt}
                          fill
                          sizes="25vw"
                          style={{ objectFit: 'cover' }}
                        />
                      )}
                    </div>
                    <p style={{ fontFamily: 'var(--il-font-body)', fontSize: 13, fontWeight: 400, color: 'var(--il-text)', margin: '0 0 4px' }}>
                      {item.title}
                    </p>
                    <p style={{ fontFamily: 'var(--il-font-serif)', fontStyle: 'italic', fontSize: 15, fontWeight: 300, color: 'var(--il-gold)', margin: 0 }}>
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.price)}
                    </p>
                  </Link>
                )
              })}
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  )
}
