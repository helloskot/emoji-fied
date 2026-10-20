'use strict';

const dbg = window.dbg || (() => {});

// ---------------------------------------------------------------------------
// Character sets
// ---------------------------------------------------------------------------

const EMOJI_SETS = {
  rainbow:
    '🟥🟧🟨🟩🟦🟪🟫⬛⬜🔴🟠🟡🟢🔵🟣🟤⚫⚪❤️🧡💛💚💙💜🤎🖤🤍🔶🔷💠🌈',
  faces:
    '😀😃😄😁😆😅😂🤣😊😇🙂🙃😉😌😍🥰😘😋😛😜🤪🤨🧐🤓😎🥸🤩🥳😏😒😞😔😟😕🙁😣😖😫😩🥺😢😭😤😠😡🤬🤯😳🥵🥶😱😨😰😥😓🤗🤔🤭🤫🤥😶😐😑😬🙄😯😦😧😮😲🥱😴🤤😪😵🤐🥴🤢🤮🤧😷🤒🤕🤑🤠😈👿👹👺🤡💩👻💀👽👾🤖🎃',
  food:
    '🍎🍊🍋🍌🍉🍇🍓🫐🍈🍒🍑🥭🍍🥥🥝🍅🍆🥑🥦🥬🥒🌶️🫑🌽🥕🧄🧅🥔🍠🥐🥯🍞🥖🧀🥚🍳🧈🥞🧇🥓🥩🍗🍖🌭🍔🍟🍕🥪🌮🌯🥗🍝🍜🍣🍤🍙🍚🍘🍥🥮🍡🍦🍧🍨🍩🍪🎂🍰🧁🥧🍫🍬🍭🍮🍯🥛☕🍵🧃🥤🧋🍺🍷',
  nature:
    '🌲🌳🌴🌵🌾🌿☘️🍀🍁🍂🍃🌸🌺🌻🌼🌷🌹🥀🍄🌰🐚🪨🌊💧🔥⭐🌟✨🌙☀️☁️⛅🌈❄️⚡🌍🌕🌑🪐',
  animals:
    '🐶🐱🐭🐹🐰🦊🐻🐼🐨🐯🦁🐮🐷🐸🐵🐔🐧🐦🐤🦆🦅🦉🐺🐗🐴🦄🐝🐛🦋🐌🐞🐢🐍🦎🐙🦑🦐🦀🐡🐠🐟🐬🐳🐋🦈🐊🐅🐆🦓🦍🐘🦛🦏🐪🦒🦘🐃🐄🐎🐖🐏🐑🦙🐐🦌🐕🐩🐈🐓🦃🦚🦜🦢🦩🕊️🐇🦝🦨🦡🦫🦦🦥🐁🐀🐿️🦔',
  hearts: '❤️🧡💛💚💙💜🤎🖤🤍🩷🩵🩶💖💗💓💞💕💘💝❣️',
};
EMOJI_SETS.everything = Object.values(EMOJI_SETS).join('');

// Sets where color matching would collapse to a single hue.
const PREFERS_BRIGHTNESS = new Set(['faces']);

// Order doesn't matter: glyphs are sorted by measured ink density.
const TEXT_SETS = {
  ascii: ' .:-=+*#%@',
  detailed: ' .\'`^",:;Il!i><~+_-?][}{1)(|\\/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$',
  blocks: ' ░▒▓█',
  shapes: ' ·∘○◌◍◎●◉',
  stars: ' ⋆✧✦☆★✪✯✹',
  math: ' ∙∶∴∷⊹∺≡≣⊞⊠■',
  katakana: ' ｦｧｨｩｪｫｬｭｮｯｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ01',
};

const EMOJI_FONT = '"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';
const MONO_FONT = 'ui-monospace,"SF Mono",Menlo,Consolas,"DejaVu Sans Mono","Noto Sans Mono",monospace';

// Glyph cell proportions (width / height) used for each kind of output.
const TEXT_ASPECT = 0.6;
const BRAILLE_ASPECT = 0.6;

// Longest side of the output canvas. Portrait phone cameras would otherwise
// produce a very tall canvas, and iOS Safari caps total canvas memory.
const OUTPUT_LONG_SIDE = 1280;
const BG = '#000';

// ---------------------------------------------------------------------------
// DOM
// ---------------------------------------------------------------------------

const $ = (sel) => document.querySelector(sel);
const video = $('#video');
const out = $('#out');
const ctx = out.getContext('2d');

const ui = {
  stage: $('#stage'),
  overlay: $('#overlay'),
  start: $('#start'),
  startFile: $('#startFile'),
  startScreen: $('#startScreen'),
  sourceButtons: [...document.querySelectorAll('[data-source]')],
  fileInput: $('#fileInput'),
  photoPanel: $('#photoPanel'),
  photoTab: $('#photoTab'),
  soundDot: $('#soundDot'),
  tabButtons: [...document.querySelectorAll('[data-tab]')],
  tabPanels: [...document.querySelectorAll('[data-panel]')],
  controls: $('.controls'),
  logoDot: $('#logoDot'),
  kenBurns: $('#kenBurns'),
  tilt: $('#tilt'),
  tiltOpts: $('#tiltOpts'),
  headTrack: $('#headTrack'),
  twinkle: $('#twinkle'),
  assemble: $('#assemble'),
  posterSize: $('#posterSize'),
  posterCols: $('#posterCols'),
  posterColsOut: $('#posterColsOut'),
  makePoster: $('#makePoster'),
  posterSheet: $('#posterSheet'),
  posterImg: $('#posterImg'),
  posterInfo: $('#posterInfo'),
  posterShare: $('#posterShare'),
  posterDownload: $('#posterDownload'),
  posterClose: $('#posterClose'),
  error: $('#error'),
  status: $('#status'),
  style: $('#style'),
  random: $('#random'),
  mic: $('#mic'),
  micOpts: $('#micOpts'),
  micStatus: $('#micStatus'),
  midiOpts: $('#midiOpts'),
  midiChip: $('#midiChip'),
  tempoBox: $('#tempoBox'),
  beatPulse: $('#beatPulse'),
  beatFlash: $('#beatFlash'),
  beatTetris: $('#beatTetris'),
  beatShuffle: $('#beatShuffle'),
  meter: $('#meter'),
  meterFill: $('#meterFill'),
  sens: $('#sens'),
  sensField: $('#sensField'),
  midi: $('#midi'),
  midiStatus: $('#midiStatus'),
  sensOut: $('#sensOut'),
  fxStrength: $('#fxStrength'),
  fxOut: $('#fxOut'),
  beatShape: $('#beatShape'),
  beatOutlineRow: $('#beatOutlineRow'),
  beatOutline: $('#beatOutline'),
  custom: $('#custom'),
  customField: $('#customField'),
  cols: $('#cols'),
  colsOut: $('#colsOut'),
  match: $('#match'),
  matchField: $('#matchField'),
  ink: $('#ink'),
  colorField: $('#colorField'),
  contrast: $('#contrast'),
  contrastOut: $('#contrastOut'),
  bright: $('#bright'),
  brightOut: $('#brightOut'),
  sat: $('#sat'),
  satOut: $('#satOut'),
  shadows: $('#shadows'),
  shadowsOut: $('#shadowsOut'),
  highlights: $('#highlights'),
  highlightsOut: $('#highlightsOut'),
  resetAdjust: $('#resetAdjust'),
  mirror: $('#mirror'),
  invert: $('#invert'),
  blank: $('#blank'),
  tetris: $('#tetris'),
  wordsOn: $('#wordsOn'),
  words: $('#words'),
  wordsMode: $('#wordsMode'),
  wordsMotion: $('#wordsMotion'),
  wordsColor: $('#wordsColor'),
  wordsSize: $('#wordsSize'),
  wordsSizeOut: $('#wordsSizeOut'),
  wordsPos: $('#wordsPos'),
  wordsOutline: $('#wordsOutline'),
  wordsDot: $('#wordsDot'),
  blackout: $('#blackout'),
  liveDot: $('#liveDot'),
  outputRow: $('#outputRow'),
  outputBtn: $('#outputBtn'),
  outputClose: $('#outputClose'),
  outputStatus: $('#outputStatus'),
  blackoutBtn: $('#blackoutBtn'),
  freezeBtn: $('#freezeBtn'),
  safeBtn: $('#safeBtn'),
  sceneSave: $('#sceneSave'),
  scenes: $('#scenes'),
  scenesHint: $('#scenesHint'),
  punches: $('#punches'),
  tempoRead: $('#tempoRead'),
  tapBtn: $('#tapBtn'),
  beatDots: [...document.querySelectorAll('#beatDots i')],
  tempoSync: $('#tempoSync'),
  moreBtn: $('#moreBtn'),
  moreMenu: $('#moreMenu'),
  snapsItem: $('#snapsItem'),
  keysItem: $('#keysItem'),
  keysBtn: $('#keysBtn'),
  snapBadge: $('#snapBadge'),
  snapTray: $('#snapTray'),
  snapSheet: $('#snapSheet'),
  snapGrid: $('#snapGrid'),
  snapSaveAll: $('#snapSaveAll'),
  snapClear: $('#snapClear'),
  snapClose: $('#snapClose'),
  keysSheet: $('#keysSheet'),
  keysClose: $('#keysClose'),
  learnHead: $('#learnHead'),
  learnBtn: $('#learnBtn'),
  midiMap: $('#midiMap'),
  learnHint: $('#learnHint'),
  punchHint: $('#punchHint'),
  blankField: $('#blankField'),
  flip: $('#flip'),
  flipFab: $('#flipFab'),
  full: $('#full'),
  exitFull: $('#exitFull'),
  airplay: $('#airplay'),
  player: $('#player'),
  liveVideo: $('#liveVideo'),
  playerAirplay: $('#playerAirplay'),
  playerPip: $('#playerPip'),
  playerFull: $('#playerFull'),
  playerMirror: $('#playerMirror'),
  playerClose: $('#playerClose'),
  clipAirplay: $('#clipAirplay'),
  tvHint: $('#tvHint'),
  tvSteps: $('#tvSteps'),
  tvHintClose: $('#tvHintClose'),
  pause: $('#pause'),
  snap: $('#snap'),
  copy: $('#copy'),
  record: $('#record'),
  clip: $('#clip'),
  clipVideo: $('#clipVideo'),
  clipInfo: $('#clipInfo'),
  clipShare: $('#clipShare'),
  clipDownload: $('#clipDownload'),
  clipDiscard: $('#clipDiscard'),
  fps: $('#fps'),
  toast: $('#toast'),
};

// Small canvas the video is downsampled into: one pixel per cell
// (or 2x4 per cell for braille).
const sample = document.createElement('canvas');
const sctx = sample.getContext('2d', { willReadFrequently: true });

// Offscreen layer for text modes: glyphs are drawn as a white mask,
// then tinted in a single composite operation.
const layer = document.createElement('canvas');
const lctx = layer.getContext('2d');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const segmenter = 'Segmenter' in Intl ? new Intl.Segmenter(undefined, { granularity: 'grapheme' }) : null;
function graphemes(str) {
  return segmenter ? Array.from(segmenter.segment(str), (s) => s.segment) : Array.from(str);
}

// Built at runtime: an unsupported \p{...} in a regex literal is a parse-time
// SyntaxError that would stop the whole script from loading.
const EMOJI_RE = (() => {
  try {
    return new RegExp('\\p{Extended_Pictographic}|\\p{Regional_Indicator}', 'u');
  } catch {
    return /[\u2600-\u27BF]|[\uD83C-\uDBFF][\uDC00-\uDFFF]/;
  }
})();

const clamp255 = (v) => (v < 0 ? 0 : v > 255 ? 255 : v);
const smoothstep = (a, b, x) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};
const luma = (r, g, b) => 0.2126 * r + 0.7152 * g + 0.0722 * b;

// Toolbar buttons hold an icon and a short label.
function setTool(btn, ico, lbl) {
  btn.querySelector('.ico').textContent = ico;
  btn.querySelector('.lbl').textContent = lbl;
}

let toastTimer;
function toast(msg) {
  hostOverlays();
  ui.toast.textContent = msg;
  ui.toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => ui.toast.classList.remove('show'), 1600);
}

// ---------------------------------------------------------------------------
// Palettes: glyphs pre-rendered into an atlas, with measured color/density
// ---------------------------------------------------------------------------

/**
 * Render each glyph into a sprite atlas and measure it.
 * Returns { atlas, cw, ch, entries: [{ glyph, sx, sy, r, g, b, lum, density }] }
 * Color is the glyph's average color composited over black, i.e. what the
 * whole cell looks like from a distance.
 */
function buildAtlas(glyphs, { emoji, cw, ch, draw }) {
  const perRow = Math.max(1, Math.ceil(Math.sqrt(glyphs.length)));
  const atlas = document.createElement('canvas');
  atlas.width = perRow * cw;
  atlas.height = Math.ceil(glyphs.length / perRow) * ch;
  const a = atlas.getContext('2d', { willReadFrequently: true });
  a.textAlign = 'center';
  a.textBaseline = 'middle';
  a.fillStyle = '#fff';
  a.font = emoji ? `${Math.round(ch * 0.82)}px ${EMOJI_FONT}` : `${Math.round(ch * 0.82)}px ${MONO_FONT}`;

  const entries = glyphs.map((glyph, i) => {
    const sx = (i % perRow) * cw;
    const sy = Math.floor(i / perRow) * ch;
    if (draw) draw(a, glyph, sx, sy);
    else a.fillText(glyph, sx + cw / 2, sy + ch / 2 + (emoji ? ch * 0.04 : 0));

    const d = a.getImageData(sx, sy, cw, ch).data;
    let r = 0, g = 0, b = 0, cov = 0;
    for (let p = 0; p < d.length; p += 4) {
      const al = d[p + 3] / 255;
      r += d[p] * al;
      g += d[p + 1] * al;
      b += d[p + 2] * al;
      cov += al;
    }
    const n = cw * ch;
    r /= n; g /= n; b /= n;
    return { glyph, sx, sy, r, g, b, lum: luma(r, g, b), density: cov / n };
  });

  // The measuring canvas is CPU-backed (willReadFrequently), which iOS Safari
  // is very slow to draw *from*: thousands of blits per frame can exhaust
  // memory and crash the tab. Copy it once into a normal, GPU-friendly canvas.
  const sprites = document.createElement('canvas');
  sprites.width = atlas.width;
  sprites.height = atlas.height;
  sprites.getContext('2d').drawImage(atlas, 0, 0);
  atlas.width = atlas.height = 0;

  return { atlas: sprites, cw, ch, entries };
}

function buildEmojiPalette(chars) {
  const glyphs = [...new Set(graphemes(chars).filter((g) => g.trim()))];
  const pal = buildAtlas(glyphs, { emoji: true, cw: 48, ch: 48 });
  // Drop glyphs the platform couldn't render.
  pal.entries = pal.entries.filter((e) => e.density > 0.02);
  pal.entries.forEach((e, i) => (e.i = i));
  pal.byLum = [...pal.entries].sort((x, y) => x.lum - y.lum);
  pal.lut = new Int16Array(1 << 15).fill(-1);
  pal.lut2 = new Int16Array(1 << 15).fill(-1); // runner-up, for twinkle
  return pal;
}

function buildTextPalette(chars) {
  const glyphs = [...new Set(graphemes(chars))];
  const pal = buildAtlas(glyphs, { emoji: false, cw: 30, ch: 50 });
  pal.entries.sort((x, y) => x.density - y.density);
  return pal;
}

// Skulls: one 💀 drawn at a range of sizes (the first is empty). Brighter
// cells get bigger skulls; the renderer tints them by multiplying, so each
// skull keeps its own eye sockets and teeth.
const SKULL_SIZES = [0, 0.36, 0.48, 0.6, 0.72, 0.86, 1];
function buildSkullPalette() {
  const pal = buildAtlas(SKULL_SIZES.map((_, i) => `skull${i}`), {
    emoji: true,
    cw: 48,
    ch: 48,
    draw(a, glyph, sx, sy) {
      const size = SKULL_SIZES[+glyph.slice(5)];
      if (!size) return;
      a.save();
      a.font = `${Math.round(48 * 0.84 * size)}px ${EMOJI_FONT}`;
      a.fillText('💀', sx + 24, sy + 24 + 2 * size);
      a.restore();
    },
  });
  for (const e of pal.entries) e.glyph = e.density > 0 ? '💀' : ' '; // for "Copy text"
  pal.multiply = true;
  return pal;
}

// Braille: 256 patterns drawn as dots ourselves so they render the same on
// every platform. The glyph index *is* the 8-bit dot pattern.
const BRAILLE_BITS = [
  [0x01, 0x08],
  [0x02, 0x10],
  [0x04, 0x20],
  [0x40, 0x80],
];
function buildBraillePalette() {
  const glyphs = Array.from({ length: 256 }, (_, i) => String.fromCharCode(0x2800 + i));
  return buildAtlas(glyphs, {
    emoji: false,
    cw: 30,
    ch: 50,
    draw(a, glyph, sx, sy) {
      const bits = glyph.charCodeAt(0) - 0x2800;
      const rad = 4.6;
      for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 2; col++) {
          if (!(bits & BRAILLE_BITS[row][col])) continue;
          a.beginPath();
          a.arc(sx + 9 + col * 12, sy + 7 + row * 12, rad, 0, Math.PI * 2);
          a.fill();
        }
      }
    },
  });
}

// Weighted RGB distance ("redmean"), cheap and perceptually decent.
function colorDist(r1, g1, b1, r2, g2, b2) {
  const rm = (r1 + r2) / 2;
  const dr = r1 - r2, dg = g1 - g2, db = b1 - b2;
  return (2 + rm / 256) * dr * dr + 4 * dg * dg + (2 + (255 - rm) / 256) * db * db;
}

// Nearest emoji by color, memoised on a 15-bit quantised RGB key.
function nearestEmoji(pal, r, g, b) {
  const key = ((r >> 3) << 10) | ((g >> 3) << 5) | (b >> 3);
  let idx = pal.lut[key];
  if (idx >= 0) return idx;
  const qr = ((r >> 3) << 3) + 4, qg = ((g >> 3) << 3) + 4, qb = ((b >> 3) << 3) + 4;
  let best = Infinity, second = Infinity, idx2 = -1;
  const es = pal.entries;
  for (let i = 0; i < es.length; i++) {
    const d = colorDist(qr, qg, qb, es[i].r, es[i].g, es[i].b);
    if (d < best) { second = best; idx2 = idx; best = d; idx = i; }
    else if (d < second) { second = d; idx2 = i; }
  }
  pal.lut[key] = idx;
  pal.lut2[key] = idx2 >= 0 ? idx2 : idx;
  return idx;
}

// The next-closest emoji by color (twinkle shimmers between the two).
function secondNearestEmoji(pal, r, g, b) {
  nearestEmoji(pal, r, g, b);
  return pal.lut2[((r >> 3) << 10) | ((g >> 3) << 5) | (b >> 3)];
}

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

const state = {
  kind: 'emoji', // 'emoji' | 'text' | 'braille'
  palette: null,
  cols: 64,
  rows: 48,
  cellW: 20,
  cellH: 20,
  paused: false,
  facing: 'user',
  stream: null,
  source: 'camera', // 'camera' | 'file' | 'screen'
  fileUrl: null,
  fileKind: null, // 'video' | 'gif' | 'image' when source is 'file'
  cameraCount: 0, // 0 = unknown
  switching: false,
  lastGlyphs: null, // Int16Array of palette indices for "copy text" (-1 = blank)
};

const paletteCache = new Map();
function getPalette(key, build) {
  if (!paletteCache.has(key)) paletteCache.set(key, build());
  return paletteCache.get(key);
}

function applyStyle() {
  const v = ui.style.value;
  ui.customField.hidden = v !== 'custom';

  if (v === 'braille') {
    state.kind = 'braille';
    state.palette = getPalette('braille', buildBraillePalette);
  } else if (v === 'skull') {
    state.kind = 'skull';
    state.palette = getPalette('skull', buildSkullPalette);
  } else if (v.startsWith('text:')) {
    state.kind = 'text';
    const name = v.slice(5);
    state.palette = getPalette(v, () => buildTextPalette(TEXT_SETS[name]));
  } else if (v.startsWith('emoji:')) {
    state.kind = 'emoji';
    const name = v.slice(6);
    state.palette = getPalette(v, () => buildEmojiPalette(EMOJI_SETS[name]));
    ui.match.value = PREFERS_BRIGHTNESS.has(name) ? 'brightness' : 'color';
  } else {
    // Custom: emoji if the input contains any, otherwise a text ramp.
    const chars = ui.custom.value || ' ';
    const isEmoji = EMOJI_RE.test(chars);
    state.kind = isEmoji ? 'emoji' : 'text';
    const pal = isEmoji ? buildEmojiPalette(chars) : buildTextPalette(chars);
    if (isEmoji && pal.entries.length === 0) {
      state.kind = 'text';
      state.palette = buildTextPalette(chars);
    } else {
      state.palette = pal;
    }
  }

  const emoji = state.kind === 'emoji';
  ui.matchField.hidden = !emoji;
  ui.blankField.hidden = !emoji;
  ui.colorField.hidden = emoji;
  layout();
}

// Emoji and skulls use square cells; text and braille use tall ones.
const squareCells = () => state.kind === 'emoji' || state.kind === 'skull';

function layout() {
  state.cols = +ui.cols.value;
  ui.colsOut.textContent = `${state.cols} cols`;
  paintRange(ui.cols);

  const [vw, vh] = frameSize();
  const aspect =
    squareCells() ? 1 : state.kind === 'braille' ? BRAILLE_ASPECT : TEXT_ASPECT;

  const outW = vw >= vh ? OUTPUT_LONG_SIDE : Math.round((OUTPUT_LONG_SIDE * vw) / vh);
  state.cellW = outW / state.cols;
  state.cellH = state.cellW / aspect;
  state.rows = Math.max(1, Math.round((outW * vh) / vw / state.cellH));

  out.width = outW;
  out.height = Math.round(state.rows * state.cellH);
  // The text-tinting layer is only needed for unicode styles.
  const needLayer = state.kind !== 'emoji';
  layer.width = needLayer ? out.width : 1;
  layer.height = needLayer ? out.height : 1;
  dbg(`layout: video ${vw}x${vh} -> canvas ${out.width}x${out.height}, grid ${state.cols}x${state.rows}`);
  if (hasSource()) ui.stage.style.aspectRatio = `${out.width} / ${out.height}`;

  const sub = state.kind === 'braille' ? [2, 4] : [1, 1];
  sample.width = state.cols * sub[0];
  sample.height = state.rows * sub[1];

  state.lastGlyphs = new Int16Array(state.cols * state.rows);
  if (state.paused) render();
}

// ---------------------------------------------------------------------------
// Rendering
// ---------------------------------------------------------------------------

// 4x4 Bayer matrix for ordered dithering of braille dots.
const BAYER4 = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map((v) => (v + 0.5) / 16);

// Draw the current frame (or the `crop` window of it) into a sample canvas,
// one pixel per cell (2x4 for braille), and apply the adjustments in place.
// Used for the live view and, at much higher detail, for posters.
function sampleFrame(sc, sx, crop, fx, mirror, punched, words) {
  const sw = sc.width, sh = sc.height;
  sx.save();
  sx.imageSmoothingEnabled = true;
  sx.imageSmoothingQuality = 'high';
  if (mirror) {
    sx.translate(sw, 0);
    sx.scale(-1, 1);
  }
  // Transparent GIF/PNG areas show as the background, not the last frame.
  sx.fillStyle = BG;
  sx.fillRect(0, 0, sw, sh);
  sx.drawImage(frameEl(), crop[0], crop[1], crop[2], crop[3], 0, 0, sw, sh);
  sx.restore();
  const img = sx.getImageData(0, 0, sw, sh);
  adjustPixels(img.data, fx, punched);
  if (punched) punchPixels(img.data, sw, sh);
  // Written back so the full-colour tint pass sees the adjusted colours.
  sx.putImageData(img, 0, 0);
  if (words && wordsActive()) {
    // Words are painted into the sample like part of the picture, so the
    // renderer draws them out of the current glyphs.
    drawWords(sx, sw, sh);
    return sx.getImageData(0, 0, sw, sh).data;
  }
  return img.data;
}

