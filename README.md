# Wigum Gaming Homepage

React homepage for Wigum Gaming projects.

This project is deployed with Netlify.

Live site: `https://wigumgaming.netlify.app/`

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

The folder name must match the game `slug` in `src/App.js`.

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

Optional environment variables:

- `REACT_APP_BLOG_STORAGE_REPO`: GitHub repo, default `OL3s/Blogg-Storage`.
- `REACT_APP_BLOG_STORAGE_BRANCH`: Git branch, default `main`.
- `REACT_APP_BLOG_STORAGE_ROOT`: Root content folder, default `games`. Set it to an empty string if game folders live at the repository root.
