# emoji·fied

Turn your camera into live emoji or unicode art, right in the browser.
No build step, no dependencies, and no video ever leaves your device.

## Sources

- **📷 Camera** (front or back).
- **🎞 Video / GIF**: any video, animated GIF or photo from your Photos or
  Files, looped through the filter. GIFs are decoded by the app itself
  (`gif.js`), so they animate in every browser, including Safari. A video's
  soundtrack plays, drives 🎵 Beat → 🎤 Sound (no microphone needed) and goes
  into recordings.
  Photos and GIFs get **photo effects**: a slow 🎥 pan & zoom, 📱 tilt to move
  (the phone's motion sensor; on a computer the mouse, the arrow keys or 🙂 head
  tracking with the webcam, using MediaPipe's on-device face detector), ✨ twinkle (glyphs shimmer to
  similar ones, with glints), and 🧩 assemble (the picture builds itself from
  scattered glyphs). **🖼 Make poster** renders a sharp, high-detail PNG (4K,
  phone wallpaper or square, up to 400 columns) to save or share.
- **🖥 Screen / tab** (computers only; iPhone Safari can't share the screen):
  play something, a YouTube video for example, in another tab and share that
  tab to filter it live. Tick *Share tab audio* to react to its sound.

YouTube links can't be fed in directly: the player is cross-origin, so browsers
don't let other pages read its frames, and YouTube's terms don't allow ripping
the stream. Sharing the tab gets the same result.

## Styles

- **Emoji**: Everything, Rainbow, Faces, Food, Nature, Animals, Hearts.
- **Skulls 💀**: every cell is a skull, bigger where the picture is brighter,
  tinted with the picture's colours (or one ink colour) while keeping its eyes
  and teeth.
  Each camera cell is replaced by the emoji whose average color is closest
  (or whose brightness matches, under *Match by → Brightness*).
- **Unicode**: ASCII, detailed ASCII, Blocks `░▒▓█`, Shapes `·○◎●`,
  Stars `✧✦★`, Math `∴∷≡⊠`, Katakana (Matrix style) and Braille `⠿`
  (2×4 dots per character with ordered dithering). Ink can be full color
  or a single tint.
- **Custom**: type any characters. If they contain emoji they're color-matched;
  otherwise they're used as a brightness ramp (automatically sorted by how
  much ink each glyph uses, so order doesn't matter).
- **🧱 Tetris** (on the Look tab, or press T; works with any source): the
  picture builds itself from falling Tetris pieces made of its own glyphs.
  They drop onto the stack bottom row first, turning and sliding a cell at a
  time like the game; the finished picture holds for a few seconds, then the
  lines clear and new pieces build it again. With a beat source on (🎵 Beat),
  the beats and notes drop the pieces instead.

## The controls

A toolbar (⏺ Record · 📸 Photo · ⏸ Pause · ⛶ Full · 📺 TV · ⋯ More), the
source, style (🎲 randomizes it) and detail, then four tabs:

- **🎨 Look**: match by colour or brightness (or the ink colour for unicode),
  adjustments (contrast, brightness, saturation, shadows, highlights, with
  reset), mirror, invert, blank darks and **🧱 Tetris build**.
- **🎵 Beat**: what drives the effects, and what a beat does.
  - *Listen to* **🎤 Sound** (the microphone, or a video's or shared tab's own
    audio, with a sensitivity slider), **🎹 MIDI** (Chrome, Edge or Firefox on
    a computer: every note hits like a beat as hard as it was played, its pitch
    nudges the hues, held notes swell, pitch bend shifts the hues, the mod
    wheel adds swell) and/or **🥁 Tempo** (tap `K`, or MIDI clock from
    Ableton, Traktor or a drum machine, which wins while it runs, follows
    Start/Stop and is timed by the messages' own time stamps; the tempo's beat
    replaces the microphone's).
  - *On the beat*, the same for every source: **Pulse** (glyphs swell with
    the loudness or held notes), **Flash** (flash, shake, zoom punch, hue
    shift), **Tetris drops** (a beat drops a batch of pieces, building a
    picture in 8 bars; a played note drops them where its pitch says, low on
    the left), **Shapes** (a wave in a shape on each beat: circle, heart,
    spinning star, square, diamond, hexagon, sweep or a mix, with optional
    glow outlines; off by default), **Shuffle the look** every 1–16 beats and
    **Strength**. Recorded clips include the sound while it's on.
- **🎬 Live**, for performing:
  - **📽 Output window**: a clean second window with only the picture (no
    buttons, toasts or cursor) to drag onto a projector and double-click for
    full screen; the controls stay here and the keys work in either window. It
    keeps running if the main window is minimised and reconnects if it reloads.
  - **Panic**: `B` fades to black and back (with an output window only the
    output goes black; this window dims, with a label), `Space` freezes, `0`
    jumps to a safe default look.
  - **Effects · hold**: punch-ins that play while you hold their key or pad:
    `Q` ⚡ strobe (6 flashes a second, or on 8th notes with a tempo; mind
    photosensitive viewers), `W` 🔁 stutter (16ths with a tempo), `E` 🌈 hue
    spin, `R` 🔍 zoom, `Z` 🌗 invert, `X` 🪞 kaleidoscope, `C` 📼 glitch,
    `V` 🧊 crunch. The keys mirror the pads; `Shift` (or Shift-click) locks
    one on. They stack, and never touch posters.
  - **Scenes**: nine slots for whole looks; `1`–`9` switches, `Shift` +
    `1`–`9` saves (or click an empty slot). Kept in the browser, each with a
    thumbnail of the look. A first visit starts with nine **example scenes**
    (🌈 Candy Pop, 💚 Matrix, 💖 Love Bomb, 💀 Skull Rave, 🧱 Tetris Party,
    👻 Braille Ghost, 📟 Amber Terminal, 🍩 Snack Attack, 🌀 Chaos Mode),
    shown as colour cards until they've played once; **✨ Examples** puts them
    back into empty slots without touching your own.
  - **MIDI controller** (MIDI learn): click *Learn…*, a slider or button
    (scenes, panic, punch-ins, Tap, 🎲, Tetris), then move a knob or hit a
    pad. Punch-ins last as long as the pad is held; mapped notes don't also
    play as music. Kept in the browser; the controller reconnects next time.
- **🖼 Photo** (photos and GIFs only): pan & zoom, tilt, twinkle, build again,
  and **posters**.

**Snapshots** (📸 or `P`) are kept in a tray rather than downloaded straight
away, because a download can pop up a prompt, steal the focus and drop you
out of full screen mid-show. 📸 shows how many there are; save or share them
from **🖼 Snapshots** under the toolbar (or ⋯ More) afterwards. Recording and
switching camera have no keys at all, so a slip of the hand can't start a
recording or cut the camera. `?` lists every shortcut.

⋯ More also has 🔄 switch camera (also the button over the camera view on
phones), 📋 copy the frame as text and ⌨ shortcuts.

Layout: on a phone the picture sits above the controls, kept short enough
that the toolbar always shows. Wide-but-short screens (a phone on its side,
an unfolded iPhone Duo) get a book layout, the picture on the left page and
the controls on the right, so the fold runs down the gap between them;
computers and iPads on their side get the picture with a controls sidebar.
**iPad held upright**: the picture stays pinned along the top, and the
controls scroll underneath in two columns (toolbar, source and style on the
left, pinned under the picture when there's room; the tabs on the right), so
the output is always in view. On touch screens faders and switches are
bigger, double-tap doesn't zoom, punch-in pads take several fingers at once,
and key hints appear as soon as a keyboard (an iPad's) is used. Split View and
Slide Over get the phone layout. MIDI isn't offered where the browser has no
Web MIDI (Safari, so every iPhone and iPad).

Full screen (⛶) fills the screen, using native full screen where the browser
allows it (iPhone Safari doesn't, so it fills the page), and keeps the screen
awake. 📺 TV opens the live picture in a native video player with the
system AirPlay picker, Picture in Picture and true full screen (on iPhone too).
Whether AirPlay accepts a live, generated stream is up to the OS; if not, the
player links to Screen Mirroring steps. Recorded clips (⏺, up to 60 s; MP4 on
Safari, with Save/Share to Photos on iPhone) have an AirPlay button too.
For true full screen on iPhone, use Share → **Add to Home Screen**.

## Design

A pocket synth for your camera: warm charcoal panels, tactile keycap
buttons, switches and fader-cap sliders, monospaced labels and readouts. Each
tab has its own signal colour that its switches, faders and headers pick up
(🎨 Look sunflower, 🎵 Beat sky, 🎬 Live bubblegum, 🖼 Photo mint); each
punch-in pad has its own candy colour and glows while held; scene slots show a
thumbnail of the saved look; and the logo's dot is an emoji that keeps
changing its mind. Motion is switched off for anyone who prefers reduced
motion. Type is [Bricolage Grotesque](https://github.com/ateliertriay/bricolage)
and [DM Mono](https://github.com/googlefonts/dm-mono), both SIL Open Font
License and bundled in `fonts/`, so nothing is fetched from elsewhere.

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
