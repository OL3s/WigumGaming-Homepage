# Wigum Gaming

A static studio homepage featuring *Elements: Conquora*. English lives at
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
The game itself is hosted on [its own site](https://ol3s.github.io/CardControlProject/).
