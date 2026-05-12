/**
 * Cliente Sanity para o ilumiluz-store.
 * Usado em Server Components via next-sanity.
 * O projeto Sanity é independente do Bartho Finance.
 */

import { createClient } from 'next-sanity'
import imageUrlBuilder from '@sanity/image-url'
import type { SanityImageSource } from '@sanity/image-url/lib/types/types'

export const sanityConfig = {
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset:   process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production',
  apiVersion: '2024-01-01',
  useCdn:    process.env.NODE_ENV === 'production',
} as const

export const sanityClient = createClient(sanityConfig)

// Helper para gerar URLs de imagem otimizadas via @sanity/image-url
const builder = imageUrlBuilder(sanityClient)

export function urlFor(source: SanityImageSource) {
  return builder.image(source)
}
