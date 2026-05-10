const BLOG_STORAGE_REPO = process.env.REACT_APP_BLOG_STORAGE_REPO || 'OL3s/Blogg-Storage';
const BLOG_STORAGE_BRANCH = process.env.REACT_APP_BLOG_STORAGE_BRANCH || 'main';
const blogStorageRoot = process.env.REACT_APP_BLOG_STORAGE_ROOT;
const BLOG_STORAGE_ROOT = (blogStorageRoot === undefined ? 'games' : blogStorageRoot).replace(/^\/+|\/+$/g, '');

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

function contentApiUrl(path) {
  const encodedPath = path
    .split('/')
    .filter(Boolean)
    .map(encodeURIComponent)
    .join('/');

  return `https://api.github.com/repos/${BLOG_STORAGE_REPO}/contents/${encodedPath}?ref=${encodeURIComponent(BLOG_STORAGE_BRANCH)}`;
}

async function fetchJson(url) {
  const response = await fetch(url, {
    headers: {
      Accept: 'application/vnd.github+json',
    },
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`GitHub returned ${response.status} for ${url}`);
  }

  return response.json();
}

async function fetchMarkdownPost(entry) {
  const response = await fetch(entry.download_url);

  if (!response.ok) {
    throw new Error(`GitHub returned ${response.status} for ${entry.download_url}`);
  }

  const fileContent = await response.text();
  const { data, body } = parseFrontMatter(fileContent);

  return {
    slug: entry.name.replace(/\.md$/i, ''),
    title: data.title || titleFromFileName(entry.name),
    date: data.date || dateFromFileName(entry.name),
    excerpt: data.excerpt || '',
    body,
  };
}

export async function fetchGameBlogPosts(gameSlug) {
  if (postsCache.has(gameSlug)) {
    return postsCache.get(gameSlug);
  }

  const postsPromise = (async () => {
    const blogPath = [BLOG_STORAGE_ROOT, gameSlug, 'blog'].filter(Boolean).join('/');
    const entries = await fetchJson(contentApiUrl(blogPath));

    if (!entries) {
      return [];
    }

    if (!Array.isArray(entries)) {
      throw new Error(`Expected ${blogPath} to be a directory in ${BLOG_STORAGE_REPO}`);
    }

    const posts = await Promise.all(
      entries
        .filter((entry) => entry.type === 'file' && entry.name.toLowerCase().endsWith('.md') && entry.download_url)
        .map(fetchMarkdownPost)
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
