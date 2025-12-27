import { XMLBuilder } from "fast-xml-parser";

interface Entry {
  title: string;
  updated: Date;
  link: string;
  id?: string; // Assumed to be same as link
  description?: string;
  content?: string;
  author?: {
    name: string;
    email: string;
  };
}

interface Options {
  title: string;
  base: string;
  items: Entry[];
  outputPath: string; // e.g. feed.xml
  description?: string;
  author: {
    name: string;
    email?: string;
  };
}

const joinPath = (...segments: string[]): string => {
  const path = segments
    .join("/")
    .replace(/\/+/g, "/") // Replace multiple slashes with single
    .replace(/^(.+):\//, "$1://") // Preserve protocol slashes (http://)
    .replace(/\/+$/, ""); // Remove trailing slashes

  // Add trailing slash unless it has an extension
  return /\.[^/.]+$/.test(path) ? path : path + "/";
};

const compact = (obj: Record<string, any>): Record<string, any> =>
  Object.fromEntries(Object.entries(obj).filter(([_, value]) => value != null));

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
