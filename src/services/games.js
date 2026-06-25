import { BLOG_STORAGE_ROOT, listStorageDirectory, rawContentUrl } from './storageApi';
import { fetchLocalizedRawText } from './localizedContent';
import { parseFrontMatter } from './markdown';

const IMAGE_FOLDER = 'image';
const IMAGE_EXTENSIONS = ['.avif', '.webp', '.jpg', '.jpeg', '.png', '.svg'];
export const GAME_CATEGORIES = [
  { key: 'finished', path: 'finished' },
  { key: 'upcoming', path: 'upcoming' },
  { key: 'planned', path: 'planned' },
];
const GAME_CATEGORY_PATHS = new Set(GAME_CATEGORIES.map((category) => category.path));
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

async function getGameImages(contentPath) {
  const entries = await listStorageDirectory(`${contentPath}/${IMAGE_FOLDER}`);
  const landscape = findPreviewImage(entries, 'landscape');
  const portrait = findPreviewImage(entries, 'portrait');

  return {
    imageWideSrc: landscape ? rawContentUrl(`${contentPath}/${IMAGE_FOLDER}/${landscape.name}`) : '',
    imagePortraitSrc: portrait ? rawContentUrl(`${contentPath}/${IMAGE_FOLDER}/${portrait.name}`) : '',
  };
}

async function fetchGameMetadata(contentPath, language) {
  const fileContent = await fetchLocalizedRawText(`${contentPath}/index.md`, language);
  const { data, body } = parseFrontMatter(fileContent);

  return {
    ...data,
    description: body,
  };
}

async function fetchGame(entry, category, language) {
  const slug = entry.name;
  const contentPath = [BLOG_STORAGE_ROOT, category.path, slug].filter(Boolean).join('/');
  const metadata = await fetchGameMetadata(contentPath, language);
  const images = await getGameImages(contentPath);
  const name = metadata?.name || titleFromSlug(slug);

  return {
    slug,
    category: category.key,
    contentPath,
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
    const gamesByCategory = await Promise.all(
      GAME_CATEGORIES.map(async (category) => {
        const entries = await listStorageDirectory(`${BLOG_STORAGE_ROOT}/${category.path}`);

        return Promise.all(
          entries
            .filter((entry) => entry.type === 'directory')
            .sort((first, second) => first.name.localeCompare(second.name))
            .map((entry) => fetchGame(entry, category, language))
        );
      })
    );

    const categorizedGames = gamesByCategory.flat();

    if (categorizedGames.length > 0) {
      return categorizedGames;
    }

    const legacyEntries = await listStorageDirectory(BLOG_STORAGE_ROOT);

    return Promise.all(
      legacyEntries
        .filter((entry) => entry.type === 'directory' && !GAME_CATEGORY_PATHS.has(entry.name))
        .sort((first, second) => first.name.localeCompare(second.name))
        .map((entry) => fetchGame(entry, { key: 'upcoming', path: '' }, language))
    );
  })();

  gamesCache.set(cacheKey, gamesPromise);
  return gamesPromise;
}
