import { BLOG_STORAGE_ROOT, fetchRawJson, fetchSiteIndex, rawContentUrl } from './storageApi';

const IMAGE_FOLDER = 'image';
const gamesCache = new Map();

function titleFromSlug(slug) {
  return slug
    .split('-')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function getGameImages(slug, images = {}) {
  return {
    imageWideSrc: images.landscape ? rawContentUrl(`${BLOG_STORAGE_ROOT}/${slug}/${IMAGE_FOLDER}/${images.landscape}`) : '',
    imagePortraitSrc: images.portrait ? rawContentUrl(`${BLOG_STORAGE_ROOT}/${slug}/${IMAGE_FOLDER}/${images.portrait}`) : '',
  };
}

async function fetchGameMetadata(slug) {
  return fetchRawJson(`${BLOG_STORAGE_ROOT}/${slug}/index.json`);
}

async function fetchGame(entry) {
  const slug = entry.slug;
  const metadata = await fetchGameMetadata(slug);
  const images = getGameImages(slug, entry.images);
  const name = metadata?.name || titleFromSlug(slug);

  return {
    slug,
    name,
    mainDescription: metadata?.mainDescription || '',
    teaser: metadata?.teaser || '',
    secondaryDescription: metadata?.secondaryDescription || '',
    githubRepo: metadata?.githubRepo || '',
    githubUrl: metadata?.githubUrl || '',
    imageScale: 1.04,
    ...images,
  };
}

export async function fetchGames() {
  const cacheKey = BLOG_STORAGE_ROOT || 'root';

  if (gamesCache.has(cacheKey)) {
    return gamesCache.get(cacheKey);
  }

  const gamesPromise = (async () => {
    const siteIndex = await fetchSiteIndex();

    if (!Array.isArray(siteIndex.games)) {
      return [];
    }

    const games = await Promise.all(
      siteIndex.games
        .filter((entry) => entry.slug)
        .sort((first, second) => first.slug.localeCompare(second.slug))
        .map(fetchGame)
    );

    return games;
  })();

  gamesCache.set(cacheKey, gamesPromise);
  return gamesPromise;
}
