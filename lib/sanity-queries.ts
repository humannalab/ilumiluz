import { sanityClient, urlFor } from './sanity'
import type { SanityImageSource } from '@sanity/image-url/lib/types/types'
import { PortableTextBlock } from 'next-sanity'

// ─── Types ─────────────────────────────────────────────────────────────────

export interface SanityImage {
  asset: SanityImageSource
  alt: string
  ordem: number
}

export interface Category {
  _id: string
  title: string
  slug: { current: string }
  parent?: { title: string; slug: { current: string } }
}

export interface ProductCard {
  _id: string
  title: string
  slug: { current: string }
  price: number
  inStock: boolean
  featured: boolean
  images: SanityImage[]
  category?: { title: string; slug: { current: string } }
}

export interface ProductDetail extends ProductCard {
  description?: PortableTextBlock[]
  sku?: string
}

// ─── Image helpers ──────────────────────────────────────────────────────────

export function productImageUrl(image: SanityImage, width = 800): string {
  return urlFor(image.asset).width(width).auto('format').quality(80).url()
}

// ─── Queries ────────────────────────────────────────────────────────────────

const PRODUCT_CARD_FIELDS = `
  _id,
  title,
  slug,
  price,
  inStock,
  featured,
  "images": images[] | order(ordem asc) {
    asset,
    alt,
    ordem
  },
  category-> { title, slug }
`

const PRODUCT_DETAIL_FIELDS = `
  ${PRODUCT_CARD_FIELDS},
  description,
  sku
`

export async function getAllCategories(): Promise<Category[]> {
  return sanityClient.fetch<Category[]>(
    `*[_type == "category"] | order(title asc) {
      _id, title, slug,
      parent-> { title, slug }
    }`,
    {},
    { next: { revalidate: 3600 } }
  )
}

export async function getProducts(categorySlug?: string): Promise<ProductCard[]> {
  const filter = categorySlug
    ? `*[_type == "product" && inStock == true && category->slug.current == $categorySlug]`
    : `*[_type == "product" && inStock == true]`

  return sanityClient.fetch<ProductCard[]>(
    `${filter} | order(_createdAt desc) { ${PRODUCT_CARD_FIELDS} }`,
    { categorySlug: categorySlug ?? null },
    { next: { revalidate: 60 } }
  )
}

export async function getFeaturedProducts(): Promise<ProductCard[]> {
  return sanityClient.fetch<ProductCard[]>(
    `*[_type == "product" && featured == true && inStock == true] | order(_createdAt desc)[0...6] {
      ${PRODUCT_CARD_FIELDS}
    }`,
    {},
    { next: { revalidate: 60 } }
  )
}

export async function getProductBySlug(slug: string): Promise<ProductDetail | null> {
  return sanityClient.fetch<ProductDetail | null>(
    `*[_type == "product" && slug.current == $slug][0] { ${PRODUCT_DETAIL_FIELDS} }`,
    { slug },
    { next: { revalidate: 60 } }
  )
}

export async function getRelatedProducts(
  productId: string,
  categorySlug?: string
): Promise<ProductCard[]> {
  const filter = categorySlug
    ? `*[_type == "product" && _id != $productId && inStock == true && category->slug.current == $categorySlug]`
    : `*[_type == "product" && _id != $productId && inStock == true]`

  return sanityClient.fetch<ProductCard[]>(
    `${filter} | order(_createdAt desc)[0...4] { ${PRODUCT_CARD_FIELDS} }`,
    { productId, categorySlug: categorySlug ?? null },
    { next: { revalidate: 60 } }
  )
}
