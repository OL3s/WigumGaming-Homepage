import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';

const storageFiles = {
  'games/singleplayer-roguelite/index.json': { name: 'SingleplayerRoguelite' },
  'games/multiplayer-arena/index.json': {
    name: 'MultiplayerArena',
    mainDescription: 'A fast 2D arena fighter where movement, aim, and destructible maps shape every round.',
    secondaryDescription: 'MultiplayerArena is built around short, tense PvP matches.',
  },
  'about-us/index.json': {
    title: 'About Us.',
    lead: 'Wigum Gaming is loaded from storage.',
    releaseNote: 'Release note loaded from storage.',
  },
  'about-us/members/ole-kristian-wigum.json': {
    name: 'Ole Kristian Wigum',
    role: 'Founder and coder',
    image: 'placeholder-member.svg',
    paragraphs: ['Member text loaded from storage.'],
  },
};

function file(name) {
  return { type: 'file', name };
}

function directory(name, files) {
  return { type: 'directory', name, files };
}

function gameDirectory(slug) {
  return directory(slug, [
    file('index.json'),
    directory('image', [file('index-landscape.svg'), file('index-portrait.svg')]),
    directory('blog', []),
  ]);
}

function storageTree() {
  return {
    files: [
      directory('games', [gameDirectory('singleplayer-roguelite'), gameDirectory('multiplayer-arena')]),
      directory('about-us', [
        file('index.json'),
        directory('image', [file('placeholder-member.svg')]),
        directory('members', [file('ole-kristian-wigum.json')]),
      ]),
    ],
  };
}

function mockStorageFetch() {
  global.fetch = jest.fn((url) => {
    if (url === 'https://data.jsdelivr.com/v1/package/gh/OL3s/Blogg-Storage@main') {
      return Promise.resolve({ ok: true, json: () => Promise.resolve(storageTree()) });
    }

    const storagePath = url.replace('https://raw.githubusercontent.com/OL3s/Blogg-Storage/main/', '');

    if (storageFiles[storagePath]) {
      return Promise.resolve({ ok: true, text: () => Promise.resolve(JSON.stringify(storageFiles[storagePath])) });
    }

    return Promise.reject(new Error(`Unhandled fetch: ${url}`));
  });
}

beforeEach(() => {
  mockStorageFetch();
  window.scrollTo = jest.fn();
});

afterEach(() => {
  jest.restoreAllMocks();
});

test('renders homepage navigation and game links', async () => {
  render(
    <MemoryRouter initialEntries={['/']}>
      <App />
    </MemoryRouter>
  );

  expect(screen.getByRole('link', { name: /home/i })).toBeInTheDocument();
  expect(screen.getByText(/fetching games/i)).toBeInTheDocument();
  expect(await screen.findByRole('link', { name: 'SingleplayerRoguelite' })).toBeInTheDocument();
});

test('renders loaded homepage game links', async () => {
  render(
    <MemoryRouter initialEntries={['/']}>
      <App />
    </MemoryRouter>
  );

  expect(await screen.findByRole('link', { name: 'SingleplayerRoguelite' })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'MultiplayerArena' })).toBeInTheDocument();
  expect(screen.getAllByRole('link', { name: /view game page/i })).toHaveLength(2);
  expect(screen.getAllByRole('link', { name: /about us/i })).toHaveLength(2);
});

test('renders a game page from its route', async () => {
  render(
    <MemoryRouter initialEntries={['/games/multiplayer-arena']}>
      <App />
    </MemoryRouter>
  );

  expect(await screen.findByRole('heading', { name: 'MultiplayerArena' })).toBeInTheDocument();
  expect(screen.getByText(/destructible maps shape every round/i)).toBeInTheDocument();
  expect(await screen.findByText(/blog: no blog found/i)).toBeInTheDocument();
});

test('renders games overview route', async () => {
  render(
    <MemoryRouter initialEntries={['/games']}>
      <App />
    </MemoryRouter>
  );

  expect(screen.getByRole('heading', { name: /current projects/i })).toBeInTheDocument();
  expect(await screen.findByRole('link', { name: 'MultiplayerArena' })).toBeInTheDocument();
  expect(screen.getAllByRole('link', { name: /view game page/i })).toHaveLength(2);
});

test('renders about page from storage content', async () => {
  render(
    <MemoryRouter initialEntries={['/about']}>
      <App />
    </MemoryRouter>
  );

  expect(await screen.findByText('Wigum Gaming is loaded from storage.')).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: 'Ole Kristian Wigum' })).toBeInTheDocument();
  expect(screen.getByText('Member text loaded from storage.')).toBeInTheDocument();
});
