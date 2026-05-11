export const BLOG_STORAGE_REPO = process.env.REACT_APP_BLOG_STORAGE_REPO || 'OL3s/Blogg-Storage';
export const BLOG_STORAGE_BRANCH = process.env.REACT_APP_BLOG_STORAGE_BRANCH || 'main';

const blogStorageRoot = process.env.REACT_APP_BLOG_STORAGE_ROOT;
export const BLOG_STORAGE_ROOT = (blogStorageRoot === undefined ? 'games' : blogStorageRoot).replace(/^\/+|\/+$/g, '');

let siteIndexCache = null;

export function contentApiUrl(path) {
  const encodedPath = path
    .split('/')
    .filter(Boolean)
    .map(encodeURIComponent)
    .join('/');

  return `https://api.github.com/repos/${BLOG_STORAGE_REPO}/contents/${encodedPath}?ref=${encodeURIComponent(BLOG_STORAGE_BRANCH)}`;
}

export function rawContentUrl(path) {
  const encodedPath = path
    .split('/')
    .filter(Boolean)
    .map(encodeURIComponent)
    .join('/');

  return `https://raw.githubusercontent.com/${BLOG_STORAGE_REPO}/${encodeURIComponent(BLOG_STORAGE_BRANCH)}/${encodedPath}`;
}

export async function fetchJson(url) {
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

export async function fetchRawText(path) {
  const url = rawContentUrl(path);
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`GitHub returned ${response.status} for ${url}`);
  }

  return response.text();
}

export async function fetchRawJson(path) {
  const text = await fetchRawText(path);
  return JSON.parse(text);
}

export async function fetchSiteIndex() {
  if (siteIndexCache) {
    return siteIndexCache;
  }

  siteIndexCache = fetchRawJson('site-index.json');
  return siteIndexCache;
}
