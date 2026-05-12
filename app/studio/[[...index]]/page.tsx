'use client'

/**
 * Sanity Studio embarcado. Rota /studio.
 * Proteger com middleware se quiser restringir acesso por login.
 */

import { NextStudio } from 'next-sanity/studio'
import config from '../../../sanity.config'

export default function StudioPage() {
  return <NextStudio config={config} />
}
