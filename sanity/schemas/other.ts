import { defineField, defineType } from 'sanity'

export const productImage = defineType({
  name: 'productImage',
  title: 'Imagem de peça',
  type: 'object',
  fields: [
    defineField({
      name: 'asset',
      title: 'Imagem',
      type: 'image',
      options: { hotspot: true },
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'alt',
      title: 'Texto alternativo',
      type: 'string',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'ordem',
      title: 'Ordem de exibição',
      type: 'number',
      initialValue: 0,
    }),
  ],
  preview: {
    select: { title: 'alt', media: 'asset' },
  },
})

export const category = defineType({
  name: 'category',
  title: 'Categoria',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Nome',
      type: 'string',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'parent',
      title: 'Categoria-pai',
      type: 'reference',
      to: [{ type: 'category' }],
      // Opcional — permite hierarquia de categorias
    }),
  ],
})

export const banner = defineType({
  name: 'banner',
  title: 'Banner',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Título interno',
      type: 'string',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'image',
      title: 'Imagem',
      type: 'image',
      options: { hotspot: true },
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'ctaText',
      title: 'Texto do CTA',
      type: 'string',
    }),
    defineField({
      name: 'ctaUrl',
      title: 'URL do CTA',
      type: 'url',
    }),
    defineField({
      name: 'active',
      title: 'Ativo',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'position',
      title: 'Posição',
      type: 'string',
      options: {
        list: [
          { title: 'Hero', value: 'hero' },
          { title: 'Meio da página', value: 'mid' },
          { title: 'Rodapé da loja', value: 'footer' },
        ],
      },
    }),
  ],
  preview: {
    select: {
      title: 'title',
      media: 'image',
      active: 'active',
    },
    prepare({ title, media, active }) {
      return { title, subtitle: active ? 'Ativo' : 'Inativo', media }
    },
  },
})
