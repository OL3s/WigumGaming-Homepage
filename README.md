# Wigum Gaming

A static studio homepage featuring *Elements: Conquora* and *Dungeon Divers*. English lives at
`public/index.html`, Norwegian Bokmål at `public/no/index.html`. Both use
`public/studio.css`.

## Preview

From this directory:

```sh
python3 -m http.server 3000 --bind 127.0.0.1 --directory public
```

Visit <http://localhost:3000/> or <http://localhost:3000/no/>.

## Publish

Netlify publishes [wigumgaming.no](https://wigumgaming.no/) from `main`.
`netlify.toml` checks that both language pages exist and publishes `public/`
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

Use [the entry template](templates/game-entry.html) when adding a game. The
[catalog guide](AGENTS.md) defines stages, platform availability, controls and
estimated hardware demand.
