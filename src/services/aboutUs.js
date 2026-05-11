import { fetchRawJson, fetchSiteIndex, rawContentUrl } from './storageApi';

const ABOUT_ROOT = 'about-us';
const ABOUT_IMAGE_FOLDER = 'image';
const ABOUT_MEMBERS_FOLDER = 'members';

let aboutUsCache = null;

function normalizeImageFileName(image) {
  if (!image) {
    return '';
  }

  return image.replace(/^\.\.\//, '').replace(/^image\//, '').replace(/^\/+/, '');
}

async function fetchAboutIndex() {
  return fetchRawJson(`${ABOUT_ROOT}/index.json`);
}

async function fetchMembers() {
  const siteIndex = await fetchSiteIndex();
  const memberFiles = siteIndex.aboutUs?.members || [];

  if (!Array.isArray(memberFiles)) {
    return [];
  }

  const members = await Promise.all(
    memberFiles
      .filter((fileName) => fileName.toLowerCase().endsWith('.json'))
      .sort((first, second) => first.localeCompare(second))
      .map((fileName) => fetchRawJson(`${ABOUT_ROOT}/${ABOUT_MEMBERS_FOLDER}/${fileName}`))
  );

  return members.map((member) => {
    const imageFileName = normalizeImageFileName(member.image);

    return {
      ...member,
      imageSrc: imageFileName ? rawContentUrl(`${ABOUT_ROOT}/${ABOUT_IMAGE_FOLDER}/${imageFileName}`) : '',
    };
  });
}

export async function fetchAboutUs() {
  if (aboutUsCache) {
    return aboutUsCache;
  }

  aboutUsCache = (async () => {
    const [page, members] = await Promise.all([fetchAboutIndex(), fetchMembers()]);
    return { page, members };
  })();

  return aboutUsCache;
}