// ---- Words ------------------------------------------------------------------
// A message drawn into the picture: over it (with a dark outline so it
// reads), on its own, or as a cut-out the picture shows through. Up to four
// lines; still, scrolling, typed out, bouncing or pulsing on the beat.

const WORDS_FONT = "'Bricolage Grotesque', ui-sans-serif, system-ui, sans-serif";
const wordsActive = () => ui.wordsOn.checked && ui.words.value.trim() !== '';
document.fonts?.load(`800 32px ${WORDS_FONT}`).catch(() => {});

function drawWords(sx, sw, sh) {
  const lines = ui.words.value.split('\n').map((l) => l.trim()).filter(Boolean).slice(0, 4);
  if (!lines.length) return;
  const t = performance.now() / 1000;
  const motion = ui.wordsMotion.value, mode = ui.wordsMode.value;
  // The lines fill this share of the height, unless that's too wide
  // (scrolling text may run on).
  let px = (sh * (+ui.wordsSize.value / 100)) / lines.length;
  sx.save();
  sx.font = `800 ${px}px ${WORDS_FONT}`;
  let widest = Math.max(...lines.map((l) => sx.measureText(l).width));
  if (motion !== 'scroll' && widest > sw * 0.94) {
    px *= (sw * 0.94) / widest;
    sx.font = `800 ${px}px ${WORDS_FONT}`;
    widest = Math.max(...lines.map((l) => sx.measureText(l).width));
  }
  const blockH = px * lines.length;
  const pos = ui.wordsPos.value;
  const top = pos === 'top' ? sh * 0.05 : pos === 'bottom' ? sh * 0.95 - blockH : (sh - blockH) / 2;

  if (motion === 'pulse') {
    // Thump with the beat (a gentle breath when nothing's listening).
    const listening = sound.analyser || midi.on || tempoOn();
    const k = 1 + 0.3 * Math.min(1, sound.kick) + (listening ? 0 : 0.05 * Math.sin(t * 3));
    const cx = sw / 2, cy = top + blockH / 2;
    sx.translate(cx, cy);
    sx.scale(k, k);
    sx.translate(-cx, -cy);
  }

  // Where every character goes.
  const total = lines.reduce((n, l) => n + [...l].length, 0);
  let budget = motion === 'type' ? Math.min(total, Math.floor(t * 9) % (total + 14)) : Infinity;
  const scrollX = sw - ((t * sw * 0.3) % (widest + sw));
  const chars = [];
  lines.forEach((line, li) => {
    const glyphs = [...line];
    const w = sx.measureText(line).width;
    const x0 = motion === 'scroll' ? scrollX : (sw - w) / 2;
    const y = top + px * (li + 0.55);
    glyphs.forEach((ch, i) => {
      if (budget-- <= 0) return;
      const x = x0 + sx.measureText(glyphs.slice(0, i).join('')).width;
      const bob = motion === 'bounce' ? Math.sin(t * 5 + chars.length * 0.6) * px * 0.12 : 0;
      chars.push([ch, x, y + bob]);
    });
  });
  sx.textBaseline = 'middle';
  sx.textAlign = 'left';

  let fill = ui.wordsColor.value;
  if (fill === 'rainbow') {
    const g = sx.createLinearGradient(0, 0, sw, 0);
    const h0 = (t * 70) % 360;
    for (let i = 0; i <= 6; i++) g.addColorStop(i / 6, `hsl(${(h0 + i * 60) % 360} 95% 62%)`);
    fill = g;
  }

  if (mode === 'cutout') {
    // Keep the picture only inside the letters; dark everywhere else. The
    // letters go into a mask first: 'destination-in' cuts on every draw
    // call, so drawing them one by one would leave only the last letter.
    const mask = wordsMask(sw, sh);
    const m = mask.getContext('2d');
    m.setTransform(1, 0, 0, 1, 0, 0);
    m.clearRect(0, 0, sw, sh);
    m.setTransform(sx.getTransform());
    m.font = sx.font;
    m.textBaseline = 'middle';
    m.textAlign = 'left';
    m.fillStyle = '#fff';
    for (const [ch, x, y] of chars) m.fillText(ch, x, y);
    sx.setTransform(1, 0, 0, 1, 0, 0);
    sx.globalCompositeOperation = 'destination-in';
    sx.drawImage(mask, 0, 0);
    sx.globalCompositeOperation = 'destination-over';
    sx.fillStyle = BG;
    sx.fillRect(0, 0, sw, sh);
  } else {
    // Unicode styles have one ink, so letters stand out only by how dense
    // their characters are: dim the picture a little behind them.
    if (mode === 'over' && state.kind !== 'emoji') {
      sx.save();
      sx.setTransform(1, 0, 0, 1, 0, 0);
      sx.fillStyle = 'rgba(0, 0, 0, 0.55)';
      sx.fillRect(0, 0, sw, sh);
      sx.restore();
    }
    if (mode === 'only') {
      sx.save();
      sx.setTransform(1, 0, 0, 1, 0, 0);
      sx.fillStyle = BG;
      sx.fillRect(0, 0, sw, sh);
      sx.restore();
    } else if (ui.wordsOutline.checked) {
      sx.lineJoin = 'round';
      sx.lineWidth = Math.max(1, px * 0.16);
      sx.strokeStyle = '#000';
      for (const [ch, x, y] of chars) sx.strokeText(ch, x, y);
    }
    sx.fillStyle = fill;
    for (const [ch, x, y] of chars) sx.fillText(ch, x, y);
  }
  sx.restore();
}

let wordsMaskCanvas = null;
function wordsMask(w, h) {
  if (!wordsMaskCanvas) wordsMaskCanvas = document.createElement('canvas');
  if (wordsMaskCanvas.width !== w || wordsMaskCanvas.height !== h) {
    wordsMaskCanvas.width = w;
    wordsMaskCanvas.height = h;
  }
  return wordsMaskCanvas;
}

function syncWords() {
  ui.wordsDot.hidden = !wordsActive();
  ui.wordsSizeOut.textContent = `${ui.wordsSize.value}%`;
  if (state.paused) render();
}

// Contrast, brightness, saturation, shadows/highlights, invert, plus the
// sound effects' flash and hue shift and (live, not posters) the punch-in
// hue spin and invert.
function adjustPixels(d, fx, punched) {
  const c = +ui.contrast.value;
  const br = (+ui.bright.value + (fx ? fx.swell * 0.06 + fx.kick * 0.22 : 0)) * 255;
  const sat = +ui.sat.value * (fx ? 1 + fx.kick * 0.8 : 1);
  // Beat hue shift: a luminance-preserving hue rotation matrix.
  const hueDeg = (fx ? fx.hue : 0) + (punched ? punchHue() : 0);
  const hue = Math.abs(hueDeg) > 0.5 ? (hueDeg * Math.PI) / 180 : 0;
  const hc = Math.cos(hue), hs = Math.sin(hue);
  const m00 = 0.213 + hc * 0.787 - hs * 0.213, m01 = 0.715 - hc * 0.715 - hs * 0.715, m02 = 0.072 - hc * 0.072 + hs * 0.928;
  const m10 = 0.213 - hc * 0.213 + hs * 0.143, m11 = 0.715 + hc * 0.285 + hs * 0.14, m12 = 0.072 - hc * 0.072 - hs * 0.283;
  const m20 = 0.213 - hc * 0.213 - hs * 0.787, m21 = 0.715 - hc * 0.715 + hs * 0.715, m22 = 0.072 + hc * 0.928 + hs * 0.072;
  const shd = +ui.shadows.value;
  const hil = +ui.highlights.value;
  const tone = shd !== 0 || hil !== 0;
  const inv = ui.invert.checked !== (punched && punchOn('invert'));
  for (let p = 0; p < d.length; p += 4) {
    let r = d[p], g = d[p + 1], b = d[p + 2];
    // Shadows / highlights: lift or lower tones, fading out smoothly so
    // shadows barely touch the bright end and highlights the dark end.
    if (tone) {
      const l = luma(r, g, b) / 255;
      const lift = 127.5 * (shd * (1 - smoothstep(0, 0.7, l)) + hil * smoothstep(0.3, 1, l));
      r += lift; g += lift; b += lift;
    }
    r = (r - 128) * c + 128 + br;
    g = (g - 128) * c + 128 + br;
    b = (b - 128) * c + 128 + br;
    if (sat !== 1) {
      const y = luma(r, g, b);
      r = y + (r - y) * sat;
      g = y + (g - y) * sat;
      b = y + (b - y) * sat;
    }
    if (hue) {
      const r0 = r, g0 = g, b0 = b;
      r = r0 * m00 + g0 * m01 + b0 * m02;
      g = r0 * m10 + g0 * m11 + b0 * m12;
      b = r0 * m20 + g0 * m21 + b0 * m22;
    }
    if (inv) { r = 255 - r; g = 255 - g; b = 255 - b; }
    d[p] = clamp255(r);
    d[p + 1] = clamp255(g);
    d[p + 2] = clamp255(b);
  }
}

// The part of the frame on screen: all of it, or for photos and GIFs a
// moving window (pan & zoom, tilt).
function viewCrop() {
  const [W, H] = frameSize();
  return photoCrop(W, H) || [0, 0, W, H];
}

function grabFrame() {
  return sampleFrame(sample, sctx, punchCrop(viewCrop()), state.fx, ui.mirror.checked, true, true);
}

function render() {
  state.fx = soundFx();
  const d = grabFrame();
  ctx.fillStyle = BG;
  ctx.fillRect(0, 0, out.width, out.height);
  // A render "job": where to draw and at what grid size. Posters use their
  // own, much larger job.
  const job = {
    c: ctx, layer, lc: lctx, sample, d,
    cols: state.cols, rows: state.rows, cellW: state.cellW, cellH: state.cellH,
    grid: state.lastGlyphs, fx: state.fx, photo: photoFx(),
  };
  if (state.kind === 'emoji') renderEmoji(job);
  else renderText(job);
}

function renderEmoji(j) {
  const pal = state.palette;
  const { c, d, cols, rows, cellW, cellH, grid, fx, photo } = j;
  const byBrightness = ui.match.value === 'brightness';
  const blank = ui.blank.checked;
  const n = pal.byLum.length;
  if (fx) zoomPunch(c, fx);

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const p = (y * cols + x) * 4;
      const r = d[p], g = d[p + 1], b = d[p + 2];
      const l = luma(r, g, b);

      if (blank && l < 28) {
        grid[y * cols + x] = -1;
        continue;
      }

      let e;
      if (byBrightness) {
        let k = Math.min(n - 1, ((l / 256) * n) | 0);
        if (photo?.twinkle && twinkles(x, y, photo.t)) k = Math.max(0, Math.min(n - 1, k + (hash3(x, y, 7) < 0.5 ? -1 : 1)));
        e = pal.byLum[k];
      } else {
        const twin = photo?.twinkle && twinkles(x, y, photo.t);
        e = pal.entries[twin ? secondNearestEmoji(pal, r, g, b) : nearestEmoji(pal, r, g, b)];
      }
      grid[y * cols + x] = e.i;
      drawCell(c, pal, e, x, y, cellW, cellH, fx, photo, l / 255);
    }
  }
  if (fx) {
    drawBeatOutlines(c, fx);
    c.setTransform(1, 0, 0, 1, 0, 0);
  }
}

const glyphMask = document.createElement('canvas'); // scratch for multiply-tinted glyphs

function renderText(j) {
  const pal = state.palette;
  const { c, layer: lay, lc, sample: samp, d, cols, rows, cellW, cellH, grid, fx, photo } = j;
  const es = pal.entries;
  const n = es.length;
  const braille = state.kind === 'braille';
  const sw = samp.width;

  lc.globalCompositeOperation = 'source-over';
  lc.clearRect(0, 0, lay.width, lay.height);
  if (fx) zoomPunch(lc, fx);

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      let idx;
      if (braille) {
        idx = 0;
        for (let row = 0; row < 4; row++) {
          for (let col = 0; col < 2; col++) {
            const px = x * 2 + col, py = y * 4 + row;
            const p = (py * sw + px) * 4;
            const l = luma(d[p], d[p + 1], d[p + 2]) / 255;
            if (l > BAYER4[(py & 3) * 4 + (px & 3)]) idx |= BRAILLE_BITS[row][col];
          }
        }
        if (photo?.twinkle && twinkles(x, y, photo.t)) idx ^= 1 << ((hash3(x, y, 9) * 8) | 0);
      } else {
        const p = (y * cols + x) * 4;
        const l = luma(d[p], d[p + 1], d[p + 2]) / 256;
        idx = Math.min(n - 1, (l * n) | 0);
        if (photo?.twinkle && twinkles(x, y, photo.t)) idx = Math.max(1, Math.min(n - 1, idx + (hash3(x, y, 7) < 0.5 ? -1 : 1)));
      }
      grid[y * cols + x] = idx;
      const e = es[idx];
      if (e.density === 0) continue;
      drawCell(lc, pal, e, x, y, cellW, cellH, fx, photo, braille ? 0.8 : idx / (n - 1));
    }
  }

  const ink = ui.ink.value;
  const paint = () => {
    if (ink === 'full') {
      lc.imageSmoothingEnabled = false;
      lc.filter = 'saturate(1.3) brightness(1.25)';
      lc.drawImage(samp, 0, 0, lay.width, lay.height);
      lc.filter = 'none';
    } else {
      lc.fillStyle = ink;
      lc.fillRect(0, 0, lay.width, lay.height);
    }
  };
  if (pal.multiply) {
    // Coloured glyphs (skulls): multiply by the colour so their own shading
    // stays, then trim back to the glyph shapes.
    if (glyphMask.width !== lay.width || glyphMask.height !== lay.height) {
      glyphMask.width = lay.width;
      glyphMask.height = lay.height;
    }
    const mc = glyphMask.getContext('2d');
    mc.clearRect(0, 0, lay.width, lay.height);
    mc.drawImage(lay, 0, 0);
    lc.globalCompositeOperation = 'multiply';
    paint();
    lc.save();
    lc.setTransform(1, 0, 0, 1, 0, 0);
    lc.globalCompositeOperation = 'destination-in';
    lc.drawImage(glyphMask, 0, 0);
    lc.restore();
  } else {
    // Tint the white glyph mask.
    lc.globalCompositeOperation = 'source-in';
    paint();
  }
  if (fx) lc.setTransform(1, 0, 0, 1, 0, 0);
  c.drawImage(lay, 0, 0);
  if (fx) {
    zoomPunch(c, fx);
    drawBeatOutlines(c, fx);
    c.setTransform(1, 0, 0, 1, 0, 0);
  }
}

// ---------------------------------------------------------------------------
// Loop
// ---------------------------------------------------------------------------

let frames = 0;
let fpsT = performance.now();

function frame() {
  // Show the on-camera record button only while the live view is up.
  const showFlip = state.source === 'camera' && !!state.stream && ui.overlay.hidden && state.cameraCount !== 1;
  if (ui.flipFab.hidden === showFlip) ui.flipFab.hidden = !showFlip;
  updateSound();
  trackHead(performance.now());
  if (rec.recorder) copyFrameToRecording();
  gifTick(performance.now());
  if (!state.paused && frameReady() && !stutterHold()) {
    render();
    if (!frames && !loop.logged) {
      loop.logged = true;
      dbg(`first frame rendered: ${state.cols}x${state.rows}, kind=${state.kind}`);
    }
    frames++;
  }
  const now = performance.now();
  if (now - fpsT >= 1000) {
    ui.fps.textContent = hasSource() ? `${state.cols}×${state.rows} · ${frames} fps` : '';
    if (hasSource() && (loop.ticks = (loop.ticks || 0) + 1) <= 10) dbg(`running: ${frames} fps`);
    frames = 0;
    fpsT = now;
  }
  tickTempo(now);
  tickLive(now);
}

function loop() {
  show.mainRaf = performance.now();
  frame();
  requestAnimationFrame(loop);
}

// ---------------------------------------------------------------------------
// Recording
// ---------------------------------------------------------------------------

const MAX_CLIP_SECONDS = 60;
const rec = { recorder: null, chunks: [], canvas: null, ctx: null, started: 0, timer: 0, file: null, url: null };

function pickRecordingType(withAudio) {
  if (!window.MediaRecorder || !HTMLCanvasElement.prototype.captureStream) return null;
  const types = withAudio
    ? ['video/mp4;codecs=avc1,mp4a.40.2', 'video/mp4', 'video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm']
    : ['video/mp4;codecs=avc1', 'video/mp4', 'video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm'];
  return types.find((t) => MediaRecorder.isTypeSupported?.(t)) ?? '';
}

// Record from a fixed-size copy of the output so that changing style or
// detail mid-clip (which resizes the output canvas) doesn't break the
// encoder. H.264 also needs even dimensions.
function copyFrameToRecording() {
  const { canvas, ctx: rctx } = rec;
  const scale = Math.min(canvas.width / out.width, canvas.height / out.height);
  const w = out.width * scale, h = out.height * scale;
  rctx.fillStyle = BG;
  rctx.fillRect(0, 0, canvas.width, canvas.height);
  rctx.drawImage(out, (canvas.width - w) / 2, (canvas.height - h) / 2, w, h);
}

function startRecording() {
  if (!hasSource()) {
    toast('Start the camera or a video first');
    return;
  }
  // While "React to sound" is on, the microphone goes into the clip too.
  const audioTracks = recordingAudioTracks();
  const type = pickRecordingType(audioTracks.length > 0);
  if (type === null) {
    toast('Recording isn’t supported in this browser');
    return;
  }
  const even = (n) => Math.max(2, Math.round(n / 2) * 2);
  const scale = Math.min(1, 1280 / Math.max(out.width, out.height));
  rec.canvas = document.createElement('canvas');
  rec.canvas.width = even(out.width * scale);
  rec.canvas.height = even(out.height * scale);
  rec.ctx = rec.canvas.getContext('2d');
  copyFrameToRecording();

  const canvasStream = rec.canvas.captureStream(30);
  const stream = new MediaStream([...canvasStream.getVideoTracks(), ...audioTracks]);
  let recorder;
  try {
    const opts = { videoBitsPerSecond: 6_000_000 };
    if (type) opts.mimeType = type;
    recorder = new MediaRecorder(stream, opts);
  } catch (err) {
    dbg('MediaRecorder failed:', err.name, err.message);
    toast('Couldn’t start recording');
    return;
  }
  rec.chunks = [];
  recorder.ondataavailable = (e) => e.data && e.data.size && rec.chunks.push(e.data);
  recorder.onstop = () => finishRecording(recorder, canvasStream, type, audioTracks.length > 0);
  recorder.onerror = (e) => {
    dbg('recorder error:', e.error?.name, e.error?.message);
    toast('Recording failed');
  };
  recorder.start(1000);
  rec.recorder = recorder;
  rec.started = performance.now();
  rec.timer = setInterval(updateRecordButton, 250);
  updateRecordButton();
  dbg(`recording started: ${rec.canvas.width}x${rec.canvas.height}, type=${recorder.mimeType || type || 'default'}, audio=${audioTracks.length > 0}`);
}

function stopRecording() {
  if (!rec.recorder) return;
  clearInterval(rec.timer);
  if (rec.recorder.state !== 'inactive') rec.recorder.stop();
  rec.recorder = null;
  setRecordUI(null);
}

// `time` is null when not recording.
function setRecordUI(time) {
  const recording = time !== null;
  ui.record.classList.toggle('recording', recording);
  setTool(ui.record, recording ? '⏹' : '⏺', recording ? time : 'Record');
}

function updateRecordButton() {
  const secs = Math.floor((performance.now() - rec.started) / 1000);
  setRecordUI(`${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}`);
  if (secs >= MAX_CLIP_SECONDS) {
    stopRecording();
    toast(`Clips are limited to ${MAX_CLIP_SECONDS} seconds`);
  }
}

function finishRecording(recorder, canvasStream, type, withAudio) {
  // Stop only the canvas track: the microphone stays on for "React to sound".
  canvasStream.getTracks().forEach((t) => t.stop());
  const mime = (recorder.mimeType || type || 'video/webm').split(';')[0];
  const blob = new Blob(rec.chunks, { type: mime });
  rec.chunks = [];
  dbg(`recording stopped: ${(blob.size / 1e6).toFixed(2)} MB, ${mime}`);
  if (!blob.size) {
    toast('Nothing was recorded');
    return;
  }
  const ext = mime.includes('mp4') ? 'mp4' : 'webm';
  rec.file = new File([blob], `emoji-fied-${Date.now()}.${ext}`, { type: mime });
  rec.url = URL.createObjectURL(blob);
  ui.clipVideo.src = rec.url;
  ui.clipVideo.play().catch(() => {});
  ui.clipInfo.textContent = `${ext.toUpperCase()} · ${(blob.size / 1e6).toFixed(1)} MB${withAudio ? ' · with sound' : ''}`;
  ui.clipShare.hidden = !navigator.canShare?.({ files: [rec.file] });
  ui.clipAirplay.hidden = !canAirplay(ui.clipVideo);
  hostOverlays();
  ui.clip.hidden = false;
}

function closeClip() {
  ui.clip.hidden = true;
  ui.clipVideo.removeAttribute('src');
  ui.clipVideo.load();
  if (rec.url) URL.revokeObjectURL(rec.url);
  rec.url = null;
  rec.file = null;
}

async function shareClip() {
  try {
    await navigator.share({ files: [rec.file], title: 'emoji·fied clip' });
  } catch (err) {
    if (err.name !== 'AbortError') {
      dbg('share failed:', err.name, err.message);
      toast('Sharing failed, try Download');
    }
  }
}

function downloadClip() {
  const a = document.createElement('a');
  a.href = rec.url;
  a.download = rec.file.name;
  a.click();
  toast('Clip downloaded');
}

// ---------------------------------------------------------------------------
// Camera
// ---------------------------------------------------------------------------

// Open a camera facing `facing`. With `exact`, insist on that side first
// (iOS sometimes ignores a plain preference), falling back to a preference
// if the device can't satisfy it (e.g. laptops whose webcam has no facing).
async function openCamera(facing, exact) {
  const size = { width: { ideal: 1280 }, height: { ideal: 720 } };
  if (exact) {
    try {
      return await navigator.mediaDevices.getUserMedia({ video: { ...size, facingMode: { exact: facing } }, audio: false });
    } catch (err) {
      if (err.name !== 'OverconstrainedError' && err.name !== 'NotFoundError') throw err;
      dbg(`exact facing ${facing} unavailable (${err.name}), falling back`);
    }
  }
  return navigator.mediaDevices.getUserMedia({ video: { ...size, facingMode: facing }, audio: false });
}

async function startCamera({ exact = false, quietFail = false } = {}) {
  dbg('startCamera()');
  ui.error.textContent = '';
  if (!navigator.mediaDevices?.getUserMedia) {
    ui.error.textContent = window.isSecureContext
      ? 'This browser does not support camera access.'
      : 'Camera access needs HTTPS (or localhost).';
    return;
  }
  ui.start.disabled = true;
  ui.status.textContent = 'Asking for camera permission…';
  const slow = setTimeout(() => {
    ui.status.textContent =
      'Still waiting for the camera. If no prompt appeared, check Safari: page menu (aA) → Website Settings → Camera → Allow.';
  }, 6000);
  try {
    state.stream?.getTracks().forEach((t) => t.stop());
    dbg('calling getUserMedia, facing=' + state.facing);
    state.stream = await openCamera(state.facing, exact);
    const track = state.stream.getVideoTracks()[0];
    if (track) {
      track.addEventListener('ended', () => {
        dbg('camera track ended');
        if (state.stream && state.stream.getVideoTracks()[0] === track) {
          ui.status.textContent = 'The camera stopped. Tap to restart it.';
          ui.overlay.hidden = false;
        }
      });
    }
    const cam = (track && track.getSettings && track.getSettings()) || {};
    dbg(`getUserMedia ok: ${cam.width}x${cam.height} @ ${cam.frameRate}fps, facing=${cam.facingMode}`);
    clearTimeout(slow);
    ui.status.textContent = 'Starting video…';
    video.muted = true;
    video.loop = false;
    video.srcObject = state.stream;
    await playVideo();
    if (!video.paused) {
      ui.overlay.hidden = true;
      ui.status.textContent = '';
    }
    layout();
    countCameras();
    return true;
  } catch (err) {
    dbg('startCamera failed:', err.name, err.message);
    if (quietFail) return false;
    const msg = {
      NotAllowedError: 'Camera permission was denied. Allow it in your browser settings and try again.',
      NotFoundError: 'No camera was found on this device.',
      NotReadableError: 'The camera is in use by another app.',
    }[err.name];
    ui.error.textContent = `${msg || `Could not start camera: ${err.message}`} (${err.name})`;
    ui.overlay.hidden = false;
    return false;
  } finally {
    clearTimeout(slow);
    ui.start.disabled = false;
    if (!ui.overlay.hidden && !ui.start.onclick) ui.status.textContent = '';
  }
}

