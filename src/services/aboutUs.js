import { contentApiUrl, fetchJson, fetchRawText, listStorageDirectory, rawContentUrl } from './storageApi';

const ABOUT_ROOT = 'about-us';
const ABOUT_IMAGE_FOLDER = 'image';
const ABOUT_MEMBERS_FOLDER = 'members';
const ABOUT_ROADMAP_FOLDER = 'roadmap';

let aboutUsCache = null;
let roadmapCache = null;

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

async function fetchRoadmapIndex() {
  const fileContent = await fetchRawText(`${ABOUT_ROOT}/${ABOUT_ROADMAP_FOLDER}/index.md`);
  const { data, body } = parseFrontMatter(fileContent);

  return {
    title: data.title || 'Wigum Gaming Roadmap',
    body,
  };
}

async function fetchRoadmapItem(fileName) {
  const fileContent = await fetchRawText(`${ABOUT_ROOT}/${ABOUT_ROADMAP_FOLDER}/${fileName}`);
  const { data, body } = parseFrontMatter(fileContent);
  const number = Number.parseInt(data.number, 10);

  return {
    slug: fileName.replace(/\.md$/i, ''),
    number: Number.isFinite(number) ? number : 0,
    title: data.title || '',
    body,
  };
}

export async function fetchRoadmap() {
  if (roadmapCache) {
    return roadmapCache;
  }

  roadmapCache = (async () => {
    const roadmapPath = `${ABOUT_ROOT}/${ABOUT_ROADMAP_FOLDER}`;
    const [page, entries] = await Promise.all([
      fetchRoadmapIndex(),
      fetchJson(contentApiUrl(roadmapPath)),
    ]);
    const roadmapEntries = Array.isArray(entries) ? entries : await listStorageDirectory(roadmapPath);

    const items = await Promise.all(
      roadmapEntries
        .filter((entry) => entry.type === 'file' && entry.name.toLowerCase().endsWith('.md') && entry.name !== 'index.md')
        .map((entry) => fetchRoadmapItem(entry.name))
    );

    return {
      page,
      items: items.sort((first, second) => first.number - second.number || first.slug.localeCompare(second.slug)),
    };
  })().catch((error) => {
    roadmapCache = null;
    throw error;
  });

  return roadmapCache;
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
