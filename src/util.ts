export const joinPath = (...segments: string[]): string => {
  const path = segments
    .join("/")
    .replace(/\/+/g, "/") // Replace multiple slashes with single
    .replace(/^(.+):\//, "$1://") // Preserve protocol slashes (http://)
    .replace(/\/+$/, ""); // Remove trailing slashes

  // Add trailing slash unless it has an extension
  return /\.[^/.]+$/.test(path) ? path : path + "/";
};

export const compact = (obj: Record<string, any>): Record<string, any> =>
  Object.fromEntries(Object.entries(obj).filter(([_, value]) => value != null));
