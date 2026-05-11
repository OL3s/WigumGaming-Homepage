import { BLOG_STORAGE_ROOT, fetchRawText, fetchSiteIndex } from './storageApi';

const postsCache = new Map();

function parseFrontMatter(fileContent) {
  const match = fileContent.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);

  if (!match) {
    return { data: {}, body: fileContent.trim() };
  }

  const data = match[1].split(/\r?\n/).reduce((result, line) => {
    const separatorIndex = line.indexOf(':');

    if (separatorIndex === -1) {
      return result;
    }

    const key = line.slice(0, separatorIndex).trim();
    const value = line.slice(separatorIndex + 1).trim().replace(/^['"]|['"]$/g, '');

    if (key) {
      result[key] = value;
    }

    return result;
  }, {});

  return {
    data,
    body: fileContent.slice(match[0].length).trim(),
  };
}

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
    const siteIndex = await fetchSiteIndex();
    const game = (siteIndex.games || []).find((entry) => entry.slug === gameSlug);
    const blogFiles = game?.blogFiles || [];

    const posts = await Promise.all(
      blogFiles
        .filter((fileName) => fileName.toLowerCase().endsWith('.md'))
        .map((fileName) => fetchMarkdownPost(gameSlug, fileName))
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
