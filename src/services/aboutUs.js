import { fetchRawJson, listStorageDirectory, rawContentUrl } from './storageApi';

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
  const entries = await listStorageDirectory(`${ABOUT_ROOT}/${ABOUT_MEMBERS_FOLDER}`);

  const members = await Promise.all(
    entries
      .filter((entry) => entry.type === 'file' && entry.name.toLowerCase().endsWith('.json'))
      .sort((first, second) => first.name.localeCompare(second.name))
      .map((entry) => fetchRawJson(`${ABOUT_ROOT}/${ABOUT_MEMBERS_FOLDER}/${entry.name}`))
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
