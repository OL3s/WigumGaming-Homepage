# Wigum Gaming

A static studio homepage featuring *Elements: Conquora*, *Dungeon Divers*, and *Cave Divers*. English lives at
`public/index.html`, Norwegian Bokmål at `public/no/index.html`. The homepages
feature one game at a time; the full lists live at `/games/` and `/no/games/`.
The illustrated studio story lives at `/about/` and `/no/about/`, with shared artwork in `public/art/`.
All pages use `public/studio.css`. The homepage dots in `public/showcase.js`
follow the native swipeable track; the catalog works without JavaScript.

## Preview

From this directory:

```sh
python3 -m http.server 3000 --bind 127.0.0.1 --directory public
```

Visit <http://localhost:3000/> or <http://localhost:3000/no/>.

## Publish

Netlify publishes [wigumgaming.no](https://wigumgaming.no/) from `main`.
`netlify.toml` checks that both homepages, catalogs and About pages exist and publishes `public/`
directly. No install or compilation is needed. Check the
[production deploys](https://app.netlify.com/projects/wigumgaming/deploys)
to see which commit is live.

## Edit

Update the two HTML files together. `public/art/nightfall.svg` is the studio
landscape. The three WebP cards alongside it come from `docs/assets/` in the
Conquora project (`monster-back.webp`, `meadow.webp`, and `flame.webp`).
The projects publish their own [Conquora](https://ol3s.github.io/CardControlProject/)
and [Dungeon Divers](https://ol3s.github.io/DungeonDivers/) sites. The studio
catalog uses a local combat capture from Dungeon Divers' Plains dungeon.
The Cave Divers image is an in-engine capture of Verdant from the project's cave
generator (seed `734921`, High preset), lit for the shot with an off-camera
flashlight and volumetric fog.

Use [the entry template](templates/game-entry.html) when adding a game. The
[catalog guide](AGENTS.md) defines stages, platform availability, controls and
estimated hardware demand.
