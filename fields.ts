import { integer, text, timestamp, select, relationship } from '@keystone-6/core/fields'
import { document } from '@keystone-6/fields-document'

export const authorField = (ref: string) =>
  relationship({
    ref,
    ui: {
      displayMode: 'select',
      labelField: 'name',
      hideCreate: true,
      createView: {
        fieldMode: ({
          session: {
            data: { isAdmin },
          },
        }) => (isAdmin ? 'edit' : 'hidden'),
      },
      itemView: {
        fieldMode: ({
          session: {
            data: { isAdmin },
          },
        }) => (isAdmin ? 'edit' : 'read'),
      },
    },
    hooks: {
      resolveInput: ({ resolvedData, fieldKey, operation, context }) => {
        if (!context.session) {
          return resolvedData[fieldKey]
        }

        const { id, isAdmin } = context.session.data

        if (
          !isAdmin ||
          (operation === 'update' && resolvedData[fieldKey]?.disconnect) ||
          (operation === 'create' && !resolvedData[fieldKey]?.connect)
        ) {
          return { connect: { id } }
        }

        return resolvedData[fieldKey]
      },
    },
  })

export const orderField = integer({ defaultValue: -1, isIndexed: true })

export const contentField = document({
  formatting: true,
  layouts: [
    [1, 1],
    [1, 1, 1],
    [2, 1],
    [1, 2],
    [1, 2, 1],
  ],
  links: true,
  dividers: true,
})

export const statusField = select({
  options: [
    { label: 'Published', value: 'published' },
    { label: 'Draft', value: 'draft' },
  ],
  defaultValue: 'draft',
  ui: {
    displayMode: 'segmented-control',
  },
})

export const viewsCountField = integer({
  defaultValue: 0,
  ui: { createView: { fieldMode: 'hidden' }, itemView: { fieldMode: 'read' } },
})

export const seoFields = {
  seoTitle: text({ defaultValue: '', validation: { length: { max: 255 } } }),
  seoDescription: text({ defaultValue: '', validation: { length: { max: 255 } } }),
  seoKeywords: text({ defaultValue: '', validation: { length: { max: 255 } } }),
}

export const timestampFields = {
  createdAt: timestamp({
    defaultValue: { kind: 'now' },
    ui: { createView: { fieldMode: 'hidden' }, itemView: { fieldMode: 'hidden' } },
  }),
  updatedAt: timestamp({
    defaultValue: { kind: 'now' },
    db: { updatedAt: true },
    ui: { createView: { fieldMode: 'hidden' }, itemView: { fieldMode: 'hidden' } },
  }),
}
