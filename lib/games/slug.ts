/** Gera o slug estável usado pelos banners locais dos jogos. */
export function gameSlug(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function gameBannerSrc(name: string): string {
  return `/images/games/${gameSlug(name)}.png`;
}
