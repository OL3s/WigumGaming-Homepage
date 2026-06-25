import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';

const routerFutureFlags = { v7_startTransition: true, v7_relativeSplatPath: true };

const storageFiles = {
  'games/upcoming/singleplayer-roguelite/index.md': `---
name: SingleplayerRoguelite
---
`,
  'games/upcoming/multiplayer-arena/index.md': `---
name: MultiplayerArena
teaser: Shared short arena teaser.
---

MultiplayerArena is built around short, tense PvP matches where destructible maps shape every round.
`,
  'games/upcoming/multiplayer-arena/index.no.md': `---
name: FlerspillerArena
teaser: Kort norsk arenatekst.
---

En lengre norsk arenaopplevelse.
`,
  'about-us/index.md': `---
title: About Us.
releaseNote: Release note loaded from storage.
---

Wigum Gaming is **loaded** from storage.

## New section loaded from storage.
`,
  'about-us/members/ole-kristian-wigum.md': `---
name: Ole Kristian Wigum
role: Founder and coder
image: placeholder-member.svg
---

Member text **loaded** from storage.
`,
  'roadmap/index.md': `---
title: Roadmap
---

A simple company-level roadmap loaded from storage.
`,
  'roadmap/001-first-step.md': `---
number: 1
title: First roadmap step.
---

Roadmap item text loaded from storage.
`,
};

function file(name) {
  return { type: 'file', name };
}

function directory(name, files) {
  return { type: 'directory', name, files };
}

function gameDirectory(slug) {
  return directory(slug, [
    file('index.md'),
    ...(slug === 'multiplayer-arena' ? [file('index.no.md')] : []),
    directory('image', [file('index-landscape.svg'), file('index-portrait.svg')]),
    directory('blog', []),
  ]);
}

function storageTree() {
  return {
    files: [
      directory('games', [
        directory('finished', []),
        directory('upcoming', [gameDirectory('singleplayer-roguelite'), gameDirectory('multiplayer-arena')]),
        directory('planned', []),
      ]),
      directory('about-us', [
        file('index.md'),
        directory('image', [file('placeholder-member.svg')]),
        directory('members', [file('ole-kristian-wigum.md')]),
      ]),
      directory('roadmap', [file('index.md'), file('001-first-step.md')]),
    ],
  };
}

function mockStorageFetch() {
  global.fetch = jest.fn((url) => {
    if (url === 'https://api.github.com/repos/OL3s/Blogg-Storage/contents/about-us/members?ref=main') {
      return Promise.resolve({ ok: true, json: () => Promise.resolve([file('ole-kristian-wigum.md')]) });
    }

    if (url === 'https://api.github.com/repos/OL3s/Blogg-Storage/contents/roadmap?ref=main') {
      return Promise.resolve({ ok: true, json: () => Promise.resolve([file('index.md'), file('001-first-step.md')]) });
    }

    if (url === 'https://data.jsdelivr.com/v1/package/gh/OL3s/Blogg-Storage@main') {
      return Promise.resolve({ ok: true, json: () => Promise.resolve(storageTree()) });
    }

    const storagePath = url.replace('https://raw.githubusercontent.com/OL3s/Blogg-Storage/main/', '');

    if (storageFiles[storagePath]) {
      const body = typeof storageFiles[storagePath] === 'string'
        ? storageFiles[storagePath]
        : JSON.stringify(storageFiles[storagePath]);

      return Promise.resolve({ ok: true, text: () => Promise.resolve(body) });
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

test('renders homepage navigation and section links', async () => {
  render(
    <MemoryRouter initialEntries={['/']} future={routerFutureFlags}>
      <App />
    </MemoryRouter>
  );

  expect(screen.getByRole('link', { name: /home/i })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: /cross-platform games built to scale/i })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: /optimized 3d and 2d that run broadly/i })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: /flexible controls across devices/i })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: /exponential difficulty curves/i })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: /teamplay should feel rewarded/i })).toBeInTheDocument();
  expect(screen.getByRole('img', { name: /low-poly and sprite-based game art placeholder/i })).toBeInTheDocument();
  expect(screen.getByRole('img', { name: /tv connected to three landscape phones as controllers placeholder/i })).toBeInTheDocument();
  expect(screen.getByRole('img', { name: /exponential difficulty curve placeholder/i })).toBeInTheDocument();
  expect(screen.getByRole('img', { name: /players joining together without a steep difficulty spike placeholder/i })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: /games browse the current game projects/i })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: /tools open practical production references/i })).toBeInTheDocument();
  expect(await screen.findByText('Roadmap')).toBeInTheDocument();
  expect(await screen.findByRole('heading', { name: 'First roadmap step.' })).toBeInTheDocument();
  expect(await screen.findByRole('link', { name: 'SingleplayerRoguelite' })).toBeInTheDocument();
});