// Device labels are only visible after permission, so count after starting.
async function countCameras() {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    state.cameraCount = devices.filter((d) => d.kind === 'videoinput').length;
    dbg(`cameras: ${state.cameraCount}`);
  } catch {
    state.cameraCount = 0; // unknown: keep the flip button
  }
}

const deviceIdOf = (stream) => stream?.getVideoTracks()[0]?.getSettings?.().deviceId;

// Switch between the front and back camera. Rendering keeps the last frame
// on screen while the new camera starts, and recordings carry on.
async function switchCamera() {
  if (state.switching) return;
  if (state.source !== 'camera') {
    toast('Switch the source to 📷 Camera first');
    return;
  }
  const prev = state.facing;
  state.facing = prev === 'user' ? 'environment' : 'user';
  ui.mirror.checked = state.facing === 'user';
  if (!state.stream) {
    toast(state.facing === 'user' ? '🤳 Front camera' : '📷 Back camera');
    return;
  }
  state.switching = true;
  ui.flipFab.classList.add('busy');
  ui.flip.disabled = true;
  const prevId = deviceIdOf(state.stream);
  dbg(`switching camera ${prev} -> ${state.facing}`);
  const ok = await startCamera({ exact: true, quietFail: true });
  const sameDevice = ok && prevId && deviceIdOf(state.stream) === prevId;
  if (!ok || sameDevice) {
    state.facing = prev;
    ui.mirror.checked = prev === 'user';
    if (sameDevice) {
      state.cameraCount = 1;
      toast('This device has only one camera');
    } else {
      toast('Couldn’t switch camera');
      await startCamera(); // bring the previous camera back
    }
  } else {
    toast(state.facing === 'user' ? '🤳 Front camera' : '📷 Back camera');
  }
  state.switching = false;
  ui.flipFab.classList.remove('busy');
  ui.flip.disabled = false;
}

// ---------------------------------------------------------------------------
// Sources: camera, a video file, or a shared screen/tab
// ---------------------------------------------------------------------------

// Audio nodes for sources with their own sound.
const media = { elSource: null, recDest: null, screenAudio: null };

const hasSource = () => (state.source === 'file' ? !!state.fileUrl : !!state.stream);
const canShareScreen = () => !!navigator.mediaDevices?.getDisplayMedia;

function ensureAudioCtx() {
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) throw new Error('Web Audio is not supported');
  sound.ctx = sound.ctx || new AC();
  sound.ctx.resume?.().catch(() => {});
  return sound.ctx;
}

// ---- Frames: what the renderer draws from -------------------------------------
// The <video> (camera, screen, video file), the GIF player's canvas, or a
// still image.

const gif = { data: null, canvas: document.createElement('canvas'), ctx: null, img: null, idx: -1, nextAt: 0, dispose: null };
gif.ctx = gif.canvas.getContext('2d');
const still = { img: null };

function frameEl() {
  if (state.source === 'file' && state.fileKind === 'gif') return gif.canvas;
  if (state.source === 'file' && state.fileKind === 'image') return still.img;
  return video;
}

function frameSize() {
  const el = frameEl();
  if (el === video) return [video.videoWidth || 640, video.videoHeight || 480];
  if (el === gif.canvas) return [gif.canvas.width, gif.canvas.height];
  return [el?.naturalWidth || 640, el?.naturalHeight || 480];
}

function frameReady() {
  const el = frameEl();
  return el === video ? video.readyState >= 2 : !!el;
}

// GIF playback: composite each frame onto an RGBA buffer, honouring
// transparency and the previous frame's disposal method.
function gifStart(data) {
  gif.data = data;
  gif.canvas.width = data.width;
  gif.canvas.height = data.height;
  gif.img = gif.ctx.createImageData(data.width, data.height);
  gif.idx = -1;
  gif.nextAt = 0;
  gif.dispose = null;
  gifTick(performance.now()); // draw the first frame now
}

function gifStop() {
  gif.data = null;
  gif.img = null;
  gif.canvas.width = gif.canvas.height = 0;
}

function gifDrawFrame(i) {
  const { width: W, height: H, frames } = gif.data;
  const buf = gif.img.data;
  if (i === 0) {
    buf.fill(0); // each loop starts from a clean canvas
    gif.dispose = null;
  }
  const d = gif.dispose;
  if (d) {
    // Disposal 2: clear the previous frame's area. 3: restore what was under it.
    for (let y = d.y0; y < d.y1; y++) {
      const row = (y * W) * 4;
      if (d.type === 2) buf.fill(0, row + d.x0 * 4, row + d.x1 * 4);
      else buf.set(d.saved.subarray((y - d.y0) * (d.x1 - d.x0) * 4, (y - d.y0 + 1) * (d.x1 - d.x0) * 4), row + d.x0 * 4);
    }
    gif.dispose = null;
  }
  const f = frames[i];
  const x0 = Math.min(f.x, W), y0 = Math.min(f.y, H);
  const x1 = Math.min(f.x + f.w, W), y1 = Math.min(f.y + f.h, H);
  let saved = null;
  if (f.disposal === 3) {
    saved = new Uint8ClampedArray((x1 - x0) * (y1 - y0) * 4);
    for (let y = y0; y < y1; y++) saved.set(buf.subarray((y * W + x0) * 4, (y * W + x1) * 4), (y - y0) * (x1 - x0) * 4);
  }
  const pal = f.palette;
  for (let y = y0; y < y1; y++) {
    let k = (y - f.y) * f.w + (x0 - f.x);
    let o = (y * W + x0) * 4;
    for (let x = x0; x < x1; x++, k++, o += 4) {
      const c = f.idx[k];
      if (c === f.transparent) continue;
      buf[o] = pal[c * 3];
      buf[o + 1] = pal[c * 3 + 1];
      buf[o + 2] = pal[c * 3 + 2];
      buf[o + 3] = 255;
    }
  }
  if (f.disposal === 2 || f.disposal === 3) gif.dispose = { type: f.disposal, x0, y0, x1, y1, saved };
  gif.ctx.putImageData(gif.img, 0, 0);
}

function gifTick(now) {
  if (!gif.data || (state.paused && gif.idx >= 0)) return;
  if (now < gif.nextAt) return;
  const n = gif.data.frames.length;
  gif.idx = (gif.idx + 1) % n;
  gifDrawFrame(gif.idx);
  const delay = gif.data.frames[gif.idx].delay;
  // Keep to the GIF's own timing, but don't try to catch up after a stall.
  gif.nextAt = now - gif.nextAt > 250 ? now + delay : gif.nextAt + delay;
}

// ---- Photo effects (photos and GIFs) ---------------------------------------

const isPhotoSource = () => state.source === 'file' && (state.fileKind === 'image' || state.fileKind === 'gif');

// Cheap, repeatable per-cell randomness.
function hash3(x, y, s) {
  let h = Math.imul(x, 374761393) ^ Math.imul(y, 668265263) ^ Math.imul(s, 1274126177);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

const ASSEMBLE_MS = 1800;
const photoState = { assembleAt: -Infinity };
// Tilt: target (tx, ty) from the motion sensor or the mouse, eased into (x, y).
// Arrow keys held right now win over the other inputs while they're down.
const motion = { x: 0, y: 0, tx: 0, ty: 0, sensor: false, keys: new Set() };

// Pan & zoom ("Ken Burns") and tilt move a window over the picture.
function photoCrop(W, H) {
  if (!isPhotoSource()) return null;
  const kb = ui.kenBurns.checked, tilt = ui.tilt.checked;
  if (!kb && !tilt) return null;
  const t = performance.now() / 1000, TAU = Math.PI * 2;
  let z = 1, cx = 0.5, cy = 0.5;
  if (kb) {
    z = 1.2 + 0.14 * Math.sin((t * TAU) / 22);
    cx += 0.1 * Math.sin((t * TAU) / 31);
    cy += 0.08 * Math.sin((t * TAU) / 26 + 1.3);
  }
  if (tilt) {
    let gx = motion.tx, gy = motion.ty;
    if (motion.keys.size) {
      gx = (motion.keys.has('ArrowRight') ? 1 : 0) - (motion.keys.has('ArrowLeft') ? 1 : 0);
      gy = (motion.keys.has('ArrowDown') ? 1 : 0) - (motion.keys.has('ArrowUp') ? 1 : 0);
    }
    motion.x += (gx - motion.x) * 0.15;
    motion.y += (gy - motion.y) * 0.15;
    z = Math.max(z, 1.18);
    cx += motion.x * 0.08;
    cy += motion.y * 0.08;
  }
  const w = W / z, h = H / z;
  return [Math.min(Math.max(cx * W - w / 2, 0), W - w), Math.min(Math.max(cy * H - h / 2, 0), H - h), w, h];
}

// Per-frame cell effects for the renderer, or null when there are none: the
// photo effects, plus the Tetris build, which works on any source.
function photoFx() {
  const now = performance.now();
  const tet = tetrisFrame(now);
  if (!isPhotoSource()) return tet && { t: now / 1000, twinkle: false, asm: null, tet, w: out.width, h: out.height };
  // With Tetris on, pieces build the picture instead of the fly-in.
  const asm = ui.tetris.checked ? 1 : (now - photoState.assembleAt) / ASSEMBLE_MS;
  const twinkle = ui.twinkle.checked;
  if (!twinkle && asm >= 1 && !tet) return null;
  return { t: now / 1000, twinkle, asm: asm < 1 ? asm : null, tet, w: out.width, h: out.height };
}

// Twinkle: now and then a cell shimmers to a neighbouring glyph.
function twinkles(x, y, t) {
  return hash3(x, y, Math.floor(t * 2 + hash3(x, y, 1) * 8)) < 0.12;
}

const easeOutBack = (p) => 1 + 2.70158 * (p - 1) ** 3 + 1.70158 * (p - 1) ** 2;

// Scale and offset of one cell for the photo effects.
function photoCell(ph, x, y) {
  let k = 1, ox = 0, oy = 0;
  if (ph.twinkle) {
    // Glints: a quick swell on a few cells at a time.
    const s = Math.sin(ph.t * 2.4 + hash3(x, y, 3) * 40);
    if (s > 0.92) k += (s - 0.92) * 5;
  }
  if (ph.asm !== null) {
    // Assemble: each glyph flies in from a scattered spot, staggered.
    const p = Math.min(1, Math.max(0, (ph.asm - hash3(x, y, 5) * 0.55) / 0.45));
    if (p <= 0) return { k: 0, ox: 0, oy: 0 };
    const a = hash3(x, y, 6) * Math.PI * 2;
    const dist = (0.25 + 0.5 * hash3(x, y, 8)) * Math.max(ph.w, ph.h);
    const left = (1 - p) ** 3;
    ox = Math.cos(a) * dist * left;
    oy = Math.sin(a) * dist * left;
    k *= Math.max(0, easeOutBack(p));
  }
  if (ph.tet) {
    // Tetris: the cell rides with its piece, turned and shifted a whole
    // cell at a time.
    const T = ph.tet, P = T.plan;
    const i = P.owner[y * P.cols + x];
    const pk = P.k[i] * (T.clearing ? P.rowK[y] : 1);
    if (!(pk > 0)) return { k: 0, ox: 0, oy: 0 };
    if (P.drop[i] || P.turn[i] || P.shift[i]) {
      let rx = x - P.px[i], ry = y - P.py[i];
      for (let r = P.turn[i]; r > 0; r--) {
        const t = rx;
        rx = -ry;
        ry = t;
      }
      ox += (P.px[i] + rx + P.shift[i] - x) * T.cw;
      oy += (P.py[i] + ry - P.drop[i] - y) * T.ch;
    }
    k *= pk;
  }
  return { k, ox, oy };
}

function startAssemble() {
  photoState.assembleAt = performance.now();
  tetris.plan = null; // with Tetris on, build it again from the first piece
}

// ---- Tetris build -----------------------------------------------------------
// The picture builds itself from falling tetrominoes made of its own glyphs.
// The grid is cut into pieces, which drop onto the stack bottom row first,
// turning and sliding a cell at a time on the way down like the game. Once
// it's built it holds for a while, the lines clear from the bottom up, and it
// starts over with new pieces.

const TETRIS_FALL_MS = 900; // a piece's drop from the top to the bottom row
const TETRIS_BUILD_MS = 6000; // from the first piece landing to the last
const TETRIS_HOLD_MS = 5000; // the finished picture
const TETRIS_LAND_MS = 160; // the little bump as a piece locks in
const TETRIS_SWEEP_MS = 700; // line clear, bottom row to top row
const TETRIS_ROW_MS = 320; // one line flashing and vanishing

// Every distinct orientation of a piece, as [x, y] cells (y down), plus the
// cell a bottom-up, left-to-right scan reaches first (the lowest row's
// leftmost), which is where the piece gets anchored when tiling.
function orientations(cells) {
  const out = [], seen = new Set();
  let cur = cells;
  for (let r = 0; r < 4; r++) {
    const mx = Math.min(...cur.map((c) => c[0])), my = Math.min(...cur.map((c) => c[1]));
    const norm = cur.map(([x, y]) => [x - mx, y - my]);
    const key = norm.map(String).sort().join(';');
    if (!seen.has(key)) {
      seen.add(key);
      const ay = Math.max(...norm.map((c) => c[1]));
      const ax = Math.min(...norm.filter((c) => c[1] === ay).map((c) => c[0]));
      out.push({ cells: norm, ax, ay });
    }
    cur = cur.map(([x, y]) => [-y, x]);
  }
  return out;
}
const TETROMINOES = [
  [[0, 0], [1, 0], [2, 0], [3, 0]], // I
  [[0, 0], [1, 0], [0, 1], [1, 1]], // O
  [[0, 0], [1, 0], [2, 0], [1, 1]], // T
  [[1, 0], [2, 0], [0, 1], [1, 1]], // S
  [[0, 0], [1, 0], [1, 1], [2, 1]], // Z
  [[0, 0], [0, 1], [0, 2], [1, 2]], // L
  [[1, 0], [1, 1], [1, 2], [0, 2]], // J
].flatMap(orientations);
// Smaller bits for the gaps no tetromino fits.
const TETRIS_FILL = [
  [[0, 0], [1, 0], [2, 0]],
  [[0, 0], [1, 0], [0, 1]],
  [[0, 0], [1, 0]],
  [[0, 0]],
].flatMap(orientations);

const tetris = { plan: null, seed: 1, lastDrop: 0 };

// With a beat source on (and "Tetris drops"), the pieces wait for notes and
// beats instead of a timeline.
const tetrisByNotes = () => ui.beatTetris.checked && ((midi.on && midi.devices > 0) || tempoOn() || (micOn() && !!sound.analyser));

function tetrisPlan(cols, rows, start, byNotes) {
  const seed = tetris.seed++;
  let n = 0;
  const rnd = () => hash3(seed, n++, 11);
  const owner = new Int32Array(cols * rows).fill(-1);
  const pieces = [];
  const free = (gx, gy) => gx >= 0 && gx < cols && gy >= 0 && gy < rows && owner[gy * cols + gx] < 0;
  // Tile greedily, bottom-up: each free cell starts a piece that only
  // covers free cells, trying the tetrominoes from a random one first and
  // preferring a placement that doesn't cut off a lone free cell (which
  // could only ever be a one-cell piece).
  for (let y = rows - 1; y >= 0; y--) {
    for (let x = 0; x < cols; x++) {
      if (owner[y * cols + x] >= 0) continue;
      const fits = (sh) => sh.cells.every(([cx, cy]) => free(x + cx - sh.ax, y + cy - sh.ay));
      const strands = (sh) => {
        const taken = (gx, gy) => sh.cells.some(([cx, cy]) => x + cx - sh.ax === gx && y + cy - sh.ay === gy);
        const open = (gx, gy) => free(gx, gy) && !taken(gx, gy);
        let lone = 0;
        for (const [cx, cy] of sh.cells) {
          for (const [nx, ny] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
            const gx = x + cx - sh.ax + nx, gy = y + cy - sh.ay + ny;
            if (open(gx, gy) && !open(gx + 1, gy) && !open(gx - 1, gy) && !open(gx, gy + 1) && !open(gx, gy - 1)) lone++;
          }
        }
        return lone;
      };
      let shape = null, best = Infinity;
      const o = (rnd() * TETROMINOES.length) | 0;
      for (let i = 0; i < TETROMINOES.length && best > 0; i++) {
        const sh = TETROMINOES[(o + i) % TETROMINOES.length];
        if (!fits(sh)) continue;
        const lone = strands(sh);
        if (lone < best) {
          shape = sh;
          best = lone;
        }
      }
      shape = shape || TETRIS_FILL.find(fits);
      const id = pieces.length;
      let sx = 0, sy = 0;
      for (const [cx, cy] of shape.cells) {
        const gx = x + cx - shape.ax, gy = y + cy - shape.ay;
        owner[gy * cols + gx] = id;
        sx += gx;
        sy += gy;
      }
      pieces.push({
        px: Math.round(sx / shape.cells.length), py: Math.round(sy / shape.cells.length),
        bottom: y, order: y + rnd() * 2.5,
      });
    }
  }

  const count = pieces.length;
  const P = {
    cols, rows, owner, count, start,
    px: new Int16Array(count), py: new Int16Array(count),
    rot: new Int8Array(count), slide: new Int8Array(count),
    dist: new Int16Array(count), fallMs: new Float32Array(count), landAt: new Float64Array(count),
    // This frame's state of each piece; k = 0 while it waits to drop.
    k: new Float32Array(count), drop: new Int16Array(count),
    turn: new Int8Array(count), shift: new Int8Array(count),
    rowK: new Float32Array(rows),
  };
  // Lowest pieces land first (with some jitter), so the stack grows upward.
  const byOrder = pieces.map((_, i) => i).sort((a, b) => pieces[b].order - pieces[a].order);
  byOrder.forEach((i, rank) => {
    const pc = pieces[i];
    P.px[i] = pc.px;
    P.py[i] = pc.py;
    P.rot[i] = (rnd() * 4) | 0;
    P.slide[i] = Math.round((rnd() * 2 - 1) * 3);
    P.dist[i] = pc.bottom + 3; // start just above the top
    P.fallMs[i] = (P.dist[i] / rows) * TETRIS_FALL_MS;
    P.landAt[i] = start + TETRIS_FALL_MS + (rank / Math.max(1, count - 1)) * TETRIS_BUILD_MS;
  });
  P.byNotes = byNotes;
  if (byNotes) {
    // Nothing drops until notes release it. The grid is split into bands
    // left to right, each with its pieces bottom row first; a note's pitch
    // picks the band.
    P.landAt.fill(Infinity);
    P.bands = Math.max(4, Math.min(12, Math.round(cols / 8)));
    P.queues = Array.from({ length: P.bands }, () => []);
    for (const i of byOrder) P.queues[Math.min(P.bands - 1, Math.floor((P.px[i] * P.bands) / cols))].push(i);
    P.next = new Int32Array(P.bands); // the next piece to release in each band
    P.bandLast = new Float64Array(P.bands); // when the band's last released piece lands
    P.unreleased = count;
    P.trickleAt = start;
    P.builtAt = P.clearAt = P.endAt = Infinity;
    return P;
  }
  P.builtAt = start + TETRIS_FALL_MS + TETRIS_BUILD_MS + TETRIS_LAND_MS;
  P.clearAt = P.builtAt + TETRIS_HOLD_MS;
  P.endAt = P.clearAt + TETRIS_SWEEP_MS + TETRIS_ROW_MS + 150;
  return P;
}

// Drop the next n pieces, from the band nearest `band` that has some left.
function tetrisRelease(P, band, n, now) {
  const stagger = Math.min(18, 160 / n);
  for (let k = 0; k < n && P.unreleased; k++) {
    let b = -1;
    for (let d = 0; b < 0 && d < P.bands; d++) {
      if (band - d >= 0 && P.next[band - d] < P.queues[band - d].length) b = band - d;
      else if (band + d < P.bands && P.next[band + d] < P.queues[band + d].length) b = band + d;
    }
    const i = P.queues[b][P.next[b]++];
    // Never land before the piece released just before it in the band, so
    // the stack doesn't grow from the top when notes come fast.
    P.landAt[i] = Math.max(now + k * stagger + P.fallMs[i], P.bandLast[b] + 12);
    P.bandLast[b] = P.landAt[i];
    P.unreleased--;
  }
  if (!P.unreleased) {
    P.builtAt = Math.max(...P.bandLast) + TETRIS_LAND_MS;
    P.clearAt = P.builtAt + TETRIS_HOLD_MS;
    P.endAt = P.clearAt + TETRIS_SWEEP_MS + TETRIS_ROW_MS + 150;
  }
}

// A note drops a batch of pieces, more for a harder hit, in the band its
// pitch maps to (over the range of notes played so far): a full picture
// takes about 40 notes.
function tetrisNote(note, vel, now) {
  const P = tetris.plan;
  if (!P || !P.byNotes || !P.unreleased) return;
  const span = Math.max(12, midi.hi - midi.lo);
  const band = Math.min(P.bands - 1, Math.max(0, Math.floor(((note - midi.lo) / (span + 1)) * P.bands)));
  tetrisRelease(P, band, Math.max(1, Math.round((P.count / 60) * (0.4 + vel))), now);
  tetris.lastDrop = now;
}

// On a beat: a batch sweeping across the bands, left to right, so a
// picture builds in 32 beats (8 bars).
function tetrisBeat(now) {
  const P = tetris.plan;
  if (!P || !P.byNotes || !P.unreleased) return;
  tetrisRelease(P, sound.beats % P.bands, Math.max(1, Math.ceil(P.count / 32)), now);
  tetris.lastDrop = now;
}

// Where every piece is this frame, or null when nothing moves (Tetris off,
// or the finished picture holding).
function tetrisFrame(now) {
  if (!ui.tetris.checked || !state.cols) {
    tetris.plan = null;
    return null;
  }
  let P = tetris.plan;
  const byNotes = tetrisByNotes();
  if (!P || P.cols !== state.cols || P.rows !== state.rows || P.byNotes !== byNotes || now > P.endAt) {
    P = tetris.plan = tetrisPlan(state.cols, state.rows, now, byNotes);
  }
  if (P.byNotes && P.unreleased && now - tetris.lastDrop > 3000) {
    // No one playing: keep a slow trickle going (about 45 s for the lot),
    // so the picture never stalls half-built.
    const every = Math.max(16, 45000 / P.count);
    const n = Math.floor((now - P.trickleAt) / every);
    if (n > 0) {
      P.trickleAt += n * every;
      tetrisRelease(P, (Math.random() * P.bands) | 0, n, now);
    }
  } else if (P.byNotes) P.trickleAt = now;
  if (now > P.builtAt && now < P.clearAt) return null;
  const clearing = now >= P.clearAt;
  if (clearing) {
    P.k.fill(1);
    P.drop.fill(0);
    P.turn.fill(0);
    P.shift.fill(0);
    // Lines flash (swell), then vanish, sweeping up from the bottom.
    for (let y = 0; y < P.rows; y++) {
      const q = (now - P.clearAt - ((P.rows - 1 - y) / Math.max(1, P.rows - 1)) * TETRIS_SWEEP_MS) / TETRIS_ROW_MS;
      P.rowK[y] = q < 0 ? 1 : q < 0.35 ? 1 + q : q < 1 ? 1.35 * (1 - (q - 0.35) / 0.65) : 0;
    }
  } else {
    for (let i = 0; i < P.count; i++) {
      const left = P.landAt[i] - now;
      P.drop[i] = P.turn[i] = P.shift[i] = 0;
      if (left <= -TETRIS_LAND_MS) P.k[i] = 1;
      else if (left <= 0) P.k[i] = 1 + 0.25 * (1 + left / TETRIS_LAND_MS); // just locked in
      else if (left >= P.fallMs[i]) P.k[i] = 0; // still waiting
      else {
        // Falling a whole row at a time; the turns and the slide are done
        // by halfway down, before it reaches the stack.
        const frac = left / P.fallMs[i];
        const q = Math.min(1, (1 - frac) * 2);
        P.k[i] = 1;
        P.drop[i] = Math.ceil(frac * P.dist[i]);
        P.turn[i] = P.rot[i] - Math.min(P.rot[i], Math.floor(q * (P.rot[i] + 1)));
        P.shift[i] = Math.round(P.slide[i] * (1 - q));
      }
    }
  }
  return { plan: P, clearing, cw: state.cellW, ch: state.cellH };
}

function onOrientation(e) {
  if (e.gamma == null || e.beta == null) return;
  motion.sensor = true;
  // Map to screen axes; a phone held upright leans back about 45°.
  const angle = screen.orientation?.angle ?? window.orientation ?? 0;
  let gx = e.gamma, gy = e.beta - 45;
  if (angle === 90) [gx, gy] = [e.beta, -e.gamma];
  else if (angle === 270 || angle === -90) [gx, gy] = [-e.beta, e.gamma];
  motion.tx = Math.max(-1, Math.min(1, gx / 25));
  motion.ty = Math.max(-1, Math.min(1, gy / 25));
}

async function enableTilt() {
  // iOS asks for motion permission, and only from a tap.
  if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
    try {
      if ((await DeviceOrientationEvent.requestPermission()) !== 'granted') throw new Error('denied');
    } catch (err) {
      dbg('motion permission failed:', err.message);
      ui.tilt.checked = false;
      toast('Motion permission was denied');
      return;
    }
  }
  window.addEventListener('deviceorientation', onOrientation);
  toast('📱 Tilt your phone. On a computer: mouse, arrow keys or head tracking');
}

