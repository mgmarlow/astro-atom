import { z } from "zod";
import { XMLBuilder } from "fast-xml-parser";
import { compact } from "./util.js";
import { JsonFeedSchema } from "./feed.js";

export const validate = (
  feed: Omit<z.infer<typeof JsonFeedSchema>, "version">,
) =>
  JsonFeedSchema.parse({
    version: "https://jsonfeed.org/version/1.1",
    ...feed,
  });

export const atom = (
  feed: Omit<z.infer<typeof JsonFeedSchema>, "version">,
): string => {
  const validated = validate(feed);

  const builder = new XMLBuilder({
    ignoreAttributes: false,
    format: true,
    suppressEmptyNode: true,
    cdataPropName: "#cdata",
  });

  const root: Record<string, any> = {
    "?xml": { "@_version": "1.0", "@_encoding": "UTF-8" },
  };

  root.feed = compact({
    "@_xmlns": "http://www.w3.org/2005/Atom",
    id: validated.feed_url,
    title: validated.title,
    subtitle: validated.description,
    author: validated.authors,
    updated: new Date().toISOString(),
    link: {
      "@_rel": "self",
      "@_href": validated.feed_url,
    },
  });

  root.feed.entry = feed.items.map((entry) => {
    return compact({
      id: entry.id,
      author: entry.authors?.map((author) => ({
        "@_name": author.name,
        "@_uri": author.url,
      })),
      title: entry.title,
      summary: entry.summary,
      link: {
        "@_href": entry.url || entry.id,
      },
      updated: entry.date_modified || entry.date_published,
      content: entry.content_html
        ? {
            "@_type": "html",
            "#cdata": entry.content_html,
          }
        : entry.content_text,
    });
  });

  return builder.build(root);
};