test('renders loaded games page links', async () => {
  render(
    <MemoryRouter initialEntries={['/games']} future={routerFutureFlags}>
      <App />
    </MemoryRouter>
  );

  expect(await screen.findByRole('link', { name: 'SingleplayerRoguelite' })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'MultiplayerArena' })).toBeInTheDocument();
  expect(screen.getAllByRole('link', { name: /view game page/i })).toHaveLength(2);
  expect(screen.getAllByRole('link', { name: /about us/i })).toHaveLength(2);
});

test('renders tools page with blender sheet', async () => {
  render(
    <MemoryRouter initialEntries={['/tools']} future={routerFutureFlags}>
      <App />
    </MemoryRouter>
  );

  expect(screen.getByRole('heading', { name: /production tools/i })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: 'Godot Engine' })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: '.NET SDK' })).toBeInTheDocument();
  expect(screen.queryByRole('heading', { name: 'GitHub' })).not.toBeInTheDocument();
  expect(screen.getByRole('heading', { name: 'GitHub CLI' })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: 'Aseprite' })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: 'Roblox Studio' })).toBeInTheDocument();
  expect(screen.getByText('sudo apt install dotnet-sdk-8.0')).toBeInTheDocument();
  expect(screen.getAllByRole('link', { name: /^download$/i })).toHaveLength(10);
  expect(screen.getByRole('link', { name: /steam page/i })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: /preview/i })).toHaveAttribute('href', '/sheet-blender.svg');
  expect(screen.getByRole('img', { name: /blender keyboard shortcut reference sheet/i })).toHaveAttribute('src', '/sheet-blender.svg');
  expect(await screen.findByRole('link', { name: 'SingleplayerRoguelite' })).toBeInTheDocument();
});

test('renders a game page from its route', async () => {
  render(
    <MemoryRouter initialEntries={['/games/multiplayer-arena']} future={routerFutureFlags}>
      <App />
    </MemoryRouter>
  );

  expect(await screen.findByRole('heading', { name: 'MultiplayerArena' })).toBeInTheDocument();
  expect(screen.getByText(/shared short arena teaser/i)).toBeInTheDocument();
  expect(screen.getByText(/destructible maps shape every round/i)).toBeInTheDocument();
  expect(await screen.findByText(/blog: no blog found/i)).toBeInTheDocument();
});

test('renders localized game metadata when available', async () => {
  render(
    <MemoryRouter initialEntries={['/games/multiplayer-arena?lang=no']} future={routerFutureFlags}>
      <App />
    </MemoryRouter>
  );

  expect(await screen.findByRole('heading', { name: 'FlerspillerArena' })).toBeInTheDocument();
  expect(screen.getByText(/kort norsk arenatekst/i)).toBeInTheDocument();
  expect(screen.getByText(/lengre norsk arenaopplevelse/i)).toBeInTheDocument();
});

test('renders games overview route', async () => {
  render(
    <MemoryRouter initialEntries={['/games']} future={routerFutureFlags}>
      <App />
    </MemoryRouter>
  );

  expect(screen.getByText(/upcoming games/i)).toBeInTheDocument();
  expect(screen.getByText(/finished games/i)).toBeInTheDocument();
  expect(screen.getByText(/game ideas/i)).toBeInTheDocument();
  expect(await screen.findByText(/no finished games yet/i)).toBeInTheDocument();
  expect(await screen.findByText(/no planned game ideas listed yet/i)).toBeInTheDocument();
  expect(await screen.findByRole('link', { name: 'MultiplayerArena' })).toBeInTheDocument();
  expect(screen.getAllByRole('link', { name: /view game page/i })).toHaveLength(2);
});

test('shows GitHub about page fetch errors', async () => {
  const defaultFetch = global.fetch.getMockImplementation();
  jest.spyOn(console, 'error').mockImplementation(() => {});

  global.fetch.mockImplementation((url) => {
    if (url === 'https://raw.githubusercontent.com/OL3s/Blogg-Storage/main/about-us/index.md') {
      return Promise.resolve({ ok: false, status: 403, statusText: 'Forbidden' });
    }

    return defaultFetch(url);
  });

  render(
    <MemoryRouter initialEntries={['/about']} future={routerFutureFlags}>
      <App />
    </MemoryRouter>
  );

  expect(await screen.findAllByText(/GitHub refused the about-us content request/)).toHaveLength(2);
});

test('renders about page from storage content', async () => {
  render(
    <MemoryRouter initialEntries={['/about']} future={routerFutureFlags}>
      <App />
    </MemoryRouter>
  );

  expect(await screen.findByText(/Wigum Gaming is/)).toBeInTheDocument();
  expect(screen.getAllByText('loaded')).toHaveLength(2);
  expect(screen.getByRole('heading', { name: 'New section loaded from storage.' })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: 'Blender' })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: 'Inkscape' })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: 'Aseprite' })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: '.NET SDK' })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: 'Git' })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: 'GitHub CLI' })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: 'VS Code' })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: 'Roblox' })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: 'Ole Kristian Wigum' })).toBeInTheDocument();
  expect(screen.getByText(/Member text/)).toBeInTheDocument();
});
