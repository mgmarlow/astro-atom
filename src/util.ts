export const compact = (obj: Record<string, any>): Record<string, any> =>
  Object.fromEntries(Object.entries(obj).filter(([_, value]) => value != null));
