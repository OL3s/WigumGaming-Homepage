import { BLOG_STORAGE_ROOT, fetchRawText, listStorageDirectory } from './storageApi';
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

async function fetchMarkdownPost(gameSlug, fileName) {
  const fileContent = await fetchRawText(`${BLOG_STORAGE_ROOT}/${gameSlug}/blog/${fileName}`);
  const { data, body } = parseFrontMatter(fileContent);

  return {
    slug: fileName.replace(/\.md$/i, ''),
    title: data.title || titleFromFileName(fileName),
    date: data.date || dateFromFileName(fileName),
    excerpt: data.excerpt || '',
    body,
  };
}

export async function fetchGameBlogPosts(gameSlug) {
  if (postsCache.has(gameSlug)) {
    return postsCache.get(gameSlug);
  }

  const postsPromise = (async () => {
    const entries = await listStorageDirectory(`${BLOG_STORAGE_ROOT}/${gameSlug}/blog`);

    const posts = await Promise.all(
      entries
        .filter((entry) => entry.type === 'file' && entry.name.toLowerCase().endsWith('.md'))
        .map((entry) => fetchMarkdownPost(gameSlug, entry.name))
    );

    return posts.sort((a, b) => {
      const dateComparison = (b.date || '').localeCompare(a.date || '');
      return dateComparison || b.slug.localeCompare(a.slug);
    });
  })();

  postsCache.set(gameSlug, postsPromise);
  return postsPromise;
}

export async function fetchBlogPostsByGame(gameSlugs) {
  const entries = await Promise.all(
    gameSlugs.map(async (gameSlug) => [gameSlug, await fetchGameBlogPosts(gameSlug)])
  );

  return Object.fromEntries(entries);
}
