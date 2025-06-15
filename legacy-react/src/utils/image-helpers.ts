export function buildSrcSet(url: string, width: number): string {
  const sep = url.includes('?') ? '&' : '?';
  return `${url}${sep}width=${width} 1x, ${url}${sep}width=${width * 2} 2x`;
}
