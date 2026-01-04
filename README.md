# validate-feed

Validate [JSON Feed](https://www.jsonfeed.org/version/1.1/) and convert
it to Atom XML.

API:

- `validate(feed)`: throws `ZodError` if `feed` doesn't conform to the
  `https://www.jsonfeed.org/version/1.1/` specification.

- `atom(feed)`: Validates `feed` and returns an Atom XML string.

## Use with Astro

### Atom Feed

In `src/pages/feed.xml.js`:

```ts
import { atom } from 'astro-atom'

export async function GET(context) {
  const posts = await getCollection('blog')

  const content = atom({
    title: 'My Blog',
    home_page_url: 'https://example.com',
    feed_url: 'https://example.com/feed.xml',
    authors: [{
      name: 'Your Name',
    }],
    items: posts.map((post) => {
      // See https://docs.astro.build/en/recipes/rss/#including-full-post-content
      const content = sanitizeHtml(parser.render(post.body), {
        allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img']),
      })

      return {
        id: `https://example.com/posts/${post.id}/`,
        url: `https://example.com/posts/${post.id}/`,
        title: post.data.title,
        summary: post.data.description,
        date_published: post.data.date,
        content_html: content,
      }
    }),
  })

  return new Response(content, {
    headers: {
      'Content-Type': 'application/xml',
    },
  })
}
```

### JSON Feed

In `src/pages/feed.json.js`:

```ts
import { validate } from 'astro-atom'

export async function GET(context) {
  const posts = await getCollection('blog')

  const content = validate({
    title: 'My Blog',
    home_page_url: 'https://example.com',
    feed_url: 'https://example.com/feed.xml',
    authors: [{
      name: 'Your Name',
    }],
    items: posts.map((post) => {
      // See https://docs.astro.build/en/recipes/rss/#including-full-post-content
      const content = sanitizeHtml(parser.render(post.body), {
        allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img']),
      })

      return {
        id: `https://example.com/posts/${post.id}/`,
        url: `https://example.com/posts/${post.id}/`,
        title: post.data.title,
        summary: post.data.description,
        date_published: post.data.date,
        content_html: content,
      }
    }),
  })

  return new Response(JSON.stringify(content), {
    headers: {
      'Content-Type': 'application/feed+json',
    },
  })
}
```

