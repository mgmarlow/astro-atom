import { z } from "zod";

const Rfc3339TimestampSchema = z.iso.datetime({ offset: true });

const JsonFeedAuthorSchema = z.object({
  // Make Name required to fit with Atom spec.
  name: z.string(),
  url: z.url().optional(),
  avatar: z.url().optional(),
});

const JsonFeedAttachmentSchema = z.object({
  url: z.url(),
  mime_type: z.string(),
  title: z.string().optional(),
  size_in_bytes: z.number().int().positive().optional(),
  duration_in_seconds: z.number().positive().optional(),
});

const JsonFeedItemSchema = z
  .object({
    // Assumed to be the permalink URL of the article.
    id: z.url(),
    url: z.url().optional(),
    external_url: z.url().optional(),
    title: z.string().optional(),

    content_html: z.string().optional(),
    content_text: z.string().optional(),
    summary: z.string().optional(),

    image: z.url().optional(),
    banner_image: z.url().optional(),

    date_published: Rfc3339TimestampSchema.optional(),
    date_modified: Rfc3339TimestampSchema.optional(),

    authors: z.array(JsonFeedAuthorSchema).optional(),

    tags: z.array(z.string()).optional(),
    language: z.string().optional(),
    attachments: z.array(JsonFeedAttachmentSchema).optional(),
  })
  .refine((item) => item.content_html || item.content_text, {
    error: "Item must have either content_html or content_text",
  });

export const JsonFeedSchema = z.object({
  version: z.literal("https://jsonfeed.org/version/1.1"),
  title: z.string(),

  // Optional in spec, but non-optional for an Astro use-case.
  home_page_url: z.url(),
  feed_url: z.url(),

  description: z.string().optional(),
  user_comment: z.string().optional(),
  next_url: z.url().optional(),
  icon: z.url().optional(),
  favicon: z.url().optional(),
  authors: z.array(JsonFeedAuthorSchema).optional(),
  language: z.string().optional(),
  expired: z.boolean().optional(),

  items: z.array(JsonFeedItemSchema),
});
