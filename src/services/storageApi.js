export const BLOG_STORAGE_REPO = process.env.REACT_APP_BLOG_STORAGE_REPO || 'OL3s/Blogg-Storage';
export const BLOG_STORAGE_BRANCH = process.env.REACT_APP_BLOG_STORAGE_BRANCH || 'main';

const blogStorageRoot = process.env.REACT_APP_BLOG_STORAGE_ROOT;
export const BLOG_STORAGE_ROOT = (blogStorageRoot === undefined ? 'games' : blogStorageRoot).replace(/^\/+|\/+$/g, '');

let storageTreeCache = null;

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

function packageTreeUrl() {
  return `https://data.jsdelivr.com/v1/package/gh/${BLOG_STORAGE_REPO}@${encodeURIComponent(BLOG_STORAGE_BRANCH)}`;
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
    const error = new Error(`GitHub returned ${response.status} for ${url}`);
    error.status = response.status;
    error.statusText = response.statusText;
    error.url = url;
    throw error;
  }

  return response.json();
}

export async function fetchRawText(path) {
  const url = rawContentUrl(path);
  const response = await fetch(url, { cache: 'no-store' });

  if (!response.ok) {
    const error = new Error(`GitHub returned ${response.status} for ${url}`);
    error.status = response.status;
    error.statusText = response.statusText;
    error.url = url;
    throw error;
  }

  return response.text();
}

export async function fetchRawJson(path) {
  const text = await fetchRawText(path);
  return JSON.parse(text);
}

export async function fetchStorageTree() {
  if (storageTreeCache) {
    return storageTreeCache;
  }

  storageTreeCache = (async () => {
    const response = await fetch(packageTreeUrl());

    if (!response.ok) {
      const error = new Error(`jsDelivr returned ${response.status} for ${packageTreeUrl()}`);
      error.status = response.status;
      error.statusText = response.statusText;
      error.url = packageTreeUrl();
      throw error;
    }

    return response.json();
  })();

  return storageTreeCache;
}

function findEntryInTree(entries, pathParts) {
  if (pathParts.length === 0) {
    return { type: 'directory', name: '', files: entries };
  }

  const [nextPart, ...remainingParts] = pathParts;
  const entry = entries.find((candidate) => candidate.name === nextPart);

  if (!entry || remainingParts.length === 0) {
    return entry || null;
  }

  if (!Array.isArray(entry.files)) {
    return null;
  }

  return findEntryInTree(entry.files, remainingParts);
}

export async function getStorageEntry(path) {
  const tree = await fetchStorageTree();
  const pathParts = path.split('/').filter(Boolean);
  return findEntryInTree(tree.files || [], pathParts);
}

export async function listStorageDirectory(path) {
  const entry = await getStorageEntry(path);
  return Array.isArray(entry?.files) ? entry.files : [];
}