// ---- Head tracking: the webcam steers the tilt ------------------------------
// MediaPipe's face detector runs locally in the browser (WebAssembly); the
// camera image never leaves the device. The library (~10 MB with its
// WebAssembly) and the 230 KB model load the first time it's switched on.
// Moving your head shifts the view the other way, like a window.

const MP_BASE = window.EMOJI_MP_BASE || 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.18';
const FACE_MODEL = window.EMOJI_FACE_MODEL ||
  'https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite';

const head = { on: false, loading: false, detector: null, stream: null, video: null, lastT: 0, seenAt: 0, neutral: null, calib: [] };

async function loadFaceDetector() {
  const vision = await import(`${MP_BASE}/vision_bundle.mjs`);
  const fileset = await vision.FilesetResolver.forVisionTasks(`${MP_BASE}/wasm`);
  const make = (delegate) =>
    vision.FaceDetector.createFromOptions(fileset, {
      baseOptions: { modelAssetPath: FACE_MODEL, delegate },
      runningMode: 'VIDEO',
      minDetectionConfidence: 0.6,
    });
  try {
    return await make('GPU');
  } catch (err) {
    dbg('face detector on GPU failed, using CPU:', err.message);
    return make('CPU');
  }
}

async function startHeadTracking() {
  if (head.on || head.loading) return;
  head.loading = true;
  toast('🙂 Loading head tracking…');
  try {
    head.detector = head.detector || (await loadFaceDetector());
    head.stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
      audio: false,
    });
    if (!head.video) {
      head.video = document.createElement('video');
      head.video.muted = true;
      head.video.playsInline = true;
      // Kept in the page (but invisible) so every browser keeps decoding it.
      head.video.style.cssText = 'position:fixed;left:0;bottom:0;width:2px;height:2px;opacity:0.01;pointer-events:none';
      document.body.appendChild(head.video);
    }
    head.video.srcObject = head.stream;
    await head.video.play();
    head.neutral = null;
    head.calib = [];
    head.on = true;
    dbg('head tracking on');
    toast('🙂 Move your head to look around');
  } catch (err) {
    dbg('head tracking failed:', err.name, err.message);
    ui.headTrack.checked = false;
    toast(err.name === 'NotAllowedError' ? 'Camera permission was denied' : 'Couldn’t start head tracking');
  } finally {
    head.loading = false;
  }
}

function stopHeadTracking() {
  head.on = false;
  head.stream?.getTracks().forEach((t) => t.stop());
  head.stream = null;
  if (head.video) head.video.srcObject = null;
  motion.tx = motion.ty = 0;
}

// Called every frame; detects ~15 times a second.
function trackHead(now) {
  if (!head.on || head.video.readyState < 2 || now - head.lastT < 66) return;
  head.lastT = now;
  let face;
  try {
    face = head.detector.detectForVideo(head.video, now).detections[0];
  } catch (err) {
    dbg('face detection error:', err.message);
    return;
  }
  if (!face) {
    // Lost the face for a moment: drift back to the middle.
    if (now - head.seenAt > 1000) motion.tx = motion.ty = 0;
    return;
  }
  head.seenAt = now;
  const b = face.boundingBox;
  const fx = (b.originX + b.width / 2) / head.video.videoWidth;
  const fy = (b.originY + b.height / 2) / head.video.videoHeight;
  // The first half second sets "straight ahead" to wherever you're sitting.
  if (!head.neutral) {
    head.calib.push([fx, fy]);
    if (head.calib.length < 8) return;
    head.neutral = head.calib.reduce((a, p) => [a[0] + p[0] / head.calib.length, a[1] + p[1] / head.calib.length], [0, 0]);
    dbg(`head tracking calibrated at ${head.neutral.map((v) => v.toFixed(2)).join(', ')}`);
  }
  // The webcam image isn't mirrored: leaning right moves the face left in it,
  // and the view shifts left, as through a window.
  motion.tx = Math.max(-1, Math.min(1, (fx - head.neutral[0]) * 3.5));
  motion.ty = Math.max(-1, Math.min(1, -(fy - head.neutral[1]) * 3.5));
}

// ---- Poster: a high-detail render of the current frame ------------------------

async function makePoster() {
  if (!hasSource() || !frameReady()) {
    toast('Pick a photo first');
    return;
  }
  ui.makePoster.disabled = true;
  ui.makePoster.textContent = 'Making poster…';
  await new Promise((r) => setTimeout(r, 30)); // let the label update first
  try {
    const [W, H] = frameSize();
    let pw, ph;
    if (ui.posterSize.value === 'wallpaper') [pw, ph] = [1290, 2796];
    else if (ui.posterSize.value === 'square') [pw, ph] = [2048, 2048];
    else {
      const k = 3840 / Math.max(W, H);
      [pw, ph] = [Math.round(W * k), Math.round(H * k)];
    }
    // Fill the poster shape, cropping the picture's edges if needed.
    const ar = pw / ph;
    const cw = W / H > ar ? H * ar : W, ch = W / H > ar ? H : W / ar;
    const crop = [(W - cw) / 2, (H - ch) / 2, cw, ch];

    const cols = +ui.posterCols.value;
    const aspect = squareCells() ? 1 : state.kind === 'braille' ? BRAILLE_ASPECT : TEXT_ASPECT;
    const cellW = pw / cols;
    const rows = Math.max(1, Math.round(ph / (cellW / aspect)));
    const cellH = ph / rows;
    const sub = state.kind === 'braille' ? [2, 4] : [1, 1];

    const sc = document.createElement('canvas');
    sc.width = cols * sub[0];
    sc.height = rows * sub[1];
    const sx = sc.getContext('2d', { willReadFrequently: true });
    const d = sampleFrame(sc, sx, crop, null, ui.mirror.checked, false, true);

    const pc = document.createElement('canvas');
    pc.width = pw;
    pc.height = ph;
    const pctx = pc.getContext('2d');
    pctx.fillStyle = BG;
    pctx.fillRect(0, 0, pw, ph);
    const job = { c: pctx, sample: sc, d, cols, rows, cellW, cellH, grid: new Int16Array(cols * rows), fx: null, photo: null };
    if (state.kind === 'emoji') {
      renderEmoji(job);
    } else {
      job.layer = document.createElement('canvas');
      job.layer.width = pw;
      job.layer.height = ph;
      job.lc = job.layer.getContext('2d');
      renderText(job);
      job.layer.width = job.layer.height = 0;
    }
    const blob = await new Promise((r) => pc.toBlob(r, 'image/png'));
    pc.width = pc.height = 0; // free the memory now (iOS caps canvas memory)
    dbg(`poster: ${pw}x${ph}, ${cols}x${rows} cells, ${(blob.size / 1e6).toFixed(1)} MB`);
    showPoster(blob, pw, ph, cols);
  } catch (err) {
    dbg('poster failed:', err.name, err.message);
    toast('Couldn’t make the poster');
  } finally {
    ui.makePoster.disabled = false;
    ui.makePoster.textContent = '🖼 Make poster';
  }
}

const poster = { url: null, file: null };

function showPoster(blob, w, h, cols) {
  if (poster.url) URL.revokeObjectURL(poster.url);
  poster.url = URL.createObjectURL(blob);
  poster.file = new File([blob], `emoji-fied-poster-${Date.now()}.png`, { type: 'image/png' });
  ui.posterImg.src = poster.url;
  ui.posterInfo.textContent = `PNG · ${w}×${h} · ${cols} columns · ${(blob.size / 1e6).toFixed(1)} MB`;
  ui.posterShare.hidden = !navigator.canShare?.({ files: [poster.file] });
  hostOverlays();
  ui.posterSheet.hidden = false;
}

function closePoster() {
  ui.posterSheet.hidden = true;
  ui.posterImg.removeAttribute('src');
  if (poster.url) URL.revokeObjectURL(poster.url);
  poster.url = poster.file = null;
}

// Stop whatever is showing (camera/screen tracks, or the file).
function stopCurrentSource() {
  state.stream?.getTracks().forEach((t) => t.stop());
  state.stream = null;
  media.screenAudio?.disconnect();
  media.screenAudio = null;
  if (state.fileUrl) {
    if (state.fileKind === 'video') {
      video.pause();
      video.removeAttribute('src');
      video.load();
    }
    gifStop();
    still.img = null;
    URL.revokeObjectURL(state.fileUrl);
    state.fileUrl = null;
    state.fileKind = null;
  }
}

function updateSourceUI() {
  for (const b of ui.sourceButtons) b.setAttribute('aria-pressed', String(b.dataset.source === state.source));
  ui.flip.disabled = state.source !== 'camera';
  // The Photo tab only exists for photos and GIFs.
  ui.photoTab.hidden = !isPhotoSource();
  if (!isPhotoSource() && currentTab === 'photo') setTab('look');
  // Head tracking uses the camera, so it ends when the source changes.
  if (!isPhotoSource() && (head.on || ui.headTrack.checked)) {
    ui.headTrack.checked = false;
    stopHeadTracking();
  }
}

async function useCamera() {
  const live = state.stream?.getVideoTracks()[0]?.readyState === 'live';
  if (state.source === 'camera' && live && ui.overlay.hidden) return;
  stopCurrentSource();
  state.source = 'camera';
  ui.mirror.checked = state.facing === 'user';
  updateSourceUI();
  const ok = await startCamera();
  if (ok) connectSoundInput().catch((err) => dbg('sound input failed:', err.name, err.message));
}

function chooseFile() {
  // Start audio inside the tap: iOS only allows it from a gesture.
  try { ensureAudioCtx(); } catch {}
  ui.fileInput.click();
}

async function playFile(file) {
  if (!file) return;
  const isGif = file.type === 'image/gif' || /\.gif$/i.test(file.name);
  if (isGif || file.type.startsWith('image/') || /\.(png|jpe?g|webp|heic|heif|avif|bmp)$/i.test(file.name)) {
    return playImage(file, isGif);
  }
  dbg(`video file: ${file.name}, ${(file.size / 1e6).toFixed(1)} MB, ${file.type}`);
  stopCurrentSource();
  state.source = 'file';
  state.fileKind = 'video';
  state.fileUrl = URL.createObjectURL(file);
  video.srcObject = null;
  video.muted = false;
  video.loop = true;
  video.src = state.fileUrl;
  // Route the soundtrack through Web Audio so it can drive "React to sound"
  // and go into recordings. (An element can only be connected once.)
  try {
    const ctx = ensureAudioCtx();
    if (!media.elSource) {
      media.elSource = ctx.createMediaElementSource(video);
      media.elSource.connect(ctx.destination);
    }
    // Let the soundtrack play even with the ringer switch on silent.
    if (navigator.audioSession && !sound.stream) navigator.audioSession.type = 'playback';
  } catch (err) {
    dbg('file audio routing failed:', err.name, err.message);
  }
  ui.mirror.checked = false;
  updateSourceUI();
  ui.status.textContent = 'Loading video…';
  await playVideo();
  if (!video.paused) {
    ui.overlay.hidden = true;
    ui.status.textContent = '';
  }
  layout();
  connectSoundInput().catch((err) => dbg('sound input failed:', err.name, err.message));
  toast(`🎞 ${file.name}`);
}

// GIFs animate through the app's own decoder; other images (and any GIF it
// can't read) are shown as a still picture.
async function playImage(file, isGif) {
  dbg(`image file: ${file.name}, ${(file.size / 1e6).toFixed(1)} MB, ${file.type}`);
  let decoded = null;
  if (isGif) {
    try {
      decoded = decodeGif(await file.arrayBuffer());
      if (!decoded.frames.length) throw new Error('no frames');
      if (decoded.width * decoded.height > 4e6) throw new Error(`too large (${decoded.width}x${decoded.height})`);
      dbg(`GIF: ${decoded.width}x${decoded.height}, ${decoded.frames.length} frames`);
    } catch (err) {
      dbg('GIF decode failed, showing it as a still:', err.message);
      decoded = null;
    }
  }
  const url = URL.createObjectURL(file);
  let img = null;
  if (!decoded) {
    img = new Image();
    img.src = url;
    try {
      await img.decode();
    } catch {
      URL.revokeObjectURL(url);
      toast('Couldn’t open that image');
      return;
    }
  }
  stopCurrentSource();
  state.source = 'file';
  state.fileKind = decoded ? 'gif' : 'image';
  state.fileUrl = url;
  if (decoded) gifStart(decoded);
  else still.img = img;
  ui.mirror.checked = false;
  updateSourceUI();
  ui.overlay.hidden = true;
  ui.status.textContent = '';
  layout();
  connectSoundInput().catch((err) => dbg('sound input failed:', err.name, err.message));
  startAssemble();
  setTab('photo'); // show what you can do with it
  toast(decoded ? `🎞 ${file.name} · ${decoded.frames.length} frames` : `🖼 ${file.name}`);
}

async function startScreen() {
  if (!canShareScreen()) {
    toast('Screen sharing isn’t available on this device');
    return;
  }
  try { ensureAudioCtx(); } catch {}
  let stream;
  try {
    // Must be called straight from the tap. Chrome offers "Share tab audio".
    stream = await navigator.mediaDevices.getDisplayMedia({ video: { frameRate: { ideal: 30 } }, audio: true });
  } catch (err) {
    dbg('getDisplayMedia failed:', err.name, err.message);
    if (err.name !== 'NotAllowedError' && err.name !== 'AbortError') toast('Couldn’t share the screen');
    return;
  }
  stopCurrentSource();
  state.source = 'screen';
  state.stream = stream;
  const vt = stream.getVideoTracks()[0];
  vt?.addEventListener('ended', () => {
    if (state.stream !== stream) return;
    dbg('screen sharing ended');
    stopCurrentSource();
    state.source = 'camera';
    updateSourceUI();
    ui.status.textContent = 'Screen sharing stopped.';
    ui.overlay.hidden = false;
  });
  const at = stream.getAudioTracks()[0];
  if (at && sound.ctx) media.screenAudio = sound.ctx.createMediaStreamSource(new MediaStream([at]));
  // The shared tab is already playing its own sound, so don't play it twice.
  video.muted = true;
  video.loop = false;
  video.srcObject = stream;
  ui.mirror.checked = false;
  updateSourceUI();
  await playVideo();
  if (!video.paused) {
    ui.overlay.hidden = true;
    ui.status.textContent = '';
  }
  layout();
  connectSoundInput().catch((err) => dbg('sound input failed:', err.name, err.message));
  toast(at ? '🖥 Sharing with sound' : '🖥 Sharing (no sound: tick “Share tab audio” to include it)');
  dbg(`screen sharing: ${vt?.label}, audio=${!!at}`);
}

// Audio a recording should carry: the file's soundtrack, the shared tab's
// sound, or the microphone when "React to sound" is on.
function recordingAudioTracks() {
  const live = (t) => t.readyState === 'live';
  if (state.source === 'file' && state.fileKind === 'video' && media.elSource) {
    if (!media.recDest) {
      media.recDest = sound.ctx.createMediaStreamDestination();
      media.elSource.connect(media.recDest);
    }
    return media.recDest.stream.getAudioTracks().filter(live);
  }
  if (state.source === 'screen' && state.stream) return state.stream.getAudioTracks().filter(live);
  return sound.stream ? sound.stream.getAudioTracks().filter(live) : [];
}

// Resolve once the video is playing. If the browser refuses or stalls
// (iOS needs a fresh tap in some cases), ask for one more tap.
async function playVideo() {
  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(Object.assign(new Error('timeout'), { name: 'TimeoutError' })), 4000)
  );
  try {
    await Promise.race([video.play(), timeout]);
    dbg('video.play() ok');
  } catch (err) {
    dbg('video.play() failed:', err.name, err.message, 'paused=' + video.paused);
    if (!video.paused) return;
    ui.error.textContent = '';
    ui.status.textContent = 'Safari needs one more tap to start the video.';
    ui.start.textContent = 'Tap to start';
    ui.overlay.hidden = false;
    ui.start.onclick = () => {
      video.play().catch(() => {});
      ui.overlay.hidden = true;
      ui.status.textContent = '';
      ui.start.textContent = 'Start camera';
      ui.start.onclick = null;
    };
  }
}

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

// Snapshots go into a tray (in memory, this tab only) rather than
// straight to a download: a download can pop up a prompt or a downloads
// bar, take the focus and drop you out of full screen mid-show. You save
// them from the tray (Photo's badge, or 🖼 under the toolbar) afterwards.
const snaps = []; // { blob, url, name }
const MAX_SNAPS = 60;

function snapshot({ quiet = false } = {}) {
  if (!hasSource()) {
    if (!quiet) toast('Start the camera or a video first');
    return;
  }
  out.toBlob((blob) => {
    if (!blob) return;
    const d = new Date(), pad = (n) => String(n).padStart(2, '0');
    const name = `emoji-fied-${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}-${snaps.length + 1}.png`;
    snaps.push({ blob, url: URL.createObjectURL(blob), name });
    if (snaps.length > MAX_SNAPS) URL.revokeObjectURL(snaps.shift().url);
    syncSnaps();
    ui.snap.classList.remove('snapped');
    void ui.snap.offsetWidth;
    ui.snap.classList.add('snapped');
    if (!quiet) liveToast(`📸 Kept in Snapshots (${snaps.length})`);
  }, 'image/png');
}

function syncSnaps() {
  const n = snaps.length;
  ui.snapBadge.hidden = !n;
  ui.snapBadge.textContent = n;
  ui.snapTray.hidden = !n;
  ui.snapTray.textContent = `🖼 ${n} snapshot${n === 1 ? '' : 's'} · save or share`;
  ui.snapsItem.textContent = n ? `🖼 Snapshots (${n})` : '🖼 Snapshots';
  ui.snapsItem.disabled = !n;
  if (!ui.snapSheet.hidden) renderSnapGrid();
}

function renderSnapGrid() {
  ui.snapGrid.replaceChildren(
    ...snaps.map((snap) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.title = `Save ${snap.name}`;
      const img = document.createElement('img');
      img.src = snap.url;
      img.alt = snap.name;
      b.append(img);
      b.addEventListener('click', () => saveSnaps([snap]));
      return b;
    })
  );
}

function openSnaps() {
  if (!snaps.length) return;
  closeMenu();
  renderSnapGrid();
  ui.snapSheet.hidden = false;
}

function closeSnaps() {
  ui.snapSheet.hidden = true;
}

// Phones and Safari share the files (to Photos, AirDrop...); elsewhere
// they download one after another.
async function saveSnaps(list) {
  const files = list.map((s) => new File([s.blob], s.name, { type: 'image/png' }));
  if (navigator.canShare?.({ files })) {
    try {
      await navigator.share({ files });
      return;
    } catch (err) {
      if (err.name === 'AbortError') return;
    }
  }
  list.forEach((snap, i) =>
    setTimeout(() => {
      const a = document.createElement('a');
      a.href = snap.url;
      a.download = snap.name;
      a.click();
    }, i * 250)
  );
}

function clearSnaps() {
  for (const snap of snaps) URL.revokeObjectURL(snap.url);
  snaps.length = 0;
  syncSnaps();
  closeSnaps();
}

// ---- More menu and shortcuts ------------------------------------------------

function toggleMenu(open = ui.moreMenu.hidden) {
  ui.moreMenu.hidden = !open;
  ui.moreBtn.setAttribute('aria-expanded', String(open));
}
const closeMenu = () => toggleMenu(false);

function toggleKeys(open = ui.keysSheet.hidden) {
  closeMenu();
  ui.keysSheet.hidden = !open;
}

function frameAsText() {
  const { cols, rows, lastGlyphs, palette, kind } = state;
  const blank = kind === 'emoji' ? '　' : ' ';
  const lines = [];
  for (let y = 0; y < rows; y++) {
    let line = '';
    for (let x = 0; x < cols; x++) {
      const i = lastGlyphs[y * cols + x];
      line += i < 0 ? blank : palette.entries[i].glyph;
    }
    lines.push(line.trimEnd());
  }
  return lines.join('\n');
}

async function copyText() {
  try {
    await navigator.clipboard.writeText(frameAsText());
    toast('Copied to clipboard');
  } catch {
    toast('Clipboard unavailable');
  }
}

// ---------------------------------------------------------------------------
// Randomize
// ---------------------------------------------------------------------------

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const between = (lo, hi) => lo + Math.random() * (hi - lo);

// Pick a random look. Ranges are kept to values that look good and stay
// fast on phones (detail is capped well below the slider's maximum).
function randomize({ quiet = false, keepDetail = false } = {}) {
  forgetTried();
  ui.random.classList.remove('spin');
  void ui.random.offsetWidth; // restart the animation
  ui.random.classList.add('spin');
  const styles = [...ui.style.options].map((o) => o.value).filter((v) => v !== 'custom');
  let style;
  if (Math.random() < 0.2) {
    // Occasionally invent a custom emoji set.
    const pool = graphemes(EMOJI_SETS.everything).filter((g) => g.trim());
    const n = 4 + Math.floor(Math.random() * 5);
    ui.custom.value = Array.from({ length: n }, () => pick(pool)).join('');
    style = 'custom';
  } else {
    do style = pick(styles);
    while (style === ui.style.value && styles.length > 1);
  }

  ui.style.value = style;
  if (!keepDetail) ui.cols.value = Math.round(between(32, 110));
  ui.contrast.value = between(0.9, 1.8).toFixed(2);
  ui.bright.value = between(-0.08, 0.15).toFixed(2);
  ui.sat.value = between(0.8, 1.8).toFixed(2);
  ui.shadows.value = between(-0.2, 0.4).toFixed(2);
  ui.highlights.value = between(-0.4, 0.2).toFixed(2);
  ui.invert.checked = Math.random() < 0.15;
  ui.ink.value = pick([...ui.ink.options].map((o) => o.value));
  applyStyle(); // also resets "Match by" to the set's default
  if (state.kind === 'emoji' && style !== 'emoji:faces' && Math.random() < 0.3) ui.match.value = 'brightness';
  syncLabels();
  if (state.paused) render();

  const name = style === 'custom' ? ui.custom.value : ui.style.selectedOptions[0].textContent;
  const look = state.kind === 'emoji' ? '' : ` · ${ui.ink.selectedOptions[0].textContent}`;
  if (!quiet) toast(`🎲 ${name}${look}${ui.invert.checked ? ' · inverted' : ''}`);
  dbg(`randomize: ${style}, ink=${ui.ink.value}, cols=${ui.cols.value}, contrast=${ui.contrast.value}, bright=${ui.bright.value}, sat=${ui.sat.value}, shadows=${ui.shadows.value}, highlights=${ui.highlights.value}, invert=${ui.invert.checked}, match=${ui.match.value}`);
}

