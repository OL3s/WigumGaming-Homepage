import { contentApiUrl, fetchJson, fetchRawText, listStorageDirectory, rawContentUrl } from './storageApi';

const ABOUT_ROOT = 'about-us';
const ABOUT_IMAGE_FOLDER = 'image';
const ABOUT_MEMBERS_FOLDER = 'members';

let aboutUsCache = null;

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

function normalizeImageFileName(image) {
  if (!image) {
    return '';
  }

  return image.replace(/^\.\.\//, '').replace(/^image\//, '').replace(/^\/+/, '');
}

async function fetchAboutIndex() {
  const fileContent = await fetchRawText(`${ABOUT_ROOT}/index.md`);
  const { data, body } = parseFrontMatter(fileContent);

  return {
    title: data.title || 'About Us.',
    releaseNote: data.releaseNote || '',
    body,
  };
}

async function fetchMember(fileName) {
  const fileContent = await fetchRawText(`${ABOUT_ROOT}/${ABOUT_MEMBERS_FOLDER}/${fileName}`);
  const { data, body } = parseFrontMatter(fileContent);
  const imageFileName = normalizeImageFileName(data.image);

  return {
    name: data.name || '',
    role: data.role || '',
    body,
    imageSrc: imageFileName ? rawContentUrl(`${ABOUT_ROOT}/${ABOUT_IMAGE_FOLDER}/${imageFileName}`) : '',
  };
}

async function fetchMembers() {
  const membersPath = `${ABOUT_ROOT}/${ABOUT_MEMBERS_FOLDER}`;
  const githubEntries = await fetchJson(contentApiUrl(membersPath));
  const entries = Array.isArray(githubEntries) ? githubEntries : await listStorageDirectory(membersPath);

  return Promise.all(
    entries
      .filter((entry) => entry.type === 'file' && entry.name.toLowerCase().endsWith('.md'))
      .sort((first, second) => first.name.localeCompare(second.name))
      .map((entry) => fetchMember(entry.name))
  );
}

export async function fetchAboutUs() {
  if (aboutUsCache) {
    return aboutUsCache;
  }

  aboutUsCache = (async () => {
    const [page, members] = await Promise.all([fetchAboutIndex(), fetchMembers()]);
    return { page, members };
  })().catch((error) => {
    aboutUsCache = null;
    throw error;
  });

  return aboutUsCache;
}
