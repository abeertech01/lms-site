import { defineArrayMember, defineField, defineType } from "sanity"

export const postType = defineType({
  name: "post",
  title: "Blog post",
  type: "document",
  fields: [
    defineField({ name: "title", type: "string", validation: r => r.required() }),
    defineField({
      name: "slug",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: r => r.required(),
    }),
    defineField({
      name: "excerpt",
      type: "text",
      rows: 3,
      description: "Short summary shown on the blog list. Also the fallback meta description.",
      validation: r => r.required().max(300),
    }),
    defineField({
      name: "coverImage",
      type: "image",
      options: { hotspot: true },
      fields: [
        defineField({
          name: "alt",
          type: "string",
          title: "Alt text",
          validation: r => r.required(),
        }),
      ],
    }),
    defineField({ name: "author", type: "reference", to: [{ type: "author" }] }),
    defineField({
      name: "categories",
      type: "array",
      of: [defineArrayMember({ type: "reference", to: [{ type: "category" }] })],
    }),
    defineField({
      name: "publishedAt",
      type: "datetime",
      initialValue: () => new Date().toISOString(),
      validation: r => r.required(),
    }),
    defineField({
      name: "body",
      type: "array",
      of: [
        defineArrayMember({ type: "block" }),
        defineArrayMember({
          type: "image",
          options: { hotspot: true },
          fields: [
            defineField({ name: "alt", type: "string", title: "Alt text" }),
          ],
        }),
      ],
    }),
    defineField({
      name: "seo",
      title: "SEO",
      type: "object",
      options: { collapsible: true, collapsed: false },
      fields: [
        defineField({
          name: "metaTitle",
          type: "string",
          description: "Defaults to the post title. Aim for under 60 characters.",
          validation: r => r.max(70),
        }),
        defineField({
          name: "metaDescription",
          type: "text",
          rows: 3,
          description: "Defaults to the excerpt. Aim for 150-160 characters.",
          validation: r => r.max(170),
        }),
        defineField({
          name: "ogImage",
          title: "Social share image",
          type: "image",
          description: "Defaults to the cover image.",
        }),
        defineField({
          name: "noIndex",
          type: "boolean",
          initialValue: false,
          description: "Hide this post from search engines.",
        }),
      ],
    }),
  ],
  orderings: [
    {
      title: "Newest first",
      name: "publishedAtDesc",
      by: [{ field: "publishedAt", direction: "desc" }],
    },
  ],
  preview: {
    select: { title: "title", subtitle: "author.name", media: "coverImage" },
  },
})