// ---------------------------------------------------------------------------
// React to sound
// ---------------------------------------------------------------------------

const sound = {
  stream: null,
  ctx: null,
  analyser: null,
  buf: null,
  level: 0, // 0..1, smoothed loudness relative to recent peaks
  peak: 0.02,
  avg: 0,
  lastBeat: 0,
  lastShuffle: 0,
  beats: 0, // counted for "Shuffle the look every N beats"
  kick: 0, // 1 on a beat, decays quickly: flash, shake, zoom punch
  hue: 0, // degrees of hue shift, kicked on beats, eases back to 0
  ripples: [], // beat waves: { t0, shape, rot, spin, dir, hue, maxD }
  lastShape: '',
};

const RIPPLE_MS = 850;

// ---- Beat shapes -----------------------------------------------------------
// Each beat sends a wave outward in a shape. A shape is a "distance" that
// grows linearly from the centre (degree-1 homogeneous), so the wave front at
// distance R is the shape's outline scaled to R. Curvy shapes use a polar
// table: the outline's radius at each angle (y up), normalised to max 1.

const POLAR_STEPS = 360;

function polarTable(radiusAt) {
  const t = new Float32Array(POLAR_STEPS);
  for (let i = 0; i < POLAR_STEPS; i++) t[i] = radiusAt((i / POLAR_STEPS) * Math.PI * 2);
  const max = Math.max(...t);
  for (let i = 0; i < POLAR_STEPS; i++) t[i] = Math.max(t[i] / max, 0.05);
  return t;
}

// Classic implicit heart (x² + y² − 1)³ − x²y³ ≤ 0, centred on its box.
const HEART = polarTable((a) => {
  const cx = 0, cy = 0.1;
  const inside = (r) => {
    const x = cx + r * Math.cos(a), y = cy + r * Math.sin(a);
    const q = x * x + y * y - 1;
    return q * q * q - x * x * y * y * y <= 0;
  };
  let lo = 0, hi = 0.02;
  while (inside(hi) && hi < 3) { lo = hi; hi += 0.02; }
  for (let i = 0; i < 20; i++) { const m = (lo + hi) / 2; if (inside(m)) lo = m; else hi = m; }
  return lo;
});

// Five-pointed star: nearest hit of the ray on the star polygon.
const STAR = polarTable((a) => {
  const pts = Array.from({ length: 10 }, (_, k) => {
    const ang = Math.PI / 2 + (k * Math.PI) / 5, r = k % 2 ? 0.42 : 1;
    return [r * Math.cos(ang), r * Math.sin(ang)];
  });
  const dx = Math.cos(a), dy = Math.sin(a);
  let best = Infinity;
  for (let k = 0; k < 10; k++) {
    const [x1, y1] = pts[k], [x2, y2] = pts[(k + 1) % 10];
    const ex = x2 - x1, ey = y2 - y1, den = dx * ey - dy * ex;
    if (Math.abs(den) < 1e-9) continue;
    const t = (x1 * ey - y1 * ex) / den, u = (x1 * dy - y1 * dx) / den;
    if (t > 0 && u >= 0 && u <= 1) best = Math.min(best, t);
  }
  return best;
});

const polarDist = (table) => (dx, dy, rot) => {
  let a = Math.atan2(-dy, dx) - rot;
  a = ((a % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
  return Math.hypot(dx, dy) / table[Math.floor((a / (Math.PI * 2)) * POLAR_STEPS) % POLAR_STEPS];
};

const SHAPES = {
  circle: (dx, dy) => Math.hypot(dx, dy),
  square: (dx, dy) => Math.max(Math.abs(dx), Math.abs(dy)),
  diamond: (dx, dy) => (Math.abs(dx) + Math.abs(dy)) * 0.75,
  hexagon: (dx, dy) => { const ax = Math.abs(dx), ay = Math.abs(dy); return Math.max(ax * 0.866 + ay * 0.5, ay); },
  heart: polarDist(HEART),
  star: polarDist(STAR),
};
const SHAPE_NAMES = [...Object.keys(SHAPES), 'sweep'];

// Distance of canvas point (px, py) from the wave's origin, in that shape.
function waveDist(rp, px, py, rot) {
  if (rp.shape === 'sweep') {
    return rp.dir === 0 ? py : rp.dir === 1 ? out.height - py : rp.dir === 2 ? px : out.width - px;
  }
  return SHAPES[rp.shape](px - out.width / 2, py - out.height / 2, rot);
}

function spawnWave(now) {
  let shape = ui.beatShape.value;
  if (shape === 'off') return; // beats still swell, flash and shift colour
  if (shape === 'mix') {
    do shape = pick(SHAPE_NAMES);
    while (shape === sound.lastShape);
  }
  sound.lastShape = shape;
  const rp = {
    t0: now,
    shape,
    rot: Math.random() * Math.PI * 2,
    spin: (Math.random() < 0.5 ? -1 : 1) * 1.2, // radians over the wave's life (stars)
    dir: Math.floor(Math.random() * 4),
    hue: Math.floor(Math.random() * 360),
  };
  if (shape !== 'star') rp.rot = rp.spin = 0; // only stars spin; hearts stay upright
  // Size the wave so the whole shape is on screen for most of its life: it
  // grows to 1.5x the size at which it first touches the border, fading out
  // as it slips off the edges. (Sweeps cross the whole picture.)
  const W = out.width, H = out.height;
  if (shape === 'sweep') {
    rp.maxD = rp.dir < 2 ? H : W;
  } else {
    let fit = Infinity;
    for (let i = 0; i <= 48; i++) {
      const f = i / 48;
      for (const [px, py] of [[f * W, 0], [f * W, H], [0, f * H], [W, f * H]]) fit = Math.min(fit, waveDist(rp, px, py, rp.rot));
    }
    rp.maxD = fit * 1.5;
  }
  sound.ripples = sound.ripples.filter((w) => now - w.t0 < RIPPLE_MS).concat(rp).slice(-4);
}

// Glowing outline of each live wave, drawn on top of the glyphs.
function drawBeatOutlines(c, fx) {
  if (!ui.beatOutline.checked || !fx.ripples.length) return;
  const cell = Math.max(state.cellW, state.cellH);
  c.save();
  c.lineJoin = 'round';
  c.lineCap = 'round';
  c.globalCompositeOperation = 'lighter'; // additive: a neon glow over the glyphs
  for (const rp of fx.ripples) {
    const alpha = Math.min(1, fx.strength) * (rp.age < 0.6 ? 1 : 1 - (rp.age - 0.6) / 0.4);
    const path = new Path2D();
    if (rp.shape === 'sweep') {
      const R = rp.r;
      if (rp.dir < 2) {
        const y = rp.dir === 0 ? R : out.height - R;
        path.moveTo(0, y); path.lineTo(out.width, y);
      } else {
        const x = rp.dir === 2 ? R : out.width - R;
        path.moveTo(x, 0); path.lineTo(x, out.height);
      }
    } else {
      const cx = out.width / 2, cy = out.height / 2;
      for (let i = 0; i <= 120; i++) {
        const a = (i / 120) * Math.PI * 2, ux = Math.cos(a), uy = -Math.sin(a);
        const r = rp.r / SHAPES[rp.shape](ux, uy, rp.rotNow);
        if (i) path.lineTo(cx + ux * r, cy + uy * r);
        else path.moveTo(cx + ux * r, cy + uy * r);
      }
      path.closePath();
    }
    c.strokeStyle = `hsla(${rp.hue}, 100%, 60%, ${(alpha * 0.35).toFixed(3)})`;
    c.lineWidth = cell * 2.2;
    c.stroke(path);
    c.strokeStyle = `hsla(${rp.hue}, 100%, 65%, ${(alpha * 0.9).toFixed(3)})`;
    c.lineWidth = cell * 0.9;
    c.stroke(path);
    // Solid core on top, so the colour holds even over bright glyphs.
    c.globalCompositeOperation = 'source-over';
    c.strokeStyle = `hsla(${rp.hue}, 100%, 70%, ${alpha.toFixed(3)})`;
    c.lineWidth = Math.max(3, cell * 0.35);
    c.stroke(path);
    c.globalCompositeOperation = 'lighter';
  }
  c.restore();
}

// The Beat tab: sound (microphone, or a video's or tab's own audio), MIDI
// and a tempo can each drive the effects; "On the beat" says what they do.
const micOn = () => ui.mic.checked;

// Per-frame sound effects for the renderer, or null when off or silent.
function soundFx() {
  if (!(sound.analyser || midi.on || tempoOn())) return null;
  const strength = +ui.fxStrength.value;
  if (strength <= 0) return null;
  const now = performance.now();
  const ripples = [];
  for (const rp of sound.ripples) {
    const age = (now - rp.t0) / RIPPLE_MS;
    if (age >= 1) continue;
    ripples.push({
      ...rp,
      age,
      r: age * rp.maxD,
      w: rp.maxD * (rp.shape === 'sweep' ? 0.12 : 0.2),
      amp: strength * 1.5 * (1 - age),
      rotNow: rp.rot + rp.spin * age,
    });
  }
  const flash = ui.beatFlash.checked;
  const fx = {
    swell: ui.beatPulse.checked ? strength * sound.level * 1.5 : 0,
    kick: flash ? strength * sound.kick : 0,
    hue: flash ? strength * (sound.hue + midi.bend * 90) : 0,
    ripples,
    strength,
    cx: out.width / 2,
    cy: out.height / 2,
  };
  if (fx.swell < 0.02 && fx.kick < 0.02 && !ripples.length && Math.abs(fx.hue) < 0.5) return null;
  return fx;
}

// Whole-picture zoom that kicks inward on beats.
function zoomPunch(c, fx) {
  const z = 1 + fx.swell * 0.04 + fx.kick * 0.1;
  c.setTransform(z, 0, 0, z, fx.cx * (1 - z), fx.cy * (1 - z));
}

// Draw one glyph. Without effects it's a plain blit; with them it adds the
// sound effects (swell, brighter cells more; passing beat waves; shake) and
// the photo effects (twinkle glints, assemble fly-in) and the Tetris build.
function drawCell(c, pal, e, x, y, cellW, cellH, fx, photo, bright) {
  if (!fx && !photo) {
    c.drawImage(pal.atlas, e.sx, e.sy, pal.cw, pal.ch, x * cellW, y * cellH, cellW, cellH);
    return;
  }
  let k = 1, ox = 0, oy = 0;
  if (photo) {
    const pc = photoCell(photo, x, y);
    if (pc.k <= 0.01) return; // still waiting to fly in
    k = pc.k;
    ox = pc.ox;
    oy = pc.oy;
  }
  if (!fx) {
    const w = cellW * k, h = cellH * k;
    c.drawImage(pal.atlas, e.sx, e.sy, pal.cw, pal.ch, x * cellW - (w - cellW) / 2 + ox, y * cellH - (h - cellH) / 2 + oy, w, h);
    return;
  }
  k *= 1 + fx.swell * (0.3 + 0.7 * bright);
  if (fx.ripples.length) {
    const px = (x + 0.5) * cellW, py = (y + 0.5) * cellH;
    for (const rp of fx.ripples) {
      const t = 1 - Math.abs(waveDist(rp, px, py, rp.rotNow) - rp.r) / rp.w;
      if (t > 0) k += rp.amp * t;
    }
  }
  const w = cellW * k, h = cellH * k;
  let dx = x * cellW - (w - cellW) / 2 + ox, dy = y * cellH - (h - cellH) / 2 + oy;
  if (fx.kick > 0.05) {
    dx += (Math.random() - 0.5) * cellW * fx.kick;
    dy += (Math.random() - 0.5) * cellH * fx.kick;
  }
  c.drawImage(pal.atlas, e.sx, e.sy, pal.cw, pal.ch, dx, dy, w, h);
}

// The analyser listens to the source's own sound when it has one (a video
// file's soundtrack, a shared tab's audio), otherwise to the microphone.
// Called when sound is turned on and whenever the source changes.
async function connectSoundInput() {
  if (!micOn()) return;
  // Create/resume the audio context synchronously inside the user's tap;
  // iOS only lets audio start from a gesture.
  const ctx = ensureAudioCtx();
  if (!sound.analyser) {
    sound.analyser = ctx.createAnalyser();
    sound.analyser.fftSize = 1024;
    sound.analyser.smoothingTimeConstant = 0;
    sound.buf = new Float32Array(sound.analyser.fftSize);
    sound.peak = 0.01;
    sound.avg = 0;
  }
  if (sound.input) {
    try { sound.input.disconnect(sound.analyser); } catch {}
    sound.input = null;
  }
  let node =
    state.source === 'file' && state.fileKind === 'video' ? media.elSource
    : state.source === 'screen' ? media.screenAudio
    : null;
  if (node) {
    releaseMic();
    dbg(`sound: listening to the ${state.source}'s audio`);
  } else {
    if (!sound.stream) {
      dbg('requesting microphone');
      if (navigator.audioSession) navigator.audioSession.type = 'auto';
      // Raw signal: echo cancellation, noise suppression and auto gain would
      // flatten music and claps.
      sound.stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
      });
      sound.micNode = ctx.createMediaStreamSource(sound.stream);
      dbg(`microphone on, audio context ${ctx.state}, ${ctx.sampleRate} Hz`);
    }
    node = sound.micNode;
  }
  node.connect(sound.analyser); // not connected to the speakers: no feedback
  sound.input = node;
}

function releaseMic() {
  sound.stream?.getTracks().forEach((t) => t.stop());
  sound.stream = null;
  sound.micNode = null;
}

function stopMic() {
  if (sound.input && sound.analyser) {
    try { sound.input.disconnect(sound.analyser); } catch {}
  }
  sound.input = null;
  releaseMic();
  sound.analyser = null;
  sound.level = 0;
  sound.kick = 0;
  sound.hue = 0;
  sound.ripples = [];
  ui.meterFill.style.transform = 'scaleX(0)';
  dbg('microphone off');
}

// Each source on the Beat tab shows its own settings while it's on.
function syncSoundUI() {
  ui.micOpts.hidden = !micOn();
  ui.midiOpts.hidden = !ui.midi.checked;
  ui.tempoBox.hidden = !ui.tempoSync.checked;
  ui.meter.hidden = !micOn() && !midi.on;
  ui.soundDot.hidden = !micOn() && !ui.midi.checked && !ui.tempoSync.checked; // a dot on the tab while any is on
  const what = state.source === 'file' && state.fileKind === 'video' ? 'the video’s sound'
    : state.source === 'screen' && media.screenAudio ? 'the shared tab’s sound' : 'the microphone';
  ui.micStatus.textContent = `Listening to ${what}.`;
}

async function onSoundModeChange() {
  syncSoundUI();
  if (!micOn()) {
    stopMic();
    return;
  }
  if (sound.analyser) return;
  try {
    await connectSoundInput();
    syncSoundUI();
    toast(`🎤 ${ui.micStatus.textContent}`);
  } catch (err) {
    dbg('microphone failed:', err.name, err.message);
    ui.mic.checked = false;
    syncSoundUI();
    toast(err.name === 'NotAllowedError' ? 'Microphone permission was denied' : 'Couldn’t start the microphone');
  }
}

// Called every frame: measure loudness, smooth it, and detect beats.
function updateSound() {
  if (midi.on) updateMidi();
  if (!sound.analyser) {
    if (!midi.on && !tempoOn()) return;
    // MIDI or tempo only: notes and beats set the kick and hue, held
    // notes the level.
    sound.kick *= 0.86;
    sound.hue *= 0.96;
    sound.level = midi.on ? midi.level : 0;
    ui.meterFill.style.transform = `scaleX(${sound.level.toFixed(3)})`;
    return;
  }
  if (sound.ctx.state === 'suspended') return; // resumed on the next tap
  if (sound.analyser.getFloatTimeDomainData) {
    sound.analyser.getFloatTimeDomainData(sound.buf);
  } else {
    const bytes = new Uint8Array(sound.buf.length);
    sound.analyser.getByteTimeDomainData(bytes);
    for (let i = 0; i < bytes.length; i++) sound.buf[i] = (bytes[i] - 128) / 128;
  }
  let sum = 0;
  for (let i = 0; i < sound.buf.length; i++) sum += sound.buf[i] * sound.buf[i];
  const rms = Math.sqrt(sum / sound.buf.length);

  // Adaptive gain: compare against the loudest recent sound (forgotten
  // within a second or two), so quiet rooms and loud music both fill the
  // range. Phone mics give a quiet raw signal, so the floors are low; the
  // power curve lifts quiet sounds further. Sensitivity scales it all.
  const sens = +ui.sens.value;
  sound.peak = Math.max(rms, sound.peak * 0.992, 0.006 / sens);
  const g = Math.max(0, rms - 0.0012 / sens) / sound.peak;
  const target = Math.min(1, Math.pow(g * (0.5 + sens * 0.35), 0.6));
  // Fast attack, quick release, so it tracks every syllable and drum hit.
  sound.level = target > sound.level ? sound.level + (target - sound.level) * 0.75 : sound.level * 0.82;
  if (midi.on) sound.level = Math.max(sound.level, midi.level);

  // Beat: a jump above the recent average loudness.
  const now = performance.now();
  const isBeat = rms > sound.avg * (1 + 0.9 / sens) && rms > 0.004 / sens && now - sound.lastBeat > 160;
  sound.avg = sound.avg * 0.93 + rms * 0.07;
  sound.kick *= 0.86;
  sound.hue *= 0.96;
  // With tempo sync on, the beat comes from the tempo, not the microphone.
  if (isBeat && !tempoOn()) beatHit(now, 1, randomHueKick());
  ui.meterFill.style.transform = `scaleX(${sound.level.toFixed(3)})`;
}

const randomHueKick = () => (Math.random() < 0.5 ? -1 : 1) * (50 + Math.random() * 60);

// What every beat does, heard, played or from the tempo ("On the beat"):
// the kick (flash, shake, zoom punch) and hue nudge, a beat shape, the
// meter flash, a look shuffle every so many beats, and Tetris drops (a
// played note drops them where its pitch says).
function beatHit(now, power, hueNudge, note) {
  sound.lastBeat = now;
  sound.kick = Math.max(sound.kick, power);
  sound.hue += hueNudge;
  spawnWave(now);
  ui.meter.classList.remove('beat');
  void ui.meter.offsetWidth;
  ui.meter.classList.add('beat');
  sound.beats++;
  const every = +ui.beatShuffle.value;
  if (every && sound.beats % every === 0 && hasSource() && !state.paused && now - sound.lastShuffle > 300) {
    sound.lastShuffle = now;
    randomize({ quiet: true, keepDetail: true });
  }
  if (ui.beatTetris.checked) note ? tetrisNote(note.n, note.vel, now) : tetrisBeat(now);
}

// ---- MIDI ------------------------------------------------------------------
// A keyboard, drum pads or any app sending MIDI (Web MIDI: Chrome, Edge and
// Firefox; Safari doesn't have it). Each note hits like a beat, as hard as
// it was played, its pitch nudging the hues; held notes swell the glyphs,
// the pitch bend wheel shifts the hues and the mod wheel adds swell. With
// Tetris on, notes drop the pieces.

const midi = {
  on: false,
  access: null,
  devices: 0,
  held: new Map(), // note -> velocity 0..1
  level: 0,
  bend: 0, // -1..1
  mod: 0, // 0..1
  lastNote: 0,
  names: [],
  lo: 60, // the range of notes played so far, for Tetris bands
  hi: 72,
};

function updateMidi() {
  let target = midi.mod * 0.8;
  for (const v of midi.held.values()) target = Math.max(target, 0.35 + 0.65 * v);
  midi.level = target > midi.level ? midi.level + (target - midi.level) * 0.6 : midi.level * 0.9;
}

function onMidiMessage(e) {
  const [status, a = 0, b = 0] = e.data;
  if (status >= 0xf8) return onMidiRealtime(status, e.timeStamp); // clock, start, stop
  const type = status & 0xf0;
  // Notes and controllers mapped with MIDI learn (or being learned) only
  // work their control.
  if ((type === 0x80 || type === 0x90 || type === 0xb0) && midiControl(type, (status & 0x0f) + 1, a, b)) return;
  if (!midi.on) return; // "React to MIDI" is off
  const now = performance.now();
  if (type === 0x90 && b > 0) {
    const vel = b / 127;
    midi.held.set(a, vel);
    midi.lastNote = now;
    midi.lo = Math.min(midi.lo, a);
    midi.hi = Math.max(midi.hi, a);
    // As hard as it was played; each pitch nudges the hue its own way.
    beatHit(now, 0.4 + 0.6 * vel, ((a % 12) - 5.5) * 12 * (0.5 + vel), { n: a, vel });
  } else if (type === 0x80 || type === 0x90) {
    midi.held.delete(a);
  } else if (type === 0xb0) {
    if (a === 1) midi.mod = b / 127; // mod wheel
    if (a === 120 || a === 123) midi.held.clear(); // all sound / notes off
  } else if (type === 0xe0) {
    midi.bend = (((b << 7) | a) - 8192) / 8192;
  }
}

// Every input gets the handler as soon as there's access: "React to MIDI",
// MIDI learn and MIDI clock all listen through it.
function connectMidiInputs() {
  const names = [];
  for (const input of midi.access.inputs.values()) {
    input.onmidimessage = onMidiMessage;
    if (input.state !== 'disconnected') names.push(input.name || 'MIDI device');
  }
  if (names.length && !midi.devices) toast(`🎹 ${names[0]} connected`);
  midi.devices = names.length;
  midi.names = names;
  syncMidiStatus();
}

const MIDI_HINT = ui.midiStatus.textContent;
function syncMidiStatus() {
  ui.midiStatus.textContent = !midi.on ? MIDI_HINT
    : midi.devices ? `🎹 Listening to ${midi.names.join(', ')}. Play away!`
    : 'No MIDI device found. Plug one in (or turn on a virtual MIDI port) and it connects by itself.';
}

// Ask for MIDI once; quiet: no toasts (connecting by itself on load).
async function midiAccess(quiet = false) {
  if (midi.access) return midi.access;
  if (!navigator.requestMIDIAccess) {
    if (!quiet) toast('MIDI needs Chrome, Edge or Firefox on a computer');
    return null;
  }
  try {
    midi.access = await navigator.requestMIDIAccess();
  } catch (err) {
    dbg('MIDI failed:', err.name, err.message);
    if (!quiet) toast(err.name === 'SecurityError' || err.name === 'NotAllowedError' ? 'MIDI permission was denied' : 'Couldn’t start MIDI');
    return null;
  }
  midi.access.onstatechange = connectMidiInputs;
  connectMidiInputs();
  return midi.access;
}

async function enableMidi() {
  if (!(await midiAccess())) {
    ui.midi.checked = false;
    return;
  }
  if (!ui.midi.checked) return; // turned off while the permission prompt was up
  midi.on = true;
  syncMidiStatus();
  syncSoundUI();
  dbg(`MIDI on, ${midi.devices} input(s)`);
}

