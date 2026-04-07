type ClassDict = Record<string, boolean>;

export function cn(...parts: (string | undefined | null | false | ClassDict)[]): string {
  const out: string[] = [];
  for (const p of parts) {
    if (!p) continue;
    if (typeof p === 'string') {
      out.push(p);
      continue;
    }
    for (const [key, val] of Object.entries(p)) {
      if (val) out.push(key);
    }
  }
  return out.join(' ');
}
