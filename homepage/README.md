# Wigum Gaming Homepage

React homepage for Wigum Gaming projects.

## Available Scripts

Run these from the `homepage` folder.

### `npm start`

Generates the blog index, then starts the development server at [http://localhost:3000](http://localhost:3000).

### `npm run build`

Generates the blog index, then builds the production site into the `build` folder.

### `npm run generate:blog`

Scans the Markdown blog files and updates `src/generated/blogPosts.js`.

Run this manually after adding or editing blog posts if the dev server is already running.

## Game Blog Structure

Each game can have its own blog folder under `src/content/games`.

```text
src/
  content/
    games/
      singleplayer-roguelite/
        blog/
          2026-05-09-first-devlog.md
          2026-05-12-combat-update.md
      multiplayer-arena/
        blog/
          2026-05-10-networking-test.md
```

The folder name must match the game `slug` in `src/App.js`.

Examples:

```js
slug: 'singleplayer-roguelite'
```

Needs this folder:

```text
src/content/games/singleplayer-roguelite/blog/
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

1. Go to the game blog folder, for example `src/content/games/singleplayer-roguelite/blog/`.
2. Create a new Markdown file named like `2026-05-09-first-devlog.md`.
3. Add `title`, `date`, and optional `excerpt` front matter.
4. Write the post content below the front matter.
5. Run `npm run generate:blog` if the dev server is already running.

`npm start` and `npm run build` run `npm run generate:blog` automatically before starting/building.
