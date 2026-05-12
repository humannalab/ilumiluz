/**
 * Sanity Studio embarcado no Next.js.
 * Acessível em /studio após deploy.
 * Adicione você e a sócia como editores em sanity.io/manage.
 */

import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'
import { schemaTypes } from './sanity/schemas'

export default defineConfig({
  name: 'ilumiluz-store',
  title: 'Ilumiluz',

  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset:   process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production',

  plugins: [
    structureTool(),
    visionTool(), // GROQ playground — útil em desenvolvimento
  ],

  schema: {
    types: schemaTypes,
  },
})
