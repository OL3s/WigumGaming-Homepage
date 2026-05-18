# Wigum Gaming Homepage

React homepage for Wigum Gaming projects.

## Available Scripts

Run these from the `homepage` folder.

### `npm start`

Starts the development server at [http://localhost:3000](http://localhost:3000).

### `npm run build`

Builds the production site into the `build` folder.

## Game Blog Structure

Blog posts are stored outside this app in the separate GitHub repository `OL3s/Blogg-Storage`.

Local blog repository path:

```text
~/Documents/Code/Homepage/Blogg-Storage
```

If that folder is missing on a new machine, clone it with:

```sh
git clone git@github.com:OL3s/Blogg-Storage.git ~/Documents/Code/Homepage/Blogg-Storage
```

The blog repository has its own README with the full content workflow:

```text
~/Documents/Code/Homepage/Blogg-Storage/README.md
```

The site fetches Markdown files from this remote folder structure:

```text
games/
  singleplayer-roguelite/
    blog/
      2026-05-09-first-devlog.md
      2026-05-12-combat-update.md
  multiplayer-arena/
    blog/
      2026-05-10-networking-test.md
```

The folder name is the game slug used by routes like `/games/<slug>`.

Examples:

```js
slug: 'singleplayer-roguelite'
```

Needs this folder:

```text
games/singleplayer-roguelite/blog/
```

If the folder is missing, or if there are no `.md` files inside it, the game page displays:

```text
Blog: No blog found
```

## Blog Post Naming

Name files with this format:

```text
YYYY-MM-DD-short-title.md
```

Examples:

```text
2026-05-09-first-devlog.md
2026-05-12-combat-update.md
2026-06-01-new-map-test.md
```

Use the date first so files are easy to read in the folder. The site sorts posts newest first using the `date` field in the Markdown front matter. If `date` is missing, it falls back to the date at the start of the file name.

## Blog Post Format

Each blog post is a Markdown file with front matter at the top.

```md
---
title: First Devlog
date: 2026-05-09
excerpt: Short summary shown above the post.
---

Write the blog post content here.

Markdown works here, including headings, lists, links, images, and code blocks.
```

Required fields:

- `title`
- `date`

Optional fields:

- `excerpt`

If `title` is missing, the title is generated from the file name. If `date` is missing, the date is generated from the file name if it starts with `YYYY-MM-DD`.

## Adding A Blog Post

1. Open `~/Documents/Code/Homepage/Blogg-Storage`.
2. If the folder is missing, clone it with `git clone git@github.com:OL3s/Blogg-Storage.git ~/Documents/Code/Homepage/Blogg-Storage`.
3. Read `~/Documents/Code/Homepage/Blogg-Storage/README.md` for the detailed blog workflow.
4. Go to the game blog folder, for example `games/singleplayer-roguelite/blog/`.
5. Create a new Markdown file named like `2026-05-09-first-devlog.md`.
6. Add `title`, `date`, and optional `excerpt` front matter.
7. Write the post content below the front matter.
8. Commit and push the Markdown file to the `main` branch of `OL3s/Blogg-Storage`.

## AI Agent Blog Instructions

When asked to add or edit a blog post, do not add Markdown files to this homepage repository. Blog Markdown files live in the separate repository cloned at:

```text
~/Documents/Code/Homepage/Blogg-Storage
```

Agent workflow:

1. Read this README first.
2. Check if `~/Documents/Code/Homepage/Blogg-Storage` exists.
3. If it is missing, clone it with `git clone git@github.com:OL3s/Blogg-Storage.git ~/Documents/Code/Homepage/Blogg-Storage`.
4. Open `~/Documents/Code/Homepage/Blogg-Storage`.
5. Read `~/Documents/Code/Homepage/Blogg-Storage/README.md` for the blog storage rules.
6. Check the target game slug in this homepage app at `src/App.js` if the user does not specify it.
7. Use this folder pattern inside `Blogg-Storage`: `games/<game-slug>/blog/`.
8. Create the folder if it does not exist.
9. Create one Markdown file per post using `YYYY-MM-DD-short-title.md`.
10. Add front matter with `title`, `date`, and optional `excerpt`.
11. Write the post body in Markdown below the front matter.
12. Keep filenames lowercase, hyphen-separated, and ASCII.
13. Commit and push changes from the `Blogg-Storage` repository only if the user asks for a commit or push.

Example path for a new MultiplayerArena post:

```text
~/Documents/Code/Homepage/Blogg-Storage/games/multiplayer-arena/blog/2026-05-10-networking-test.md
```

Example post:

```md
---
title: Networking Test
date: 2026-05-10
excerpt: Short summary shown on the website before the full post is opened.
---

Write the blog update here.
```

After pushing to `OL3s/Blogg-Storage`, the website fetches the new post at runtime. No rebuild of this homepage repository is required just to publish blog text.

## Existing Blog Storage Repository

Remote repository:

```sh
git@github.com:OL3s/Blogg-Storage.git
```

Clone it on a new machine with:

```sh
git clone git@github.com:OL3s/Blogg-Storage.git ~/Documents/Code/Homepage/Blogg-Storage
```

This app reads from `https://api.github.com/repos/OL3s/Blogg-Storage/contents/games/<game-slug>/blog?ref=main` at runtime.

The blog storage repository must be public for this static frontend to fetch it without a GitHub token.

## Language System

Language-related code is intentionally centralized in one file:

```text
src/services/i18n.js
```

This file owns:

- The default language.
- Supported language codes, labels, and flag icons.
- The `localStorage` key used for language preference.
- All UI strings used directly by the React app.
- The `createTranslator(language)` helper used as `t('stringKey')` in components.

Current supported languages:

```text
en = English/default
no = Norwegian
```

Language selection behavior:

- The flag buttons in `SiteHeader` call `onLanguageChange` from `App`.
- The selected language is saved to `localStorage` using `I18N.storageKey`.
- A URL query parameter can set the initial language, for example `/about?lang=no`.
- Unknown language codes fall back to `I18N.defaultLanguage`.

When adding or editing hardcoded UI text, do not put visitor-facing strings directly in components. Add a key under `I18N.strings.en`, add the same key for every supported language, then use `t('keyName')` in the component.

Example:

```js
// src/services/i18n.js
I18N.strings.en.exampleKey = 'English text';
I18N.strings.no.exampleKey = 'Norwegian text';

// Component
const label = t('exampleKey');
```

The translator falls back to English if a translated key is missing, but missing keys should still be treated as incomplete work.

## Localized Content Files

The homepage supports language selection for essential content fetched from `BloggStorage`: game metadata pages, about-us content, team members, and roadmap entries.

English is the default language and uses unsuffixed Markdown filenames:

```text
games/multiplayer-arena/index.md
about-us/index.md
about-us/members/ole-kristian-wigum.md
```

Translations add a language suffix before `.md`:

```text
games/multiplayer-arena/index.no.md
about-us/index.no.md
about-us/members/ole-kristian-wigum.no.md
```

The app checks for the selected language first, then falls back to the default `.md` file. Blog posts are currently not localized.

Fallback examples:

```text
games/multiplayer-arena/index.no.md -> games/multiplayer-arena/index.md
about-us/index.no.md -> about-us/index.md
about-us/members/ole-kristian-wigum.no.md -> about-us/members/ole-kristian-wigum.md
about-us/roadmap/001-mob-gladiator.no.md -> about-us/roadmap/001-mob-gladiator.md
```

Important implementation files:

- `src/services/i18n.js`: languages, flags, UI strings, language persistence.
- `src/services/localizedContent.js`: selected-language filename lookup and default `.md` fallback.
- `src/services/games.js`: localized game metadata loading.
- `src/services/aboutUs.js`: localized about/member/roadmap loading.
- `src/components/SiteHeader.js`: language flag buttons.

Blog posts are intentionally not localized yet. Keep blog post files unsuffixed, for example `2026-05-10-player-items-and-damage-visuals.md`.

## Adding A New Language

1. Pick one short language code and use it everywhere. Current convention uses `no` for Norwegian.
2. Add the language to `I18N.languages` in `src/services/i18n.js` with `code`, `label`, and `flag`.
3. Add a full string dictionary under `I18N.strings.<code>` in `src/services/i18n.js`.
4. Add localized content files in `BloggStorage` for essential content using `.<code>.md` before `.md`.
5. Do not rename default English files. English/default remains the unsuffixed `.md` file.
6. Run `npm test -- --watchAll=false` and `npm run build` from this repository.

Required content locations for a new language:

```text
games/<game-slug>/index.<code>.md
about-us/index.<code>.md
about-us/members/<member-slug>.<code>.md
about-us/roadmap/index.<code>.md
about-us/roadmap/<roadmap-item>.<code>.md
```

Optional content locations:

```text
More game folders can be translated one by one. Missing translated files fall back to default English .md files.
```

Agent checklist for language changes:

1. Read `src/services/i18n.js` first.
2. Keep all UI strings in `I18N.strings`; do not scatter hardcoded labels through components.
3. Keep content translations in `BloggStorage`, not this homepage repository.
4. Use unsuffixed `.md` for English/default and `.<code>.md` for translations.
5. Do not localize blog post filenames unless the blog localization system is explicitly implemented later.
6. Verify with tests and build.

Optional environment variables:

- `REACT_APP_BLOG_STORAGE_REPO`: GitHub repo, default `OL3s/Blogg-Storage`.
- `REACT_APP_BLOG_STORAGE_BRANCH`: Git branch, default `main`.
- `REACT_APP_BLOG_STORAGE_ROOT`: Root content folder, default `games`. Set it to an empty string if game folders live at the repository root.
