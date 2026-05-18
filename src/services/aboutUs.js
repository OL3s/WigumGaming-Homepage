import { contentApiUrl, fetchJson, listStorageDirectory, rawContentUrl } from './storageApi';
import { fetchLocalizedRawText } from './localizedContent';
import { parseFrontMatter } from './markdown';

const ABOUT_ROOT = 'about-us';
const ABOUT_IMAGE_FOLDER = 'image';
const ABOUT_MEMBERS_FOLDER = 'members';
const ABOUT_ROADMAP_FOLDER = 'roadmap';

const aboutUsCache = new Map();
const roadmapCache = new Map();

function normalizeImageFileName(image) {
  if (!image) {
    return '';
  }

  return image.replace(/^\.\.\//, '').replace(/^image\//, '').replace(/^\/+/, '');
}

async function fetchAboutIndex(language) {
  const fileContent = await fetchLocalizedRawText(`${ABOUT_ROOT}/index.md`, language);
  const { data, body } = parseFrontMatter(fileContent);

  return {
    title: data.title || 'About Us.',
    releaseNote: data.releaseNote || '',
    body,
  };
}

async function fetchMember(fileName, language) {
  const fileContent = await fetchLocalizedRawText(`${ABOUT_ROOT}/${ABOUT_MEMBERS_FOLDER}/${fileName}`, language);
  const { data, body } = parseFrontMatter(fileContent);
  const imageFileName = normalizeImageFileName(data.image);

  return {
    name: data.name || '',
    role: data.role || '',
    body,
    imageSrc: imageFileName ? rawContentUrl(`${ABOUT_ROOT}/${ABOUT_IMAGE_FOLDER}/${imageFileName}`) : '',
  };
}

function isDefaultMarkdownFile(entry) {
  return entry.type === 'file' && entry.name.toLowerCase().endsWith('.md') && !/\.[a-z]{2}\.md$/i.test(entry.name);
}

async function fetchMembers(language) {
  const membersPath = `${ABOUT_ROOT}/${ABOUT_MEMBERS_FOLDER}`;
  const githubEntries = await fetchJson(contentApiUrl(membersPath));
  const entries = Array.isArray(githubEntries) ? githubEntries : await listStorageDirectory(membersPath);

  return Promise.all(
    entries
      .filter(isDefaultMarkdownFile)
      .sort((first, second) => first.name.localeCompare(second.name))
      .map((entry) => fetchMember(entry.name, language))
  );
}

async function fetchRoadmapIndex(language) {
  const fileContent = await fetchLocalizedRawText(`${ABOUT_ROOT}/${ABOUT_ROADMAP_FOLDER}/index.md`, language);
  const { data, body } = parseFrontMatter(fileContent);

  return {
    title: data.title || 'Wigum Gaming Roadmap',
    body,
  };
}

async function fetchRoadmapItem(fileName, language) {
  const fileContent = await fetchLocalizedRawText(`${ABOUT_ROOT}/${ABOUT_ROADMAP_FOLDER}/${fileName}`, language);
  const { data, body } = parseFrontMatter(fileContent);
  const number = Number.parseInt(data.number, 10);

  return {
    slug: fileName.replace(/\.md$/i, ''),
    number: Number.isFinite(number) ? number : 0,
    title: data.title || '',
    body,
  };
}

export async function fetchRoadmap(language = 'en') {
  if (roadmapCache.has(language)) {
    return roadmapCache.get(language);
  }

  const roadmapPromise = (async () => {
    const roadmapPath = `${ABOUT_ROOT}/${ABOUT_ROADMAP_FOLDER}`;
    const [page, entries] = await Promise.all([
      fetchRoadmapIndex(language),
      fetchJson(contentApiUrl(roadmapPath)),
    ]);
    const roadmapEntries = Array.isArray(entries) ? entries : await listStorageDirectory(roadmapPath);

    const items = await Promise.all(
      roadmapEntries
        .filter((entry) => isDefaultMarkdownFile(entry) && entry.name !== 'index.md')
        .map((entry) => fetchRoadmapItem(entry.name, language))
    );

    return {
      page,
      items: items.sort((first, second) => first.number - second.number || first.slug.localeCompare(second.slug)),
    };
  })().catch((error) => {
    roadmapCache.delete(language);
    throw error;
  });

  roadmapCache.set(language, roadmapPromise);
  return roadmapPromise;
}

export async function fetchAboutUs(language = 'en') {
  if (aboutUsCache.has(language)) {
    return aboutUsCache.get(language);
  }

  const aboutUsPromise = (async () => {
    const [page, members] = await Promise.all([fetchAboutIndex(language), fetchMembers(language)]);
    return { page, members };
  })().catch((error) => {
    aboutUsCache.delete(language);
    throw error;
  });

  aboutUsCache.set(language, aboutUsPromise);
  return aboutUsPromise;
}
