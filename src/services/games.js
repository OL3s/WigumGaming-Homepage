import { BLOG_STORAGE_ROOT, listStorageDirectory, rawContentUrl } from './storageApi';
import { fetchLocalizedRawText } from './localizedContent';
import { parseFrontMatter } from './markdown';

const IMAGE_FOLDER = 'image';
const IMAGE_EXTENSIONS = ['.avif', '.webp', '.jpg', '.jpeg', '.png', '.svg'];
const gamesCache = new Map();

function titleFromSlug(slug) {
  return slug
    .split('-')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function isImageFile(entry) {
  const name = entry.name.toLowerCase();
  return entry.type === 'file' && IMAGE_EXTENSIONS.some((extension) => name.endsWith(extension));
}

function findPreviewImage(entries, orientation) {
  const preferredNames = [`index-${orientation}`, `main-${orientation}`];

  return preferredNames
    .map((prefix) => entries.find((entry) => isImageFile(entry) && entry.name.toLowerCase().startsWith(`${prefix}.`)))
    .find(Boolean);
}

async function getGameImages(slug) {
  const entries = await listStorageDirectory(`${BLOG_STORAGE_ROOT}/${slug}/${IMAGE_FOLDER}`);
  const landscape = findPreviewImage(entries, 'landscape');
  const portrait = findPreviewImage(entries, 'portrait');

  return {
    imageWideSrc: landscape ? rawContentUrl(`${BLOG_STORAGE_ROOT}/${slug}/${IMAGE_FOLDER}/${landscape.name}`) : '',
    imagePortraitSrc: portrait ? rawContentUrl(`${BLOG_STORAGE_ROOT}/${slug}/${IMAGE_FOLDER}/${portrait.name}`) : '',
  };
}

async function fetchGameMetadata(slug, language) {
  const fileContent = await fetchLocalizedRawText(`${BLOG_STORAGE_ROOT}/${slug}/index.md`, language);
  const { data, body } = parseFrontMatter(fileContent);

  return {
    ...data,
    description: body,
  };
}

async function fetchGame(entry, language) {
  const slug = entry.name;
  const metadata = await fetchGameMetadata(slug, language);
  const images = await getGameImages(slug);
  const name = metadata?.name || titleFromSlug(slug);

  return {
    slug,
    name,
    teaser: metadata?.teaser || '',
    description: metadata?.description || '',
    githubRepo: metadata?.githubRepo || '',
    githubUrl: metadata?.githubUrl || '',
    imageScale: 1.04,
    ...images,
  };
}

export async function fetchGames(language = 'en') {
  const cacheKey = `${BLOG_STORAGE_ROOT || 'root'}:${language}`;

  if (gamesCache.has(cacheKey)) {
    return gamesCache.get(cacheKey);
  }

  const gamesPromise = (async () => {
    const entries = await listStorageDirectory(BLOG_STORAGE_ROOT);

    const games = await Promise.all(
      entries
        .filter((entry) => entry.type === 'directory')
        .sort((first, second) => first.name.localeCompare(second.name))
        .map((entry) => fetchGame(entry, language))
    );

    return games;
  })();

  gamesCache.set(cacheKey, gamesPromise);
  return gamesPromise;
}