function disableMidi() {
  midi.on = false;
  midi.held.clear();
  midi.level = midi.bend = midi.mod = 0;
  if (!sound.analyser && !tempoOn()) {
    sound.level = sound.kick = sound.hue = 0;
    sound.ripples = [];
    ui.meterFill.style.transform = 'scaleX(0)';
  }
  syncMidiStatus();
  syncSoundUI();
}

// iOS may leave the audio context suspended until a tap; resume on any tap.
document.addEventListener('touchend', () => sound.ctx?.state === 'suspended' && sound.ctx.resume(), true);
document.addEventListener('click', () => sound.ctx?.state === 'suspended' && sound.ctx.resume(), true);

// ---------------------------------------------------------------------------
// Full screen & TV
// ---------------------------------------------------------------------------

// Native element full screen where supported (iPad, Mac, Android, desktop).
// iPhone Safari doesn't allow it for anything but <video>, so there we fill
// the page instead ("immersive"). Installing to the Home Screen removes
// Safari's toolbars too.
const fullscreenElement = () => document.fullscreenElement || document.webkitFullscreenElement;
const nativeFullscreenOK = () =>
  !!(document.fullscreenEnabled || document.webkitFullscreenEnabled) &&
  !!(ui.stage.requestFullscreen || ui.stage.webkitRequestFullscreen);
const isFull = () => !!fullscreenElement() || document.body.classList.contains('immersive');

// In native full screen only the full-screen element is displayed, so the
// toast and the clip preview move inside it while it's active.
function hostOverlays() {
  const host = fullscreenElement() || document.body;
  for (const el of [ui.clip, ui.player, ui.posterSheet, ui.toast]) if (el.parentNode !== host) host.appendChild(el);
}

async function enterFullscreen() {
  if (isFull()) return;
  let native = false;
  if (nativeFullscreenOK()) {
    try {
      if (ui.stage.requestFullscreen) await ui.stage.requestFullscreen();
      else ui.stage.webkitRequestFullscreen();
      native = true;
    } catch (err) {
      dbg('native fullscreen failed:', err.name, err.message);
    }
  }
  if (!native) document.body.classList.add('immersive');
  dbg(`fullscreen on (${native ? 'native' : 'immersive'})`);
  onFullscreenChange();
}

function exitFullscreen() {
  ui.tvHint.hidden = true;
  if (fullscreenElement()) (document.exitFullscreen || document.webkitExitFullscreen).call(document);
  document.body.classList.remove('immersive');
  onFullscreenChange();
}

function onFullscreenChange() {
  hostOverlays();
  const full = isFull();
  ui.exitFull.hidden = !full;
  ui.stage.classList.toggle('is-full', full);
  if (!full) ui.tvHint.hidden = true;
  keepAwake(full);
  if (full) wakeControls();
}

// Keep the screen on while full screen (e.g. mirrored to a TV).
let wakeLock = null;
async function keepAwake(on) {
  try {
    if (on && !wakeLock && navigator.wakeLock && document.visibilityState === 'visible') {
      wakeLock = await navigator.wakeLock.request('screen');
      wakeLock.addEventListener('release', () => (wakeLock = null));
      dbg('screen wake lock on');
    } else if (!on && wakeLock) {
      await wakeLock.release();
      wakeLock = null;
    }
  } catch (err) {
    dbg('wake lock failed:', err.name, err.message);
  }
}

// In full screen, the on-picture buttons fade out after a few seconds and
// come back on any touch.
let idleTimer = 0;
function wakeControls() {
  ui.stage.classList.remove('idle');
  clearTimeout(idleTimer);
  if (isFull()) idleTimer = setTimeout(() => ui.stage.classList.add('idle'), 3000);
}

function tvSteps() {
  const ua = navigator.userAgent;
  const ios = /iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
  const mac = /Macintosh/.test(ua) && !ios;
  if (ios) {
    return [
      'Open <b>Control Center</b>: swipe down from the top-right corner.',
      'Tap <b>Screen Mirroring</b>.',
      'Choose your <b>Apple TV</b> or AirPlay TV.',
      'Turn your phone sideways for a bigger picture.',
    ];
  }
  if (mac) {
    return [
      'Click <b>Control Center</b> in the menu bar.',
      'Click <b>Screen Mirroring</b>.',
      'Choose your <b>Apple TV</b> or AirPlay TV.',
    ];
  }
  return [
    'Use your device’s <b>screen casting</b>, e.g. Android Quick Settings → <b>Cast</b>, or Chrome ⋮ → <b>Cast…</b>',
    'Choose your TV.',
  ];
}

// ---- Live player: the art in a native <video> -------------------------------
// The output canvas is streamed into a native video element, which gets the
// system's AirPlay picker, Picture in Picture and true full screen (on iPhone
// too, via webkitEnterFullscreen). Whether AirPlay accepts a live,
// canvas-generated stream is up to the OS, so the outcome is logged.

const live = { stream: null };

const hasAirplayPicker = (v) => typeof v.webkitShowPlaybackTargetPicker === 'function';
const canAirplay = (v) => hasAirplayPicker(v) || typeof v.remote?.prompt === 'function';
const canPip = (v) =>
  (document.pictureInPictureEnabled && typeof v.requestPictureInPicture === 'function') ||
  !!v.webkitSupportsPresentationMode?.('picture-in-picture');
const inPip = (v) => document.pictureInPictureElement === v || v.webkitPresentationMode === 'picture-in-picture';

async function showAirplay(v) {
  if (hasAirplayPicker(v)) {
    v.webkitShowPlaybackTargetPicker();
    dbg(`AirPlay picker shown (${v.id})`);
    return;
  }
  try {
    await v.remote.prompt();
  } catch (err) {
    dbg(`remote playback prompt failed (${v.id}):`, err.name, err.message);
    if (err.name === 'NotSupportedError') toast('This browser can’t cast this picture. Try Screen Mirroring');
  }
}

function openPlayer() {
  if (!hasSource()) {
    toast('Start the camera or a video first');
    return;
  }
  const v = ui.liveVideo;
  if (!live.stream) {
    live.stream = out.captureStream(30);
    v.srcObject = live.stream;
  }
  v.play().catch((err) => dbg('live player play failed:', err.name, err.message));
  ui.playerAirplay.hidden = !canAirplay(v);
  ui.playerPip.hidden = !canPip(v);
  ui.playerFull.hidden = !(v.webkitEnterFullscreen || v.requestFullscreen);
  hostOverlays();
  ui.player.hidden = false;
  dbg(`live player opened: airplay picker=${hasAirplayPicker(v)}, remote=${typeof v.remote?.prompt === 'function'}, pip=${canPip(v)}`);
}

function stopLive() {
  live.stream?.getTracks().forEach((t) => t.stop());
  live.stream = null;
  ui.liveVideo.srcObject = null;
}

// Keep streaming while it's in Picture in Picture or on a TV.
function closePlayer() {
  ui.player.hidden = true;
  const v = ui.liveVideo;
  if (!inPip(v) && !v.webkitCurrentPlaybackTargetIsWireless) stopLive();
}

async function togglePip() {
  const v = ui.liveVideo;
  try {
    if (inPip(v)) {
      if (document.pictureInPictureElement) await document.exitPictureInPicture();
      else v.webkitSetPresentationMode('inline');
    } else if (document.pictureInPictureEnabled && v.requestPictureInPicture) {
      await v.requestPictureInPicture();
    } else {
      v.webkitSetPresentationMode('picture-in-picture');
    }
  } catch (err) {
    dbg('picture in picture failed:', err.name, err.message);
    toast('Picture in Picture isn’t available here');
  }
}

function playerFullscreen() {
  const v = ui.liveVideo;
  try {
    // iPhone only allows full screen for video, through its own player.
    if (document.fullscreenEnabled && v.requestFullscreen) v.requestFullscreen();
    else v.webkitEnterFullscreen();
  } catch (err) {
    dbg('player full screen failed:', err.name, err.message);
  }
}

async function showOnTv() {
  await enterFullscreen();
  ui.tvSteps.innerHTML = tvSteps().map((step) => `<li>${step}</li>`).join('');
  ui.tvHint.hidden = false;
  dbg('TV hint shown');
}

// ---------------------------------------------------------------------------
// Live: output window, panic keys and scenes
// ---------------------------------------------------------------------------

const show = {
  win: null, // the output window, once open
  canvas: null, // its canvas, once it has loaded and connected
  ctx: null,
  mainRaf: 0, // when this window last got an animation frame
  blackOn: false,
  black: 0, // the blackout fade, 0..1
  shownBlack: -1,
  t: 0,
  saving: false, // the next scene slot clicked saves instead of recalls
  scene: 0, // the scene last recalled or saved
  scenes: {}, // slot (1..9) -> saved look
};
const BLACKOUT_FADE_MS = 600;
const OUTPUT_IDLE_TEXT = ui.outputStatus.textContent;
const TOUCH_ONLY = matchMedia('(hover: none)').matches;
// Touch screens get touch wording until a keyboard turns up (an iPad's).
const keysInUse = () => !TOUCH_ONLY || document.body.classList.contains('has-keys');
const scenesHint = () => (keysInUse()
  ? '1–9 switches, Shift + 1–9 saves. Clicking an empty slot saves too.'
  : 'Tap an empty slot to save the look there, a full one to switch to it.');
const punchHint = () => (keysInUse() ? 'Shift locks one on' : 'hold a pad');

// ---- Output window ---------------------------------------------------------
// A second window with only the picture, for the projector or a second
// screen. It's the same site, so every frame is simply drawn into its
// canvas. The blackout fades there, so this window can keep showing the
// picture you'll bring back.

function openOutput() {
  if (show.win && !show.win.closed) {
    show.win.focus();
    return;
  }
  const win = window.open('output.html?v=35', 'emojiFiedOutput', 'popup,width=960,height=540');
  if (!win) {
    toast('Allow pop-ups for this site to open the output window');
    return;
  }
  show.win = win; // it connects itself (emojiFiedOutput.attach) once loaded
  dbg('output window opened');
}

function closeOutput() {
  show.win?.close();
  detachOutput();
}

function detachOutput() {
  show.win = show.canvas = show.ctx = null;
  updateLiveUI();
}

// What the output window calls, as soon as it loads and every second (so
// it reconnects if this window reloads), every frame, and on key presses.
window.emojiFiedOutput = {
  attach(win) {
    const c = win.document.getElementById('c');
    if (show.win === win && show.canvas === c) return;
    show.win = win;
    show.canvas = c;
    show.ctx = c.getContext('2d');
    updateLiveUI();
    toast('📽 Output window connected');
    dbg('output window connected');
  },
  // Browsers pause a minimised or hidden window; the output window keeps
  // the frames coming then.
  pump() {
    if (performance.now() - show.mainRaf > 150) frame();
  },
  key(e) {
    onKey({ ...e, target: null, preventDefault() {} });
  },
  keyup(e) {
    onKeyUp(e);
  },
  release() {
    releasePunches();
  },
};

function drawOutput(dark) {
  if (!show.win) return;
  if (show.win.closed) {
    detachOutput();
    toast('📽 Output window closed');
    return;
  }
  const c = show.canvas;
  if (!c) return;
  if (c.width !== out.width || c.height !== out.height) {
    c.width = out.width;
    c.height = out.height;
  }
  show.ctx.drawImage(out, 0, 0);
  if (dark > 0.002) {
    show.ctx.fillStyle = `rgba(0, 0, 0, ${dark})`;
    show.ctx.fillRect(0, 0, c.width, c.height);
  }
}

// Every frame: ease the blackout and feed the output window. Frozen or
// not, so a blackout still fades over a frozen frame.
function tickLive(now) {
  const dt = Math.min(100, now - (show.t || now));
  show.t = now;
  const target = show.blackOn ? 1 : 0;
  if (show.black !== target) {
    const step = dt / BLACKOUT_FADE_MS;
    show.black = target ? Math.min(1, show.black + step) : Math.max(0, show.black - step);
  }
  // The strobe punch-in blacks out every other beat of its own (6 Hz).
  const strobeDark = punchOn('strobe') && strobeIsDark(now);
  const dark = strobeDark ? 1 : show.black;
  // With an output window this one only dims, so you can still see.
  const shown = dark * (show.canvas ? 0.6 : 1);
  if (shown !== show.shownBlack) {
    show.shownBlack = shown;
    ui.blackout.style.backgroundColor = `rgba(0, 0, 0, ${shown.toFixed(3)})`;
  }
  drawOutput(dark);
}

function updateLiveUI() {
  const on = !!show.canvas;
  ui.outputBtn.textContent = on ? '📽 Output is live · bring it to the front' : '📽 Open output window';
  ui.outputBtn.classList.toggle('live', on);
  ui.outputClose.hidden = !on;
  ui.outputStatus.textContent = on
    ? 'Live. Drag it to the projector and double-click it for full screen; keys work in either window.'
    : OUTPUT_IDLE_TEXT;
  ui.blackout.classList.toggle('labelled', on);
  ui.blackout.classList.toggle('on', show.blackOn);
  ui.blackoutBtn.setAttribute('aria-pressed', String(show.blackOn));
  ui.liveDot.hidden = !on && !show.blackOn;
  show.shownBlack = -1; // the dimming depends on the output window
}

// A toast for the performer. In full screen without an output window the
// audience is watching this screen, so stay quiet there.
function liveToast(msg) {
  if (!isFull() || show.canvas) toast(msg);
}

// ---- Panic keys -------------------------------------------------------------

function toggleBlackout(on = !show.blackOn) {
  show.blackOn = on;
  updateLiveUI();
  dbg(`blackout ${on ? 'on' : 'off'}`);
}

// Back to the plain default look: no Tetris, shapes or look shuffling.
// Every scene setting at its default (what the page starts with).
function defaultScene() {
  const scene = {};
  for (const [k, el] of Object.entries(sceneFields())) {
    if (k === 'match') continue; // the default set picks its own
    if (k === 'words') continue; // keep what you've typed
    scene[k] = el.type === 'checkbox' ? el.defaultChecked
      : el.tagName === 'SELECT' ? ([...el.options].find((o) => o.defaultSelected) || el.options[0]).value
      : el.defaultValue;
  }
  return scene;
}

// The look on screen is no longer the example that was tried.
function forgetTried() {
  if (!show.trying) return;
  show.trying = null;
  renderLooks();
}

function safeLook() {
  releasePunches(true);
  forgetTried();
  applyScene(defaultScene());
  show.scene = 0;
  renderScenes();
  liveToast('🛟 Safe look');
}

// ---- Punch-in effects ---------------------------------------------------------
// Momentary effects, like a DJ's: on while a key or button is held, off as
// soon as it's let go. Shift + the key (or Shift-click) latches one on until
// it's pressed again. They change only the live picture, never posters.

const PUNCHES = [
  { id: 'strobe', color: '#ffe04a', key: 'q', icon: '⚡', label: 'Strobe', title: 'Flashes the picture on and off, 6 times a second' },
  { id: 'stutter', color: '#ff9a3d', key: 'w', icon: '🔁', label: 'Stutter', title: 'Choppy: the picture only moves 8 times a second' },
  { id: 'hue', color: '#c38bff', key: 'e', icon: '🌈', label: 'Hue spin', title: 'Spins the colours round the rainbow' },
  { id: 'zoom', color: '#5cb8ff', key: 'r', icon: '🔍', label: 'Zoom', title: 'Zooms into the middle of the picture' },
  { id: 'invert', color: '#e9e3d6', key: 'z', icon: '🌗', label: 'Invert', title: 'Flips the picture to its negative' },
  { id: 'kaleido', color: '#ff6fae', key: 'x', icon: '🪞', label: 'Kaleido', title: 'Mirrors the picture four ways' },
  { id: 'glitch', color: '#3fe0d0', key: 'c', icon: '📼', label: 'Glitch', title: 'Tears bands of the picture sideways' },
  { id: 'crunch', color: '#8fd4ff', key: 'v', icon: '🧊', label: 'Crunch', title: 'Drops the detail to a quarter' },
];
const PUNCH_BY_KEY = Object.fromEntries(PUNCHES.map((p) => [p.key, p]));
const STROBE_HALF_MS = 1000 / 12;
const punch = {
  held: new Set(),
  latched: new Set(),
  zoom: 1, // eased towards 2.2 while Zoom is on
  stutterAt: 0,
  crunchCols: 0, // the detail to go back to when Crunch ends
  hueAt: 0,
  strobeAt: 0,
  buttons: {},
};
const punchOn = (id) => punch.held.has(id) || punch.latched.has(id);

function punchDown(id, latch) {
  const was = punchOn(id);
  if (latch) {
    if (punch.latched.has(id)) punch.latched.delete(id);
    else punch.latched.add(id);
    punch.held.delete(id);
  } else {
    punch.held.add(id);
  }
  punchChanged(id, was);
}

function punchUp(id) {
  const was = punchOn(id);
  punch.held.delete(id);
  punchChanged(id, was);
}

// Let go of everything held (the window lost focus, so no key-up is coming);
// `all` also unlatches.
function releasePunches(all = false) {
  for (const id of [...punch.held, ...(all ? punch.latched : [])]) {
    const was = punchOn(id);
    punch.held.delete(id);
    if (all) punch.latched.delete(id);
    punchChanged(id, was);
  }
}

function punchChanged(id, was) {
  const on = punchOn(id);
  if (on !== was) {
    const t = performance.now();
    if (id === 'strobe') punch.strobeAt = t;
    if (id === 'hue') punch.hueAt = t;
    if (id === 'stutter') punch.stutterAt = 0;
    if (id === 'crunch') crunch(on);
    if (state.paused) render();
  }
  syncPunchButtons();
}

function crunch(on) {
  if (on) {
    punch.crunchCols = +ui.cols.value;
    ui.cols.value = Math.max(12, Math.round(punch.crunchCols / 4));
  } else if (punch.crunchCols) {
    ui.cols.value = punch.crunchCols;
    punch.crunchCols = 0;
  }
  layout();
}

// A scene sets its own detail, so a held Crunch just ends without restoring.
function dropCrunch() {
  if (!punchOn('crunch')) return;
  punch.crunchCols = 0;
  punch.held.delete('crunch');
  punch.latched.delete('crunch');
  syncPunchButtons();
}

const punchHue = () => (punchOn('hue') ? ((performance.now() - punch.hueAt) * 0.6) % 360 : 0);

// Stutter: let a frame through only every 125 ms, or on each 16th note
// when synced to a tempo.
function stutterHold() {
  if (!punchOn('stutter')) return false;
  const t = performance.now();
  if (tempoOn()) {
    const step = `${tempo.beat}:${Math.floor((t - tempo.t0) / (tempo.period / 4))}`;
    if (step === punch.stutterStep) return true;
    punch.stutterStep = step;
    return false;
  }
  if (t - punch.stutterAt < 125) return true;
  punch.stutterAt = t;
  return false;
}

// Strobe: 6 Hz, starting dark; on a tempo, a flash every 8th note, lit on
// the beat (every quarter note instead when 8ths would pass 6 a second).
function strobeIsDark(now) {
  if (tempoOn()) {
    let half = tempo.period / 4;
    if (1000 / (2 * half) > 6) half = tempo.period / 2;
    return Math.floor((now - tempo.t0) / half) % 2 === 1;
  }
  return Math.floor((now - punch.strobeAt) / STROBE_HALF_MS) % 2 === 0;
}

// Zoom: a smaller window on the middle of the frame, eased in and out.
function punchCrop(c) {
  const target = punchOn('zoom') ? 2.2 : 1;
  punch.zoom += (target - punch.zoom) * 0.3;
  if (target === 1 && punch.zoom < 1.005) punch.zoom = 1;
  if (punch.zoom === 1) return c;
  const z = punch.zoom, w = c[2] / z, h = c[3] / z;
  return [c[0] + (c[2] - w) / 2, c[1] + (c[3] - h) / 2, w, h];
}

// Kaleido and Glitch work on the sampled pixels, one per cell.
function punchPixels(d, w, h) {
  if (punchOn('kaleido')) {
    // The top-left quarter reflected into the other three.
    const hw = w >> 1, hh = h >> 1;
    for (let y = 0; y < hh; y++) {
      const row = y * w * 4;
      for (let x = 0; x < hw; x++) {
        const s = row + x * 4, t = row + (w - 1 - x) * 4;
        d[t] = d[s];
        d[t + 1] = d[s + 1];
        d[t + 2] = d[s + 2];
        d[t + 3] = d[s + 3];
      }
    }
    for (let y = 0; y < hh; y++) d.copyWithin((h - 1 - y) * w * 4, y * w * 4, (y + 1) * w * 4);
  }
  if (punchOn('glitch')) {
    // Torn bands: runs of rows slide sideways (wrapping round), some with
    // their colour channels swapped. New tears every frame.
    const row = new Uint8ClampedArray(w * 4);
    for (let y = 0; y < h; ) {
      const band = 1 + ((Math.random() * Math.max(2, h / 12)) | 0);
      if (Math.random() < 0.35) {
        const shift = ((Math.random() - 0.5) * w * 0.5) | 0;
        const swap = Math.random() < 0.4;
        for (let yy = y; yy < Math.min(h, y + band); yy++) {
          const o = yy * w * 4;
          row.set(d.subarray(o, o + w * 4));
          for (let x = 0; x < w; x++) {
            const s = ((((x - shift) % w) + w) % w) * 4, t = o + x * 4;
            d[t] = row[swap ? s + 2 : s];
            d[t + 1] = row[swap ? s : s + 1];
            d[t + 2] = row[swap ? s + 1 : s + 2];
          }
        }
      }
      y += band;
    }
  }
}

function syncPunchButtons() {
  for (const p of PUNCHES) {
    const b = punch.buttons[p.id];
    b.classList.toggle('on', punchOn(p.id));
    b.classList.toggle('latched', punch.latched.has(p.id));
    b.setAttribute('aria-pressed', String(punchOn(p.id)));
  }
}

function buildPunchButtons() {
  for (const p of PUNCHES) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'punch';
    b.style.setProperty('--pad', p.color);
    b.dataset.learn = `punch:${p.id}`;
    b.title = `${p.title}. Hold ${p.key.toUpperCase()}; Shift + ${p.key.toUpperCase()} locks it on.`;
    const ico = document.createElement('span');
    ico.textContent = p.icon;
    const lbl = document.createElement('span');
    lbl.className = 'lbl';
    lbl.textContent = p.label;
    const kbd = document.createElement('kbd');
    kbd.textContent = p.key.toUpperCase();
    b.append(ico, lbl, kbd);
    // Held with the pointer: on while it's down, wherever it then moves.
    b.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      b.setPointerCapture?.(e.pointerId);
      punchDown(p.id, e.shiftKey);
    });
    for (const ev of ['pointerup', 'pointercancel', 'lostpointercapture']) b.addEventListener(ev, () => punchUp(p.id));
    b.addEventListener('contextmenu', (e) => e.preventDefault()); // long-press on touch screens
    b.addEventListener('keydown', (e) => (e.key === 'Enter' || e.key === ' ') && e.preventDefault());
    punch.buttons[p.id] = b;
    ui.punches.append(b);
  }
  ui.punchHint.textContent = punchHint();
}

// ---- Tempo ------------------------------------------------------------------
// A beat to lock to: tapped (K), or MIDI clock (24 ticks a beat) from
// Ableton, Traktor, a drum machine... Clock wins while it's running. With
// "Sync to tempo" on, beats come from here instead of the microphone: they
// flash and send beat shapes, drop Tetris pieces, shuffle the look every so
// often, and Strobe and Stutter lock to them.

const tempo = {
  bpm: 0,
  period: 0, // ms per beat
  source: '', // 'tap' or 'clock'
  t0: 0, // when the last beat landed
  nextAt: 0, // the next tapped-tempo beat
  beat: 0, // beats since sync started
  taps: [],
  ticks: [], // recent clock tick times
  tickCount: 0,
  lastTick: -1e9,
  stopped: false, // MIDI Stop received
  shown: '',
};
const tempoOn = () => ui.tempoSync.checked && tempo.bpm > 0;
const clockAlive = (now) => now - tempo.lastTick < 500;

