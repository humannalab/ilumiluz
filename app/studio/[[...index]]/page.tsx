// Exporta metadata e viewport corretos para o Sanity Studio (next-sanity v9).
// Deve ser Server Component para poder exportar metadata.
export { metadata, viewport } from 'next-sanity/studio'

import StudioClient from './_studio-client'

export default function StudioPage() {
  return <StudioClient />
}
