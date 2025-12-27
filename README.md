# astro-atom

Simple Atom feed generator for Astro.

Example:

```ts
import { atom } from 'astro-atom'

// src/pages/feed.xml.js
export async function GET(context) {
  const posts = await getCollection('blog')

  return atom({
    title: 'My Blog',
    base: 'https://example.com',
    outputPath: 'feed.xml',
    author: {
      name: 'Your Name',
    },
    items: posts.map((post) => {
      // See https://docs.astro.build/en/recipes/rss/#including-full-post-content
      const content = sanitizeHtml(parser.render(post.body), {
        allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img']),
      })

      return {
        title: post.data.title,
        description: post.data.description,
        updated: post.data.date,
        link: `/posts/${post.id}/`,
        content,
      }
    }),
  })
}
```

