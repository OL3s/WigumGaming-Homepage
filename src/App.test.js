import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';

const gameFolders = [
  { type: 'dir', name: 'singleplayer-roguelite' },
  { type: 'dir', name: 'multiplayer-arena' },
];

function mockGitHubContentsApi() {
  global.fetch = jest.fn((url) => {
    if (url === 'https://raw.githubusercontent.com/OL3s/Blogg-Storage/main/site-index.json') {
      return Promise.resolve({
        ok: true,
        text: () => Promise.resolve(JSON.stringify({
          games: [
            {
              slug: 'singleplayer-roguelite',
              images: { landscape: 'index-landscape.svg', portrait: 'index-portrait.svg' },
              blogFiles: [],
            },
            {
              slug: 'multiplayer-arena',
              images: { landscape: 'index-landscape.svg', portrait: 'index-portrait.svg' },
              blogFiles: [],
            },
          ],
          aboutUs: { members: ['ole-kristian-wigum.json'] },
        })),
      });
    }

    if (url === 'https://raw.githubusercontent.com/OL3s/Blogg-Storage/main/games/singleplayer-roguelite/index.json') {
      return Promise.resolve({
        ok: true,
        text: () => Promise.resolve(JSON.stringify({ name: 'SingleplayerRoguelite' })),
      });
    }

    if (url === 'https://raw.githubusercontent.com/OL3s/Blogg-Storage/main/games/multiplayer-arena/index.json') {
      return Promise.resolve({
        ok: true,
        text: () => Promise.resolve(JSON.stringify({
          name: 'MultiplayerArena',
          mainDescription: 'A fast 2D arena fighter where movement, aim, and destructible maps shape every round.',
          secondaryDescription: 'MultiplayerArena is built around short, tense PvP matches.',
        })),
      });
    }

    if (url === 'https://raw.githubusercontent.com/OL3s/Blogg-Storage/main/about-us/index.json') {
      return Promise.resolve({
        ok: true,
        text: () => Promise.resolve(JSON.stringify({
          title: 'About Us.',
          lead: 'Wigum Gaming is loaded from storage.',
          releaseNote: 'Release note loaded from storage.',
        })),
      });
    }

    if (url === 'https://raw.githubusercontent.com/OL3s/Blogg-Storage/main/about-us/members/ole-kristian-wigum.json') {
      return Promise.resolve({
        ok: true,
        text: () => Promise.resolve(JSON.stringify({
          name: 'Ole Kristian Wigum',
          role: 'Founder and coder',
          image: 'placeholder-member.svg',
          paragraphs: ['Member text loaded from storage.'],
        })),
      });
    }

    if (url.includes('/contents/games?')) {
      return Promise.resolve({ ok: true, json: () => Promise.resolve(gameFolders) });
    }

    if (url.includes('/contents/games/singleplayer-roguelite?')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve([
          { type: 'file', name: 'index.json', download_url: 'https://example.com/singleplayer-index.json' },
        ]),
      });
    }

    if (url.includes('/contents/games/multiplayer-arena?')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve([
          { type: 'file', name: 'index.json', download_url: 'https://example.com/multiplayer-index.json' },
        ]),
      });
    }

    if (url === 'https://example.com/singleplayer-index.json') {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ name: 'SingleplayerRoguelite' }),
      });
    }

    if (url === 'https://example.com/multiplayer-index.json') {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          name: 'MultiplayerArena',
          mainDescription: 'A fast 2D arena fighter where movement, aim, and destructible maps shape every round.',
          secondaryDescription: 'MultiplayerArena is built around short, tense PvP matches.',
        }),
      });
    }

    if (url.includes('/contents/games/singleplayer-roguelite/image?')) {
      return Promise.resolve({ status: 404, ok: false, json: () => Promise.resolve(null) });
    }

    if (url.includes('/contents/games/multiplayer-arena/image?')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve([
          {
            type: 'file',
            name: 'index-landscape.svg',
            download_url: 'https://example.com/multiplayer-landscape.svg',
          },
          {
            type: 'file',
            name: 'index-portrait.svg',
            download_url: 'https://example.com/multiplayer-portrait.svg',
          },
        ]),
      });
    }

    if (url.includes('/contents/games/multiplayer-arena/blog?') || url.includes('/contents/games/singleplayer-roguelite/blog?')) {
      return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
    }

    if (url.includes('/contents/about-us/index.json?')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ download_url: 'https://example.com/about-index.json' }),
      });
    }

    if (url === 'https://example.com/about-index.json') {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          title: 'About Us.',
          lead: 'Wigum Gaming is loaded from storage.',
          releaseNote: 'Release note loaded from storage.',
        }),
      });
    }

    if (url.includes('/contents/about-us/members?')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve([
          {
            type: 'file',
            name: 'ole-kristian-wigum.json',
            download_url: 'https://example.com/ole-kristian-wigum.json',
          },
        ]),
      });
    }

    if (url === 'https://example.com/ole-kristian-wigum.json') {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          name: 'Ole Kristian Wigum',
          role: 'Founder and coder',
          image: 'placeholder-member.svg',
          paragraphs: ['Member text loaded from storage.'],
        }),
      });
    }

    if (url.includes('/contents/about-us/image/placeholder-member.svg?')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ download_url: 'https://example.com/placeholder-member.svg' }),
      });
    }

    return Promise.reject(new Error(`Unhandled fetch: ${url}`));
  });
}

beforeEach(() => {
  mockGitHubContentsApi();
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
