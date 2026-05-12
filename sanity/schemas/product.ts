import { defineField, defineType } from 'sanity'

export const product = defineType({
  name: 'product',
  title: 'Peça',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Nome da peça',
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
      name: 'description',
      title: 'Descrição',
      type: 'array',
      of: [{ type: 'block' }], // portable text
    }),
    defineField({
      name: 'price',
      title: 'Preço (R$)',
      type: 'number',
      validation: (r) => r.required().positive(),
    }),
    defineField({
      name: 'images',
      title: 'Imagens (até 5)',
      type: 'array',
      of: [{ type: 'productImage' }],
      validation: (r) => r.max(5),
    }),
    defineField({
      name: 'category',
      title: 'Categoria',
      type: 'reference',
      to: [{ type: 'category' }],
    }),
    defineField({
      name: 'sku',
      title: 'SKU',
      type: 'string',
    }),
    defineField({
      name: 'inStock',
      title: 'Disponível',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'featured',
      title: 'Destaque na home',
      type: 'boolean',
      initialValue: false,
    }),
  ],
  preview: {
    select: {
      title: 'title',
      media: 'images.0.asset',
      inStock: 'inStock',
    },
    prepare({ title, media, inStock }) {
      return {
        title,
        subtitle: inStock ? 'Disponível' : 'Indisponível',
        media,
      }
    },
  },
})
