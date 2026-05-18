import { DEFAULT_LANGUAGE, normalizeLanguage } from './i18n';
import { fetchRawText, listStorageDirectory } from './storageApi';

function splitPath(path) {
  const pathParts = path.split('/').filter(Boolean);
  const fileName = pathParts.pop() || '';
  return { directoryPath: pathParts.join('/'), fileName };
}

function localizedFileName(fileName, language) {
  if (language === DEFAULT_LANGUAGE) {
    return fileName;
  }

  return fileName.replace(/(\.[^.]+)$/, `.${language}$1`);
}

function localizedCandidatePaths(path, language) {
  const selectedLanguage = normalizeLanguage(language);
  const { directoryPath, fileName } = splitPath(path);
  const candidates = [localizedFileName(fileName, selectedLanguage), fileName]
    .filter((candidate, index, entries) => entries.indexOf(candidate) === index);

  return candidates.map((candidate) => (directoryPath ? `${directoryPath}/${candidate}` : candidate));
}

export async function resolveLocalizedFile(path, language) {
  const selectedLanguage = normalizeLanguage(language);
  const { directoryPath, fileName } = splitPath(path);
  const entries = await listStorageDirectory(directoryPath);
  const fileNames = new Set(entries.filter((entry) => entry.type === 'file').map((entry) => entry.name));
  const candidates = [localizedFileName(fileName, selectedLanguage), fileName];
  const match = candidates.find((candidate) => fileNames.has(candidate));

  if (!match) {
    return path;
  }

  return directoryPath ? `${directoryPath}/${match}` : match;
}

export async function fetchLocalizedRawText(path, language) {
  const resolvedPath = await resolveLocalizedFile(path, language);
  const candidatePaths = [
    ...localizedCandidatePaths(path, language),
    resolvedPath,
  ].filter((candidate, index, entries) => entries.indexOf(candidate) === index);
  let lastError = null;

  for (const candidatePath of candidatePaths) {
    try {
      return await fetchRawText(candidatePath);
    } catch (error) {
      lastError = error;

      if (error.status && error.status !== 404) {
        throw error;
      }
    }
  }

  throw lastError || new Error(`No localized file found for ${path}`);
}
