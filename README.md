# emoji·fied

Turn your camera into live emoji or unicode art, right in the browser.
No build step, no dependencies, and no video ever leaves your device.

## Sources

- **📷 Camera** (front or back).
- **🎞 Video / GIF**: any video, animated GIF or photo from your Photos or
  Files, looped through the filter. GIFs are decoded by the app itself
  (`gif.js`), so they animate in every browser, including Safari. A video's
  soundtrack plays, drives *React to sound* (no microphone needed) and goes
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
  lines clear and new pieces build it again. With 🎹 MIDI on, your playing drops the
  pieces instead: each note releases a batch (more for a harder hit), low notes
  on the left and high notes on the right.

**React to sound** (uses the microphone): *Pulse* makes the glyphs swell with
loudness, and every beat sends a wave out from the center in a shape (circle, heart,
spinning star, square, diamond, hexagon or a sweep; off by default; pick
one or mix them, with optional glow outlines), shifts the hues,
flashes, shakes and zoom-punches the picture; *Shuffle on beats* switches to a random look on each
beat, or both. **Sensitivity** and **Effect strength** sliders tune it. While it's on,
recorded clips include the audio.

**🎹 React to MIDI** (Sound tab; Chrome, Edge or Firefox on a computer, as
Safari has no Web MIDI): plug in a keyboard or drum pads, or send MIDI from a
music app. Every note hits like a beat, as hard as it was played (flash, shake,
zoom punch, beat shapes, shuffles), and its pitch nudges the hues; held notes
swell the glyphs, the pitch bend wheel shifts the hues and the mod wheel adds
swell. It works alongside the microphone or on its own.

Layout: on a phone the picture sits above the controls, kept short enough
that the toolbar always shows. Wide-but-short screens (a phone on its side,
an unfolded iPhone Duo) get a book layout, the picture on the left page and
the controls on the right, so the fold runs down the gap between them;
computers get the picture with a controls sidebar.

**🎬 Live** (for performing): **📽 Output window** opens a clean second
window with only the picture, no buttons, toasts or cursor, to drag onto a
projector or second screen and double-click for full screen; the controls stay
in the main window, and shortcuts work in either. It keeps running if the main
window is minimised and reconnects if it reloads. **Panic buttons**: `B`
fades to black and back (with an output window, only the output goes black and
the main window dims with a label, so you can see what you'll bring back),
`Space` freezes the frame, `0` jumps to a safe default look. **Scenes**: nine
slots for whole looks (style, detail, colours, adjustments, Tetris, beat
shapes...): `1`–`9` switches, `Shift` + `1`–`9` saves (or click an empty slot).
Scenes are kept in the browser. **Punch-in effects** play while you hold
their key or button and stop when you let go (`Shift` + key, or Shift-click,
locks one on): `Q` ⚡ strobe (6 flashes a second; mind photosensitive
viewers), `W` 🔁 stutter, `E` 🌈 hue spin, `A` 🔍 zoom, `Z` 🌗 invert, `X` 🪞
kaleidoscope, `C` 📼 glitch, `V` 🧊 crunch (a quarter of the detail). They
stack, and touch only the live picture, not posters.

**🥁 Tempo**: tap `K` in time (one tap later re-aligns the beat), or send MIDI
clock from Ableton, Traktor or a drum machine (it wins while it runs, follows
Start/Stop, and is timed by the messages' own time stamps). With *Sync to
tempo* on, the beat drives the effects instead of the microphone: flash and
beat shapes, Tetris drops (a picture builds in 8 bars, sweeping left to
right) and, if you like, a look shuffle every 1–16 beats. Strobe flashes on
8th notes (quarter notes above 180 BPM, to stay under 6 a second) and Stutter
moves on 16ths.

**🎹 MIDI controller** (MIDI learn): click *Learn…*, click a slider (Detail,
the adjustments, Effect strength) or a button (scenes, panic buttons,
punch-ins, Tap, 🎲, Tetris), then move a knob or fader or hit a pad. Knobs
move sliders; pads and CC buttons press buttons, and punch-ins last as long as
the pad is held. Mapped notes don't also play as music; everything else on the
controller still does with *React to MIDI* on. Mappings are kept in the
browser, and the controller reconnects by itself next time.

Front/back camera: the switch button over the camera view (or `F`); mirroring
follows the camera and recordings carry on through a switch.

Full screen (⛶) fills the screen, using native full screen where the browser
allows it (iPhone Safari doesn't, so it fills the page), and keeps the screen
awake. 📺 AirPlay opens the live picture in a native video player with the
system AirPlay picker, Picture in Picture and true full screen (on iPhone too).
Whether AirPlay accepts a live, generated stream is up to the OS; if not, the
player links to Screen Mirroring steps. Recorded clips have an AirPlay button too.
For true full screen on iPhone, use Share → **Add to Home Screen**.

Extras: 🎲 randomize (`D`: random style, ink, detail and tone, sometimes a
random custom emoji set), detail slider, adjustments (contrast, brightness,
saturation, shadows, highlights, with reset), invert, mirror, front/back camera
flip, pause (`Space`), PNG snapshot (`S`), **video clips** (Record button in the controls or `R`, up to 60 s;
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