function setBpm(bpm, source) {
  tempo.bpm = Math.min(300, Math.max(30, bpm));
  tempo.period = 60000 / tempo.bpm;
  tempo.source = source;
  syncTempoUI();
}

function syncTempoUI() {
  const text = tempo.bpm ? `${Math.round(tempo.bpm)} BPM · ${tempo.source === 'clock' ? 'MIDI clock' : 'tapped'}` : 'No tempo yet';
  if (text !== tempo.shown) ui.tempoRead.textContent = tempo.shown = text;
  syncSoundUI();
}

function tapTempo() {
  const now = performance.now();
  if (now - (tempo.taps[tempo.taps.length - 1] ?? -1e9) > 2000) tempo.taps = [];
  tempo.taps.push(now);
  if (tempo.taps.length > 8) tempo.taps.shift();
  ui.tapBtn.classList.add('hit');
  setTimeout(() => ui.tapBtn.classList.remove('hit'), 90);
  if (!ui.tempoSync.checked) {
    ui.tempoSync.checked = true; // tapping means you want it
    syncTempoUI();
  }
  if (clockAlive(now) && !tempo.stopped) return; // the clock is in charge
  tempo.stopped = false;
  if (tempo.taps.length >= 2) {
    setBpm(60000 / ((now - tempo.taps[0]) / (tempo.taps.length - 1)), 'tap');
  }
  if (tempo.bpm) {
    // Every tap lands on a beat, so one tap re-aligns a running tempo.
    onTempoBeat(now);
    tempo.nextAt = now + tempo.period;
  }
}

// System real-time messages: clock, start, continue, stop. Ticks are timed
// by the message's own time stamp (when it reached the computer): a busy
// page can deliver several at once, which would throw the BPM off.
function onMidiRealtime(status, stamp) {
  const now = performance.now();
  if (status === 0xf8) {
    tempo.ticks.push(stamp > 0 ? stamp : now);
    if (tempo.ticks.length > 49) tempo.ticks.shift();
    tempo.lastTick = now;
    if (tempo.ticks.length >= 25) {
      const n = tempo.ticks.length - 1;
      const bpm = 60000 / (((tempo.ticks[n] - tempo.ticks[0]) / n) * 24);
      // Smooth out jitter, but follow a real tempo change straight away.
      setBpm(tempo.source === 'clock' && Math.abs(bpm - tempo.bpm) < tempo.bpm * 0.08 ? tempo.bpm * 0.8 + bpm * 0.2 : bpm, 'clock');
    }
    if (tempo.tickCount % 24 === 0 && tempo.bpm && !tempo.stopped) onTempoBeat(now);
    tempo.tickCount++;
  } else if (status === 0xfa || status === 0xfb) {
    tempo.stopped = false; // start (from beat one) or continue
    if (status === 0xfa) {
      tempo.tickCount = 0;
      tempo.beat = 0;
    }
  } else if (status === 0xfc) {
    tempo.stopped = true; // the transport stopped: so do the beats
  }
}

// Every frame: run the tapped tempo (the clock beats by itself).
function tickTempo(now) {
  if (!tempoOn() || clockAlive(now) || tempo.stopped) return;
  if (!tempo.nextAt || now - tempo.nextAt > tempo.period) tempo.nextAt = now + tempo.period;
  if (now >= tempo.nextAt) {
    onTempoBeat(now);
    tempo.nextAt += tempo.period;
  }
}

function onTempoBeat(now) {
  if (!ui.tempoSync.checked) return;
  tempo.t0 = now;
  tempo.beat++;
  const n = (tempo.beat - 1) % 4;
  ui.beatDots.forEach((d, i) => d.classList.toggle('on', i === n));
  if (tempo.beat === 1) sound.beats = 0; // shuffles count from beat one
  beatHit(now, 1, randomHueKick());
}

ui.tapBtn.addEventListener('click', tapTempo);
ui.tempoSync.addEventListener('change', () => {
  tempo.beat = 0;
  tempo.nextAt = 0;
  ui.beatDots.forEach((d) => d.classList.remove('on'));
  syncTempoUI();
});
syncTempoUI(); // the browser may have restored the box

// ---- MIDI learn ---------------------------------------------------------------
// Map a controller's knobs, faders and pads to the controls: knobs and
// faders (CC) move sliders, pads and keys (notes) or CC buttons press
// buttons; punch-ins last as long as the pad is held. Mapped notes don't
// also play as music. Mappings are kept in this browser.

const learn = { active: false, pending: null, map: {}, cc: {} };
const LEARN_RANGES = {
  cols: ['Detail', ui.cols],
  contrast: ['Contrast', ui.contrast],
  bright: ['Brightness', ui.bright],
  sat: ['Saturation', ui.sat],
  shadows: ['Shadows', ui.shadows],
  highlights: ['Highlights', ui.highlights],
  fx: ['Effect strength', ui.fxStrength],
  wordsSize: ['Words size', ui.wordsSize],
};
const LEARN_BUTTONS = {
  blackout: ['Blackout', () => toggleBlackout()],
  freeze: ['Freeze', () => ui.pause.click()],
  safe: ['Safe look', () => safeLook()],
  tap: ['Tap tempo', () => tapTempo()],
  random: ['Randomize', () => randomize()],
  tetris: ['Tetris on/off', () => ui.tetris.click()],
  words: ['Words on/off', () => ui.wordsOn.click()],
};

// What a learned id controls: { label, set(v) } for sliders, { label,
// press() } for buttons, { label, down(), up() } for punch-ins.
function learnTarget(id) {
  const [kind, arg] = id.split(':');
  if (kind === 'range' && LEARN_RANGES[arg]) {
    const [label, el] = LEARN_RANGES[arg];
    return {
      label,
      set(v) {
        const min = +el.min, max = +el.max, step = +el.step || 1;
        el.value = String(min + Math.round((v * (max - min)) / step) * step);
        el.dispatchEvent(new Event('input'));
      },
    };
  }
  if (kind === 'scene') return { label: `Scene ${arg}`, press: () => recallScene(+arg) };
  if (kind === 'punch') {
    const p = PUNCHES.find((q) => q.id === arg);
    return p && { label: `${p.icon} ${p.label} (hold)`, down: () => punchDown(arg), up: () => punchUp(arg) };
  }
  if (LEARN_BUTTONS[id]) return { label: LEARN_BUTTONS[id][0], press: LEARN_BUTTONS[id][1] };
  return null;
}

const NOTE_NAMES = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'];
function describeMidiKey(key) {
  const [kind, ch, n] = key.split(':');
  return kind === 'note' ? `Note ${NOTE_NAMES[n % 12]}${Math.floor(n / 12) - 1} · ch ${ch}` : `CC ${n} · ch ${ch}`;
}

// A note or CC message: learn it, or work what it's mapped to. Returns
// true when it was used, so it doesn't also play as music.
function midiControl(type, ch, n, value) {
  const isNote = type !== 0xb0;
  const key = `${isNote ? 'note' : 'cc'}:${ch}:${n}`;
  const press = type === 0x90 && value > 0;
  if (learn.pending && (press || !isNote)) {
    bindMidi(key, learn.pending);
    return true;
  }
  const id = learn.map[key];
  const t = id && learnTarget(id);
  if (!t) return false;
  if (t.set) {
    if (!isNote || press) t.set(value / 127); // a pad sets it by how hard it's hit
    return true;
  }
  let down = press;
  if (!isNote) {
    // CC buttons send 127 when pressed and 0 when let go.
    const was = (learn.cc[key] ?? 0) >= 64;
    learn.cc[key] = value;
    down = value >= 64;
    if (down === was) return true;
  }
  if (t.down) (down ? t.down : t.up)();
  else if (down) t.press();
  return true;
}

function bindMidi(key, id) {
  learn.map[key] = id;
  storeMidiMap();
  learnPending(null);
  renderMidiMap();
  toast(`🎹 ${describeMidiKey(key)} → ${learnTarget(id).label}`);
  dbg(`MIDI learn: ${key} -> ${id}`);
}

function storeMidiMap() {
  try {
    localStorage.setItem('emojiFiedMidiMap', JSON.stringify(learn.map));
  } catch {}
}

function renderMidiMap() {
  const rows = Object.entries(learn.map).filter(([, id]) => learnTarget(id));
  ui.midiMap.replaceChildren(
    ...rows.map(([key, id]) => {
      const row = document.createElement('div');
      row.className = 'map-row';
      const what = document.createElement('span');
      const from = document.createElement('span');
      from.className = 'from';
      from.textContent = `${describeMidiKey(key)} → `;
      what.append(from, learnTarget(id).label);
      const x = document.createElement('button');
      x.type = 'button';
      x.textContent = '✕';
      x.title = 'Remove this mapping';
      x.addEventListener('click', () => {
        delete learn.map[key];
        storeMidiMap();
        renderMidiMap();
      });
      row.append(what, x);
      return row;
    })
  );
}

const LEARN_HINT = ui.learnHint.textContent;
function learnPending(id) {
  learn.pending = id;
  document.querySelectorAll('.learn-pending').forEach((el) => el.classList.remove('learn-pending'));
  if (id) document.querySelector(`[data-learn="${id}"]`)?.classList.add('learn-pending');
  ui.learnHint.textContent = !learn.active ? LEARN_HINT
    : id ? `Now move a knob or fader, or hit a pad, for “${learnTarget(id).label}”…`
    : 'Click a slider or button to map (dashed outlines, on any tab), then move a knob or hit a pad. Esc or Done when finished.';
}

async function setLearning(on) {
  if (on && !(await midiAccess())) return;
  learn.active = on;
  document.body.classList.toggle('learning', on);
  ui.learnBtn.setAttribute('aria-pressed', String(on));
  ui.learnBtn.textContent = on ? 'Done' : 'Learn…';
  learnPending(null);
  if (on && !midi.devices) toast('No MIDI device found yet: plug one in');
}

// Tag what can be learned.
for (const [k, [, el]] of Object.entries(LEARN_RANGES)) el.dataset.learn = `range:${k}`;
ui.blackoutBtn.dataset.learn = 'blackout';
ui.freezeBtn.dataset.learn = 'freeze';
ui.safeBtn.dataset.learn = 'safe';
ui.tapBtn.dataset.learn = 'tap';
ui.random.dataset.learn = 'random';
ui.tetris.closest('label').dataset.learn = 'tetris';
ui.wordsOn.closest('label').dataset.learn = 'words';

// While learning, a click picks the control instead of using it.
for (const ev of ['pointerdown', 'mousedown', 'touchstart', 'click']) {
  document.addEventListener(ev, (e) => {
    if (!learn.active) return;
    const el = e.target.closest?.('[data-learn]');
    if (!el) return;
    e.preventDefault();
    e.stopPropagation();
    if (ev === 'pointerdown') learnPending(el.dataset.learn);
  }, { capture: true, passive: false });
}
ui.learnBtn.addEventListener('click', () => setLearning(!learn.active));

try {
  learn.map = JSON.parse(localStorage.getItem('emojiFiedMidiMap') || '{}') || {};
} catch {
  learn.map = {};
}
renderMidiMap();
if (!navigator.requestMIDIAccess) {
  ui.learnBtn.hidden = true;
  ui.learnHint.textContent = 'MIDI controllers and MIDI clock work in Chrome, Edge and Firefox on a computer.';
} else if (Object.keys(learn.map).length) {
  midiAccess(true); // your controller works straight away next time
}

// ---- Scenes -----------------------------------------------------------------
// Nine slots for whole looks, recalled with the number keys (or a tap),
// saved with Shift + number. They're kept in this browser.

const sceneFields = () => ({
  style: ui.style, custom: ui.custom, cols: ui.cols, match: ui.match, ink: ui.ink,
  contrast: ui.contrast, bright: ui.bright, sat: ui.sat, shadows: ui.shadows, highlights: ui.highlights,
  invert: ui.invert, blank: ui.blank, tetris: ui.tetris,
  fxStrength: ui.fxStrength, beatShape: ui.beatShape, beatOutline: ui.beatOutline, beatShuffle: ui.beatShuffle,
  twinkle: ui.twinkle, kenBurns: ui.kenBurns,
  wordsOn: ui.wordsOn, words: ui.words, wordsMode: ui.wordsMode, wordsMotion: ui.wordsMotion,
  wordsColor: ui.wordsColor, wordsSize: ui.wordsSize, wordsPos: ui.wordsPos, wordsOutline: ui.wordsOutline,
});

function describeLook() {
  const name = ui.style.value === 'custom' ? ui.custom.value.slice(0, 12) : ui.style.selectedOptions[0]?.textContent || ui.style.value;
  const bits = [name];
  if (state.kind !== 'emoji') bits.push(ui.ink.selectedOptions[0]?.textContent);
  if (ui.invert.checked) bits.push('inverted');
  if (ui.tetris.checked) bits.push('🧱');
  if (wordsActive()) bits.push(`💬 ${ui.words.value.trim().split('\n')[0].slice(0, 10)}`);
  return bits.join(' · ');
}

// A small picture of the look, for the slot.
function sceneThumb() {
  if (!hasSource() || !out.width) return '';
  const c = document.createElement('canvas');
  c.width = 160;
  c.height = Math.max(1, Math.round((160 * out.height) / out.width));
  c.getContext('2d').drawImage(out, 0, 0, c.width, c.height);
  try {
    return c.toDataURL('image/jpeg', 0.7);
  } catch {
    return '';
  }
}

function captureScene() {
  const scene = { label: describeLook(), thumb: sceneThumb() };
  const ex = show.trying;
  if (ex) Object.assign(scene, { label: ex.label, icon: ex.icon, tint: ex.tint, example: ex.id });
  for (const [k, el] of Object.entries(sceneFields())) scene[k] = el.type === 'checkbox' ? el.checked : el.value;
  if (punch.crunchCols) scene.cols = String(punch.crunchCols); // the detail without Crunch held
  return scene;
}

function applyScene(scene) {
  const tetrisWas = ui.tetris.checked;
  dropCrunch(); // the scene's own detail wins over a held Crunch
  for (const [k, el] of Object.entries(sceneFields())) {
    if (!(k in scene) || k === 'match') continue;
    if (el.type === 'checkbox') el.checked = !!scene[k];
    else el.value = scene[k];
  }
  applyStyle(); // also picks the set's own "Match by"...
  if (scene.match && state.kind === 'emoji') ui.match.value = scene.match; // ...unless saved
  syncLabels();
  syncWords();
  onBeatShapeChange();
  if (ui.tetris.checked !== tetrisWas) tetris.plan = null;
  if (state.paused) render();
}

// Example scenes: a starter set for the slots. Each is the default look
// with a few changes; it gets a real thumbnail the first time it plays.
const EXAMPLE_SCENES = [
  // The starter set: the nine slots on a first visit (and ✨ Examples).
  { id: 'candy', starter: true, group: 'Emoji', icon: '🌈', label: 'Candy Pop', tint: '#ff6fae', look: { style: 'emoji:rainbow', cols: '56', sat: '1.7', contrast: '1.35', beatShape: 'mix' } },
  { id: 'matrix', starter: true, group: 'Text & code', icon: '💚', label: 'Matrix', tint: '#39ff7a', look: { style: 'text:katakana', ink: '#39ff7a', cols: '96', contrast: '1.7', bright: '0.04' } },
  { id: 'love', starter: true, group: 'Emoji', icon: '💖', label: 'Love Bomb', tint: '#ff4f7b', look: { style: 'emoji:hearts', cols: '44', sat: '1.5', contrast: '1.3', beatShape: 'heart' } },
  { id: 'skulls', starter: true, group: 'Party', icon: '💀', label: 'Skull Rave', tint: '#c38bff', look: { style: 'skull', ink: '#ff4fd8', cols: '72', contrast: '1.6', beatShape: 'star' } },
  { id: 'tetris', starter: true, group: 'Party', icon: '🧱', label: 'Tetris Party', tint: '#ffd23f', look: { style: 'emoji:everything', cols: '40', sat: '1.3', tetris: true } },
  { id: 'ghost', starter: true, group: 'Fine detail', icon: '👻', label: 'Braille Ghost', tint: '#e9e3d6', look: { style: 'braille', ink: '#f2f2f2', cols: '130', contrast: '1.9', shadows: '-0.2' } },
  { id: 'amber', starter: true, group: 'Text & code', icon: '📟', label: 'Amber Terminal', tint: '#ffb000', look: { style: 'text:detailed', ink: '#ffb000', cols: '120', contrast: '1.5' } },
  { id: 'snack', starter: true, group: 'Emoji', icon: '🍩', label: 'Snack Attack', tint: '#ff9a3d', look: { style: 'emoji:food', cols: '52', sat: '1.4', highlights: '0.1' } },
  { id: 'chaos', starter: true, group: 'Party', icon: '🌀', label: 'Chaos Mode', tint: '#5cb8ff', look: { style: 'emoji:faces', cols: '60', sat: '1.6', beatShape: 'mix', beatShuffle: '4' } },
  // The rest of the library (🎨 Look → Try a look).
  { id: 'zoo', group: 'Emoji', icon: '🐾', label: 'Zoo', tint: '#ffb000', look: { style: 'emoji:animals', cols: '50', sat: '1.3' } },
  { id: 'forest', group: 'Emoji', icon: '🌿', label: 'Forest', tint: '#43d17a', look: { style: 'emoji:nature', cols: '64', sat: '1.25', contrast: '1.3' } },
  { id: 'faces', group: 'Emoji', icon: '🤡', label: 'Face Wall', tint: '#ffd23f', look: { style: 'emoji:faces', cols: '36', sat: '1.3' } },
  { id: 'frog', group: 'Emoji', icon: '🐸', label: 'Frog Pond', tint: '#6fe3a5', look: { style: 'custom', custom: '🐸🍀💚🌿🟩', cols: '60', sat: '1.4' } },
  { id: 'sea', group: 'Emoji', icon: '🌊', label: 'Deep Sea', tint: '#3d8bff', look: { style: 'custom', custom: '🌊🐟🐠🐳💧💙', cols: '64', contrast: '1.3' } },
  { id: 'inferno', group: 'Emoji', icon: '🔥', label: 'Inferno', tint: '#ff6a3d', look: { style: 'custom', custom: '🔥🧡❤️💛🌋', cols: '56', contrast: '1.5', sat: '1.5', beatShape: 'sweep' } },
  { id: 'sakura', group: 'Emoji', icon: '🌸', label: 'Sakura', tint: '#ffb3d1', look: { style: 'custom', custom: '🌸🌷💮🎀💗', cols: '60', bright: '0.05', sat: '1.2' } },
  { id: 'galaxy', group: 'Emoji', icon: '🪐', label: 'Galaxy', tint: '#8f7bff', look: { style: 'custom', custom: '✨⭐🌟💫🌌🪐', cols: '72', contrast: '1.6' } },
  { id: 'sweet', group: 'Emoji', icon: '🍭', label: 'Sweet Tooth', tint: '#ff9ad1', look: { style: 'custom', custom: '🍬🍭🍩🧁🍰🍫', cols: '56', sat: '1.3' } },
  { id: 'sun', group: 'Emoji', icon: '🌻', label: 'Sunburst', tint: '#ffd23f', look: { style: 'custom', custom: '🌞☀️🌻🟡🌼', cols: '52', bright: '0.05' } },
  { id: 'snow', group: 'Emoji', icon: '❄️', label: 'Snow Day', tint: '#cfe9ff', look: { style: 'custom', custom: '❄️⛄🤍💙🧊', cols: '64', contrast: '1.3' } },
  { id: 'arcade', group: 'Emoji', icon: '👾', label: 'Arcade', tint: '#5cb8ff', look: { style: 'custom', custom: '👾🕹️🟦🟥🟨🟩', cols: '40', contrast: '1.5' } },
  { id: 'monitor', group: 'Text & code', icon: '💾', label: 'Old Monitor', tint: '#39ff7a', look: { style: 'text:ascii', ink: '#39ff7a', cols: '80', contrast: '1.5', bright: '0.1' } },
  { id: 'ice', group: 'Text & code', icon: '🧊', label: 'Ice Blocks', tint: '#5ec8ff', look: { style: 'text:blocks', ink: '#5ec8ff', cols: '90', contrast: '1.6' } },
  { id: 'stars', group: 'Text & code', icon: '⭐', label: 'Starfield', tint: '#e9e3d6', look: { style: 'text:stars', ink: '#f2f2f2', cols: '100', contrast: '1.6', bright: '0.12' } },
  { id: 'halftone', group: 'Text & code', icon: '🔵', label: 'Halftone', tint: '#ff9a3d', look: { style: 'text:shapes', cols: '80', contrast: '1.4', sat: '1.5' } },
  { id: 'math', group: 'Text & code', icon: '🧮', label: 'Math Class', tint: '#c38bff', look: { style: 'text:math', ink: '#f2f2f2', cols: '96', contrast: '1.5', bright: '0.08' } },
  { id: 'noir', group: 'Text & code', icon: '🖤', label: 'Noir', tint: '#9a968c', look: { style: 'text:detailed', ink: '#f2f2f2', cols: '120', sat: '0', contrast: '1.9', shadows: '-0.3' } },
  { id: 'vapor', group: 'Text & code', icon: '💜', label: 'Vapor', tint: '#ff4fd8', look: { style: 'text:katakana', ink: '#ff4fd8', cols: '80', contrast: '1.8', bright: '0.12', beatShape: 'hexagon' } },
  { id: 'news', group: 'Fine detail', icon: '📰', label: 'Newsprint', tint: '#e9e3d6', look: { style: 'braille', ink: '#f2f2f2', cols: '170', contrast: '1.6' } },
  { id: 'xray', group: 'Fine detail', icon: '🩻', label: 'X-Ray', tint: '#5ec8ff', look: { style: 'braille', ink: '#5ec8ff', cols: '120', contrast: '1.8', invert: true } },
  { id: 'hypno', group: 'Party', icon: '😵‍💫', label: 'Hypno', tint: '#ff6fae', look: { style: 'emoji:rainbow', cols: '48', sat: '1.8', beatShape: 'circle' } },
  { id: 'party', group: 'Party', icon: '🎉', label: 'Party Starter', tint: '#ffd23f', look: { style: 'emoji:everything', cols: '56', sat: '1.4', beatShape: 'mix', beatShuffle: '8' } },
  { id: 'bricks', group: 'Party', icon: '🌈', label: 'Rainbow Bricks', tint: '#ff6f91', look: { style: 'emoji:rainbow', cols: '36', tetris: true } },
  { id: 'hello', group: 'Words', icon: '💬', label: 'Say Hello', tint: '#c38bff', look: { style: 'emoji:everything', cols: '64', wordsOn: true, words: 'HELLO 👋', wordsColor: '#ffd23f', wordsMotion: 'bounce', wordsSize: '50' } },
  { id: 'drop', group: 'Words', icon: '📣', label: 'Drop It', tint: '#ff6f91', look: { style: 'emoji:rainbow', cols: '56', sat: '1.5', wordsOn: true, words: 'DROP IT', wordsColor: 'rainbow', wordsMotion: 'pulse', wordsSize: '60', beatShape: 'mix' } },
  { id: 'marquee', group: 'Words', icon: '🎞️', label: 'Marquee', tint: '#ffb000', look: { style: 'text:detailed', ink: '#ffb000', cols: '110', contrast: '1.5', bright: '0.06', wordsOn: true, words: 'NOW PLAYING ✦ EMOJI·FIED', wordsMotion: 'scroll', wordsSize: '34', wordsPos: 'bottom' } },
  { id: 'cut', group: 'Words', icon: '✂️', label: 'Cut-out', tint: '#6fe3a5', look: { style: 'emoji:nature', cols: '72', sat: '1.3', wordsOn: true, words: 'WILD', wordsMode: 'cutout', wordsSize: '85', wordsOutline: false } },
];
const STARTER_SCENES = EXAMPLE_SCENES.filter((ex) => ex.starter);
const EXAMPLE_GROUPS = ['Emoji', 'Words', 'Text & code', 'Fine detail', 'Party'];

