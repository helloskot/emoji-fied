# emoji·fied

Turn your camera into live emoji or unicode art, right in the browser.
No build step, no dependencies, and no video ever leaves your device.

## Styles

- **Emoji**: Everything, Rainbow, Faces, Food, Nature, Animals, Hearts.
  Each camera cell is replaced by the emoji whose average color is closest
  (or whose brightness matches, under *Match by → Brightness*).
- **Unicode**: ASCII, detailed ASCII, Blocks `░▒▓█`, Shapes `·○◎●`,
  Stars `✧✦★`, Math `∴∷≡⊠`, Katakana (Matrix style) and Braille `⠿`
  (2×4 dots per character with ordered dithering). Ink can be full color
  or a single tint.
- **Custom**: type any characters. If they contain emoji they're color-matched;
  otherwise they're used as a brightness ramp (automatically sorted by how
  much ink each glyph uses, so order doesn't matter).

Extras: 🎲 randomize (`D`: random style, ink, detail and tone, sometimes a
random custom emoji set), detail slider, adjustments (contrast, brightness,
saturation, shadows, highlights, with reset), invert, mirror, front/back camera
flip, pause (`Space`), PNG snapshot (`S`), **video clips** (`R`, up to 60 s;
MP4 on Safari, with Save/Share to Photos on iPhone) and **Copy text** to paste
the frame as plain emoji/unicode text.

## Run it

Camera access requires `https://` or `localhost`:

```sh
python3 -m http.server 8000
# open http://localhost:8000
```

To use it on your phone, open the GitHub Pages site:
**https://helloskot.github.io/emoji-fied/**

(Pages is served straight from the root of `main`: *Settings → Pages →
Source: Deploy from a branch → `main` / `(root)`*. `.nojekyll` makes Pages
serve the files as-is.)

## How it works

1. The video is downsampled onto a tiny canvas: one pixel per character cell.
2. Every glyph in the chosen set is pre-rendered once into a sprite atlas and
   measured for average color and ink density.
3. Each frame, every cell picks a glyph (nearest color via a cached 15-bit RGB
   lookup table, or brightness rank) and is blitted from the atlas.
4. Unicode modes draw white glyphs to a mask layer and tint the whole layer in
   one composite step, so full-color text costs about the same as mono.
