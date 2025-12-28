import { XMLBuilder } from "fast-xml-parser";
import { compact, joinPath } from "./util.js";

interface Author {
  name: string;
  email?: string;
}

/**
 * A single Atom feed entry.
 */
interface Entry {
  /** Title of the entry */
  title: string;
  /** Last updated timestamp for the entry */
  updated: Date;
  /** Canonical URL linking to the entry */
  link: string;
  /** Short summary or description of the entry */
  description?: string;
  /** Full content of the entry (assumed HTML) */
  content?: string;
  /** Optional author override for this entry */
  author?: Author;
}

/**
 * Configuration options for generating an Atom feed.
 */
interface Options {
  /** Title of the feed */
  title: string;
  /**
   * Base URL used to resolve relative links
   * @example "https://example.com"
   */
  base: string;
  /** Entries included in the feed */
  items: Entry[];
  /**
   * Output file path for the generated feed.
   * @example "feed.xml"
   */
  outputPath: string;
  /** Default author for the feed */
  author: Author;
  /** Optional description of the feed */
  description?: string;
}

export const atom = async (opt: Options): Promise<Response> => {
  const builder = new XMLBuilder({
    ignoreAttributes: false,
    format: true,
    suppressEmptyNode: true,
  });

  const root: Record<string, any> = {
    "?xml": { "@_version": "1.0", "@_encoding": "UTF-8" },
  };

  const mostRecentItemDate = opt.items
    ? new Date(Math.max(...opt.items.map((item) => item.updated.getTime())))
    : new Date();

  root.feed = compact({
    "@_xmlns": "http://www.w3.org/2005/Atom",
    id: joinPath(opt.base),
    title: opt.title,
    subtitle: opt.description,
    author: opt.author,
    updated: mostRecentItemDate.toISOString(),
    link: {
      "@_rel": "self",
      "@_href": joinPath(opt.base, opt.outputPath),
    },
  });

  root.feed.entry = opt.items.map((entry) => {
    const link = entry.link.startsWith(opt.base)
      ? entry.link
      : joinPath(opt.base, entry.link);

    return compact({
      id: link,
      author: entry.author,
      title: entry.title,
      summary: entry.description,
      link: {
        "@_href": link,
      },
      updated: entry.updated.toISOString(),
      content: entry.content
        ? {
            "@_type": "html",
            "#text": entry.content,
          }
        : undefined,
    });
  });

  const content = builder.build(root);

  return new Response(content, {
    headers: {
      "Content-Type": "application/xml",
    },
  });
};