function exampleScene(ex) {
  return { ...defaultScene(), ...ex.look, label: ex.label, icon: ex.icon, tint: ex.tint, example: ex.id };
}

function loadScenes() {
  let saved = null;
  try {
    saved = localStorage.getItem('emojiFiedScenes');
    show.scenes = JSON.parse(saved || '{}') || {};
  } catch {
    show.scenes = {};
  }
  // First visit: start with the examples.
  if (saved === null) {
    STARTER_SCENES.forEach((ex, i) => (show.scenes[i + 1] = exampleScene(ex)));
    storeScenes(true);
  }
}

// ---- Try a look: the example library on the Look tab ---------------------------
// Tap a card to try the look live; saving it to a slot (🎬 Live) keeps its
// name and emoji.

function tryExample(ex) {
  applyScene(exampleScene(ex));
  show.trying = ex;
  show.scene = 0;
  renderScenes();
  renderLooks();
  liveToast(`✨ ${ex.icon} ${ex.label}`);
  dbg(`example tried: ${ex.id}`);
}

function renderLooks() {
  const box = document.getElementById('looks');
  box.replaceChildren(
    ...EXAMPLE_GROUPS.map((group) => {
      const wrap = document.createElement('div');
      wrap.className = 'look-group';
      const title = document.createElement('span');
      title.className = 'look-group-title';
      title.textContent = group;
      const strip = document.createElement('div');
      strip.className = 'look-strip';
      for (const ex of EXAMPLE_SCENES.filter((e) => e.group === group)) {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = `look-card${show.trying === ex ? ' on' : ''}`;
        b.style.setProperty('--tint', ex.tint);
        b.title = `Try ${ex.label}`;
        const ico = document.createElement('span');
        ico.className = 'ico';
        ico.textContent = ex.icon;
        const name = document.createElement('span');
        name.className = 'name';
        name.textContent = ex.label;
        b.append(ico, name);
        b.addEventListener('click', () => tryExample(ex));
        strip.append(b);
      }
      // A mouse wheel scrolls the strip sideways.
      strip.addEventListener('wheel', (e) => {
        if (Math.abs(e.deltaY) <= Math.abs(e.deltaX) || strip.scrollWidth <= strip.clientWidth) return;
        const max = strip.scrollWidth - strip.clientWidth;
        if ((e.deltaY < 0 && strip.scrollLeft <= 0) || (e.deltaY > 0 && strip.scrollLeft >= max)) return; // let the page scroll on
        e.preventDefault();
        strip.scrollLeft += e.deltaY;
      }, { passive: false });
      wrap.append(title, strip);
      return wrap;
    })
  );
}

// Put the examples into the empty slots (or, with none empty, offer to
// swap every slot for them).
function loadExamples() {
  const have = new Set(Object.values(show.scenes).map((sc) => sc.example).filter(Boolean));
  const todo = STARTER_SCENES.filter((ex) => !have.has(ex.id));
  const empty = Array.from({ length: 9 }, (_, i) => i + 1).filter((n) => !show.scenes[n]);
  if (!todo.length && !empty.length) {
    toast('All the examples are already in your slots');
    return;
  }
  if (!empty.length) {
    if (!confirm('Every slot is full. Replace all nine scenes with the examples?')) return;
    show.scenes = {};
    STARTER_SCENES.forEach((ex, i) => (show.scenes[i + 1] = exampleScene(ex)));
  } else {
    (todo.length ? todo : STARTER_SCENES).slice(0, empty.length).forEach((ex, i) => (show.scenes[empty[i]] = exampleScene(ex)));
  }
  storeScenes();
  renderScenes();
  toast('✨ Example scenes loaded: tap one to try it');
}

function storeScenes(quiet = false) {
  try {
    localStorage.setItem('emojiFiedScenes', JSON.stringify(show.scenes));
  } catch {
    if (!quiet) toast('Couldn’t keep the scene: this browser blocks storage');
  }
}

function recallScene(n) {
  const scene = show.scenes[n];
  if (scene) forgetTried();
  if (!scene) {
    liveToast(`Scene ${n} is empty: Shift + ${n} saves the current look there`);
    return;
  }
  applyScene(scene);
  show.scene = n;
  renderScenes();
  liveToast(`🎬 ${n} · ${scene.icon ? `${scene.icon} ` : ''}${scene.label}`);
  // No picture yet (an example): take one once the look has drawn, or
  // for a Tetris build once the pieces have landed.
  if (!scene.thumb && hasSource()) {
    setTimeout(() => {
      if (show.scenes[n] !== scene || show.scene !== n || !hasSource()) return;
      scene.thumb = sceneThumb();
      storeScenes(true);
      renderScenes();
    }, scene.tetris ? TETRIS_FALL_MS + TETRIS_BUILD_MS + 800 : 700);
  }
  dbg(`scene ${n} recalled: ${scene.label}`);
}

function saveScene(n) {
  show.scenes[n] = captureScene();
  storeScenes();
  show.scene = n;
  setSaving(false);
  liveToast(`💾 Saved to ${n} · ${show.scenes[n].label}`);
}

function setSaving(on) {
  show.saving = on;
  ui.sceneSave.setAttribute('aria-pressed', String(on));
  ui.sceneSave.textContent = on ? 'Cancel' : '💾 Save to a slot…';
  ui.scenesHint.textContent = on ? 'Pick a slot to save the current look there.' : scenesHint();
  renderScenes();
}

function renderScenes() {
  ui.scenes.classList.toggle('saving', show.saving);
  ui.scenes.replaceChildren(
    ...Array.from({ length: 9 }, (_, i) => {
      const n = i + 1, scene = show.scenes[n];
      const b = document.createElement('button');
      b.type = 'button';
      b.className = `scene${scene ? '' : ' empty'}${show.scene === n ? ' current' : ''}`;
      b.dataset.learn = `scene:${n}`;
      if (learn.pending === `scene:${n}`) b.classList.add('learn-pending');
      b.title = scene ? `${scene.label} (${n}; Shift + ${n} to save over it)` : `Empty: click or press Shift + ${n} to save the current look`;
      const num = document.createElement('b');
      num.textContent = n;
      const what = document.createElement('span');
      what.className = 'what';
      what.textContent = scene ? scene.label : 'Empty';
      if (scene?.thumb) {
        b.classList.add('has-thumb');
        b.style.backgroundImage = `url("${scene.thumb}")`;
      }
      if (scene?.example) {
        b.classList.add('example');
        b.style.setProperty('--tint', scene.tint || 'var(--tab)');
      }
      b.append(num, what);
      if (scene?.icon) {
        const ico = document.createElement('span');
        ico.className = 'ico';
        ico.textContent = scene.icon;
        b.append(ico);
      }
      // An empty slot saves straight away; a full one needs Save mode.
      b.addEventListener('click', () => (show.saving || !scene ? saveScene(n) : recallScene(n)));
      return b;
    })
  );
}

ui.outputRow.hidden = TOUCH_ONLY; // phones and tablets: no second window
ui.scenesHint.textContent = scenesHint();
// The first real key press on a touch screen means a keyboard: show the
// key hints from then on.
document.addEventListener('keydown', (e) => {
  if (!e.isTrusted || keysInUse()) return;
  document.body.classList.add('has-keys');
  ui.punchHint.textContent = punchHint();
  if (!show.saving) ui.scenesHint.textContent = scenesHint();
}, true);
ui.outputBtn.addEventListener('click', openOutput);
ui.outputClose.addEventListener('click', closeOutput);
ui.blackoutBtn.addEventListener('click', () => toggleBlackout());
ui.freezeBtn.addEventListener('click', () => ui.pause.click());
ui.safeBtn.addEventListener('click', safeLook);
ui.sceneSave.addEventListener('click', () => setSaving(!show.saving));
document.getElementById('examplesBtn').addEventListener('click', loadExamples);
loadScenes();
renderScenes();
renderLooks();
buildPunchButtons();
window.addEventListener('blur', () => releasePunches());

// Tablets held upright pin the picture along the top; the main controls
// column pins under it as well, but only if it fits below the picture.
const ctlMain = document.querySelector('.ctl-main');
function fitTabletLayout() {
  const upright = matchMedia('(min-width: 700px) and (orientation: portrait)').matches;
  const stageH = ui.stage.getBoundingClientRect().height;
  ui.controls.style.setProperty('--stage-h', `${Math.round(stageH)}px`);
  ui.controls.classList.toggle('pin-main', upright && stageH + 30 + ctlMain.offsetHeight + 12 <= innerHeight);
}
if (window.ResizeObserver) {
  const ro = new ResizeObserver(fitTabletLayout);
  ro.observe(ui.stage);
  ro.observe(ctlMain);
}
addEventListener('resize', fitTabletLayout);

// The logo's dot: a little emoji that keeps changing its mind.
const LOGO_DOTS = ['😀', '🔥', '🌈', '✨', '🤩', '🍩', '💀', '🐸', '💖', '⭐'];
let logoDotAt = 0;
function popLogoDot() {
  logoDotAt = (logoDotAt + 1 + Math.floor(Math.random() * (LOGO_DOTS.length - 1))) % LOGO_DOTS.length;
  ui.logoDot.textContent = LOGO_DOTS[logoDotAt];
  ui.logoDot.classList.remove('pop');
  void ui.logoDot.offsetWidth;
  ui.logoDot.classList.add('pop');
}
setInterval(() => !document.hidden && popLogoDot(), 4000);
ui.random.addEventListener('click', popLogoDot);

// ---------------------------------------------------------------------------
// Tabs: Look / Beat / Live / Photo, one open at a time (the choice is remembered)
// ---------------------------------------------------------------------------

let currentTab = 'look';

function setTab(name) {
  if (name === 'sound') name = 'beat'; // its old name, maybe remembered
  if ((name === 'photo' && !isPhotoSource()) || !ui.tabPanels.some((p) => p.dataset.panel === name)) name = 'look';
  currentTab = name;
  for (const b of ui.tabButtons) b.setAttribute('aria-selected', String(b.dataset.tab === name));
  for (const p of ui.tabPanels) p.hidden = p.dataset.panel !== name;
  ui.controls.dataset.tab = name; // each tab has its own signal colour
  try { localStorage.setItem('emojiFiedTab', name); } catch {}
}

for (const b of ui.tabButtons) b.addEventListener('click', () => setTab(b.dataset.tab));
try { setTab(localStorage.getItem('emojiFiedTab') || 'look'); } catch { setTab('look'); }

// ---------------------------------------------------------------------------
// Wiring
// ---------------------------------------------------------------------------

const signed = (v) => (v > 0 ? '+' : '') + v.toFixed(2);
const ADJUSTMENTS = [
  [ui.contrast, ui.contrastOut, (v) => v.toFixed(2)],
  [ui.bright, ui.brightOut, signed],
  [ui.sat, ui.satOut, (v) => v.toFixed(2)],
  [ui.shadows, ui.shadowsOut, signed],
  [ui.highlights, ui.highlightsOut, signed],
];

// Faders fill with the tab's colour up to their value (CSS reads --p).
function paintRange(el) {
  const min = +el.min || 0, max = +el.max || 100;
  el.style.setProperty('--p', `${((+el.value - min) / (max - min)) * 100}%`);
}
function paintRanges() {
  document.querySelectorAll('input[type="range"]').forEach(paintRange);
}
document.addEventListener('input', (e) => e.target.type === 'range' && paintRange(e.target));

function syncLabels() {
  paintRanges(); // values set from code (randomize, scenes, reset) too
  for (const [input, output, fmt] of ADJUSTMENTS) output.textContent = fmt(+input.value);
  ui.sensOut.textContent = `${(+ui.sens.value).toFixed(1)}×`;
  ui.posterColsOut.textContent = `${ui.posterCols.value} cols`;
  ui.fxOut.textContent = `${Math.round(+ui.fxStrength.value * 100)}%`;
}

function resetAdjustments() {
  for (const [input] of ADJUSTMENTS) input.value = input.defaultValue;
  ui.invert.checked = false;
  syncLabels();
  if (state.paused) render();
}

for (const ev of ['loadedmetadata', 'playing', 'pause', 'stalled', 'error']) {
  video.addEventListener(ev, () =>
    dbg(`video ${ev}: ${video.videoWidth}x${video.videoHeight} readyState=${video.readyState}`)
  );
}

ui.start.addEventListener('click', () => {
  dbg('start button click handler, onclick set=' + !!ui.start.onclick);
  if (!ui.start.onclick) useCamera();
});
ui.style.addEventListener('change', () => {
  forgetTried();
  applyStyle();
});
ui.custom.addEventListener('input', () => {
  clearTimeout(ui.custom._t);
  ui.custom._t = setTimeout(applyStyle, 250);
});
ui.cols.addEventListener('input', layout);
for (const [input] of ADJUSTMENTS) {
  input.addEventListener('input', () => { syncLabels(); if (state.paused) render(); });
}
ui.resetAdjust.addEventListener('click', resetAdjustments);
for (const el of [ui.match, ui.ink, ui.mirror, ui.invert, ui.blank]) {
  el.addEventListener('change', () => state.paused && render());
}
ui.flip.addEventListener('click', () => {
  closeMenu();
  switchCamera();
});
ui.flipFab.addEventListener('click', switchCamera);
ui.full.addEventListener('click', enterFullscreen);
ui.exitFull.addEventListener('click', exitFullscreen);
ui.airplay.addEventListener('click', openPlayer);
ui.playerAirplay.addEventListener('click', () => showAirplay(ui.liveVideo));
ui.playerPip.addEventListener('click', togglePip);
ui.playerFull.addEventListener('click', playerFullscreen);
ui.playerClose.addEventListener('click', closePlayer);
ui.playerMirror.addEventListener('click', () => {
  closePlayer();
  showOnTv();
});
ui.clipAirplay.addEventListener('click', () => showAirplay(ui.clipVideo));
for (const v of [ui.liveVideo, ui.clipVideo]) {
  v.addEventListener('webkitplaybacktargetavailabilitychanged', (e) => dbg(`AirPlay targets (${v.id}): ${e.availability}`));
  v.addEventListener('webkitcurrentplaybacktargetiswirelesschanged', () => {
    const on = v.webkitCurrentPlaybackTargetIsWireless;
    dbg(`AirPlay (${v.id}): ${on ? 'playing on a TV' : 'back on this device'}`);
    toast(on ? '📺 Playing on your TV' : '📺 AirPlay ended');
    if (!on && v === ui.liveVideo && ui.player.hidden && !inPip(v)) stopLive();
  });
}
ui.liveVideo.addEventListener('leavepictureinpicture', () => ui.player.hidden && stopLive());
ui.liveVideo.addEventListener('webkitpresentationmodechanged', () => {
  dbg(`live player presentation: ${ui.liveVideo.webkitPresentationMode}`);
  if (ui.player.hidden && !inPip(ui.liveVideo) && !ui.liveVideo.webkitCurrentPlaybackTargetIsWireless) stopLive();
});
ui.tvHintClose.addEventListener('click', () => (ui.tvHint.hidden = true));
document.addEventListener('fullscreenchange', onFullscreenChange);
document.addEventListener('webkitfullscreenchange', onFullscreenChange);
document.addEventListener('visibilitychange', () => isFull() && keepAwake(true));
for (const ev of ['pointerdown', 'pointermove', 'touchstart']) {
  ui.stage.addEventListener(ev, wakeControls, { passive: true });
}
ui.pause.addEventListener('click', () => {
  state.paused = !state.paused;
  setTool(ui.pause, state.paused ? '▶' : '⏸', state.paused ? 'Resume' : 'Pause');
  ui.freezeBtn.setAttribute('aria-pressed', String(state.paused));
  if (state.source === 'file' && state.fileKind === 'video') state.paused ? video.pause() : video.play().catch(() => {});
});
for (const b of ui.sourceButtons) {
  b.addEventListener('click', () => {
    const src = b.dataset.source;
    if (src === 'camera') useCamera();
    else if (src === 'file') chooseFile();
    else startScreen();
  });
}
ui.startFile.addEventListener('click', chooseFile);
ui.startScreen.addEventListener('click', startScreen);
ui.assemble.addEventListener('click', startAssemble);
ui.tetris.addEventListener('change', () => {
  tetris.plan = null;
  if (ui.tetris.checked) toast('🧱 Tetris: watch the pieces build the picture');
});
ui.tilt.addEventListener('change', () => {
  ui.tiltOpts.hidden = !ui.tilt.checked;
  if (ui.tilt.checked) enableTilt();
  else {
    window.removeEventListener('deviceorientation', onOrientation);
    ui.headTrack.checked = false;
    stopHeadTracking();
    motion.keys.clear();
    motion.tx = motion.ty = 0;
  }
});
ui.headTrack.addEventListener('change', () => (ui.headTrack.checked ? startHeadTracking() : stopHeadTracking()));
// Without a motion sensor (computers), the mouse over the picture tilts it.
ui.stage.addEventListener('pointermove', (e) => {
  if (!ui.tilt.checked || motion.sensor || head.on) return;
  const r = ui.stage.getBoundingClientRect();
  motion.tx = ((e.clientX - r.left) / r.width) * 2 - 1;
  motion.ty = ((e.clientY - r.top) / r.height) * 2 - 1;
});
ui.posterCols.addEventListener('input', syncLabels);
ui.makePoster.addEventListener('click', makePoster);
ui.posterClose.addEventListener('click', closePoster);
ui.posterDownload.addEventListener('click', () => {
  const a = document.createElement('a');
  a.href = poster.url;
  a.download = poster.file.name;
  a.click();
  toast('Poster downloaded');
});
ui.posterShare.addEventListener('click', async () => {
  try {
    await navigator.share({ files: [poster.file], title: 'emoji·fied poster' });
  } catch (err) {
    if (err.name !== 'AbortError') toast('Sharing failed, try Download');
  }
});
ui.fileInput.addEventListener('change', () => {
  const file = ui.fileInput.files[0];
  ui.fileInput.value = ''; // so picking the same file again still fires
  playFile(file);
});
if (!canShareScreen()) {
  ui.startScreen.hidden = true;
  ui.sourceButtons.find((b) => b.dataset.source === 'screen').hidden = true;
}
ui.snap.addEventListener('click', () => snapshot());
ui.copy.addEventListener('click', () => {
  closeMenu();
  copyText();
});
ui.moreBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  toggleMenu();
});
document.addEventListener('click', (e) => !ui.moreMenu.hidden && !ui.moreMenu.contains(e.target) && closeMenu());
ui.snapsItem.addEventListener('click', openSnaps);
ui.snapTray.addEventListener('click', openSnaps);
ui.snapSaveAll.addEventListener('click', () => saveSnaps(snaps));
ui.snapClear.addEventListener('click', clearSnaps);
ui.snapClose.addEventListener('click', closeSnaps);
ui.keysItem.addEventListener('click', () => toggleKeys(true));
ui.keysBtn.addEventListener('click', () => toggleKeys(true));
ui.keysClose.addEventListener('click', () => toggleKeys(false));
syncSnaps();
ui.random.addEventListener('click', () => randomize());
ui.mic.addEventListener('change', onSoundModeChange);
for (const el of [ui.wordsOn, ui.words, ui.wordsMode, ui.wordsMotion, ui.wordsColor, ui.wordsSize, ui.wordsPos, ui.wordsOutline]) {
  el.addEventListener('input', syncWords);
  el.addEventListener('change', syncWords);
}
ui.wordsOn.addEventListener('change', () => {
  // Turning words on with nothing typed: a nudge to the Words tab.
  if (ui.wordsOn.checked && !ui.words.value.trim()) {
    setTab('words');
    ui.words.focus();
  }
});
syncWords();
ui.mic.checked = false; // starts off, even if the browser restored the box
ui.midi.addEventListener('change', () => (ui.midi.checked ? enableMidi() : disableMidi()));
ui.midi.checked = false; // MIDI starts off, even if the browser restored the box
// No Web MIDI (Safari, so every iPhone and iPad): leave MIDI out entirely
// rather than show controls that can't work.
if (!navigator.requestMIDIAccess) {
  ui.midi.disabled = true;
  ui.midiChip.hidden = true;
  document.getElementById('learnSec').hidden = true;
}
const onBeatShapeChange = () => {
  const off = ui.beatShape.value === 'off';
  ui.beatOutlineRow.hidden = off; // outlines only apply to shapes
  if (off) sound.ripples = []; // clear any wave already on screen
};
ui.beatShape.addEventListener('change', onBeatShapeChange);
onBeatShapeChange(); // the browser may restore an earlier choice on reload
ui.sens.addEventListener('input', syncLabels);
ui.fxStrength.addEventListener('input', syncLabels);
const toggleRecording = () => (rec.recorder ? stopRecording() : startRecording());
ui.record.addEventListener('click', toggleRecording);
ui.clipShare.addEventListener('click', shareClip);
ui.clipDownload.addEventListener('click', downloadClip);
ui.clipDiscard.addEventListener('click', closeClip);
video.addEventListener('loadedmetadata', layout);

// Arrow keys tilt photos while "Tilt to move" is on (hold to lean).
const ARROWS = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'];
document.addEventListener('keydown', (e) => {
  if (!ARROWS.includes(e.key) || !ui.tilt.checked || !isPhotoSource()) return;
  // Leave arrows to controls that use them (sliders, menus, text fields).
  if (e.target.closest('select, textarea, input[type="range"], input[type="text"]')) return;
  e.preventDefault(); // don't scroll the page
  motion.keys.add(e.key);
});
document.addEventListener('keyup', (e) => motion.keys.delete(e.key));
window.addEventListener('blur', () => motion.keys.clear());

// Shortcuts; also called by the output window for keys pressed there.
function onKey(e) {
  if (e.target?.matches?.('input[type="text"], textarea, select')) return;
  if (e.metaKey || e.ctrlKey || e.altKey) return; // leave the browser's own shortcuts alone
  // Number row or keypad: 1-9 scenes (Shift saves), 0 the safe look.
  const digit = /^(?:Digit|Numpad)(\d)$/.exec(e.code || '')?.[1];
  if (digit) {
    const n = +digit;
    if (n === 0) safeLook();
    else if (e.shiftKey) saveScene(n);
    else recallScene(n);
    return;
  }
  const p = PUNCH_BY_KEY[e.key?.toLowerCase()];
  if (p) {
    if (!e.repeat) punchDown(p.id, e.shiftKey);
    return;
  }
  if (e.key === 'Escape' && learn.active) {
    setLearning(false);
    return;
  }
  // Record and switching camera deliberately have no keys: one slip of
  // the hand mid-show shouldn't start a recording or cut the camera.
  if (e.key === 'k') tapTempo();
  if (e.key === 'b') toggleBlackout();
  if (e.key === ' ') { e.preventDefault(); ui.pause.click(); }
  if (e.key === 'p') snapshot({ quiet: true });
  if (e.key === 'd') randomize();
  if (e.key === 't') ui.tetris.click();
  if (e.key === 'm') ui.wordsOn.click();
  if (e.key === '?') toggleKeys();
  if (e.key === 'Escape' && !ui.moreMenu.hidden) closeMenu();
  else if (e.key === 'Escape' && !ui.keysSheet.hidden) toggleKeys(false);
  else if (e.key === 'Escape' && !ui.snapSheet.hidden) closeSnaps();
  else if (e.key === 'Escape' && !ui.posterSheet.hidden) closePoster();
  else if (e.key === 'Escape' && !ui.player.hidden) closePlayer();
  else if (e.key === 'Escape' && !ui.clip.hidden) closeClip();
  else if (e.key === 'Escape' && document.body.classList.contains('immersive')) exitFullscreen();
}
document.addEventListener('keydown', onKey);

function onKeyUp(e) {
  const p = PUNCH_BY_KEY[e.key?.toLowerCase()];
  if (p) punchUp(p.id);
}
document.addEventListener('keyup', onKeyUp);

syncLabels();
requestAnimationFrame(loop);
try {
  applyStyle();
} catch (err) {
  ui.error.textContent = `Setup failed: ${err.message}`;
}
window.emojiFiedReady = '35';
dbg('app.js v35 initialised');
