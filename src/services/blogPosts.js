import { fetchRawText, listStorageDirectory } from './storageApi';
import { parseFrontMatter } from './markdown';

const postsCache = new Map();

function titleFromFileName(fileName) {
  return fileName
    .replace(/^\d{4}-\d{2}-\d{2}-?/, '')
    .replace(/\.md$/i, '')
    .split('-')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function dateFromFileName(fileName) {
  const match = fileName.match(/^(\d{4}-\d{2}-\d{2})/);
  return match ? match[1] : '';
}

async function fetchMarkdownPost(game, fileName) {
  const fileContent = await fetchRawText(`${game.contentPath}/blog/${fileName}`);
  const { data, body } = parseFrontMatter(fileContent);

  return {
    slug: fileName.replace(/\.md$/i, ''),
    title: data.title || titleFromFileName(fileName),
    date: data.date || dateFromFileName(fileName),
    excerpt: data.excerpt || '',
    body,
  };
}

export async function fetchGameBlogPosts(game) {
  if (!game?.contentPath) {
    return [];
  }

  const cacheKey = game.contentPath || game.slug;

  if (postsCache.has(cacheKey)) {
    return postsCache.get(cacheKey);
  }

  const postsPromise = (async () => {
    const entries = await listStorageDirectory(`${game.contentPath}/blog`);

    const posts = await Promise.all(
      entries
        .filter((entry) => entry.type === 'file' && entry.name.toLowerCase().endsWith('.md'))
        .map((entry) => fetchMarkdownPost(game, entry.name))
    );

    return posts.sort((a, b) => {
      const dateComparison = (b.date || '').localeCompare(a.date || '');
      return dateComparison || b.slug.localeCompare(a.slug);
    });
  })();

  postsCache.set(cacheKey, postsPromise);
  return postsPromise;
}

export async function fetchBlogPostsByGame(games) {
  const entries = await Promise.all(
    games.map(async (game) => [game.slug, await fetchGameBlogPosts(game)])
  );

  return Object.fromEntries(entries);
}
