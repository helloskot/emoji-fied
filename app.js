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
  error: $('#error'),
  status: $('#status'),
  style: $('#style'),
  random: $('#random'),
  sound: $('#sound'),
  meter: $('#meter'),
  meterFill: $('#meterFill'),
  soundOpts: $('#soundOpts'),
  sens: $('#sens'),
  sensOut: $('#sensOut'),
  fxStrength: $('#fxStrength'),
  fxOut: $('#fxOut'),
  beatShape: $('#beatShape'),
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
  return pal;
}

function buildTextPalette(chars) {
  const glyphs = [...new Set(graphemes(chars))];
  const pal = buildAtlas(glyphs, { emoji: false, cw: 30, ch: 50 });
  pal.entries.sort((x, y) => x.density - y.density);
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
  let best = Infinity;
  const es = pal.entries;
  for (let i = 0; i < es.length; i++) {
    const d = colorDist(qr, qg, qb, es[i].r, es[i].g, es[i].b);
    if (d < best) { best = d; idx = i; }
  }
  pal.lut[key] = idx;
  return idx;
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

function layout() {
  state.cols = +ui.cols.value;
  ui.colsOut.textContent = `${state.cols} cols`;

  const vw = video.videoWidth || 640;
  const vh = video.videoHeight || 480;
  const aspect =
    state.kind === 'emoji' ? 1 : state.kind === 'braille' ? BRAILLE_ASPECT : TEXT_ASPECT;

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

function grabFrame() {
  const sw = sample.width, sh = sample.height;
  sctx.save();
  sctx.imageSmoothingEnabled = true;
  sctx.imageSmoothingQuality = 'high';
  if (ui.mirror.checked) {
    sctx.translate(sw, 0);
    sctx.scale(-1, 1);
  }
  sctx.drawImage(video, 0, 0, sw, sh);
  sctx.restore();

  // Apply the adjustments in place so the full-color tint pass below sees
  // the same adjusted colors. This runs on the small sample canvas (one
  // pixel per cell), so it's cheap.
  const img = sctx.getImageData(0, 0, sw, sh);
  const d = img.data;
  const c = +ui.contrast.value;
  const fx = state.fx;
  const br = (+ui.bright.value + (fx ? fx.swell * 0.06 + fx.kick * 0.22 : 0)) * 255;
  const sat = +ui.sat.value * (fx ? 1 + fx.kick * 0.8 : 1);
  // Beat hue shift: a luminance-preserving hue rotation matrix.
  const hue = fx && Math.abs(fx.hue) > 0.5 ? (fx.hue * Math.PI) / 180 : 0;
  const hc = Math.cos(hue), hs = Math.sin(hue);
  const m00 = 0.213 + hc * 0.787 - hs * 0.213, m01 = 0.715 - hc * 0.715 - hs * 0.715, m02 = 0.072 - hc * 0.072 + hs * 0.928;
  const m10 = 0.213 - hc * 0.213 + hs * 0.143, m11 = 0.715 + hc * 0.285 + hs * 0.14, m12 = 0.072 - hc * 0.072 - hs * 0.283;
  const m20 = 0.213 - hc * 0.213 - hs * 0.787, m21 = 0.715 - hc * 0.715 + hs * 0.715, m22 = 0.072 + hc * 0.928 + hs * 0.072;
  const shd = +ui.shadows.value;
  const hil = +ui.highlights.value;
  const tone = shd !== 0 || hil !== 0;
  const inv = ui.invert.checked;
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
  sctx.putImageData(img, 0, 0);
  return d;
}

function render() {
  state.fx = soundFx();
  const d = grabFrame();
  ctx.fillStyle = BG;
  ctx.fillRect(0, 0, out.width, out.height);

  if (state.kind === 'emoji') renderEmoji(d);
  else renderText(d);
}

function renderEmoji(d) {
  const pal = state.palette;
  const { cols, rows, cellW, cellH } = state;
  const byBrightness = ui.match.value === 'brightness';
  const blank = ui.blank.checked;
  const n = pal.byLum.length;
  const grid = state.lastGlyphs;
  const fx = state.fx;
  if (fx) zoomPunch(ctx, fx);

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
        e = pal.byLum[Math.min(n - 1, ((l / 256) * n) | 0)];
      } else {
        e = pal.entries[nearestEmoji(pal, r, g, b)];
      }
      grid[y * cols + x] = e.i;
      if (fx) drawCellFx(ctx, pal, e, x, y, cellW, cellH, fx, l / 255);
      else ctx.drawImage(pal.atlas, e.sx, e.sy, pal.cw, pal.ch, x * cellW, y * cellH, cellW, cellH);
    }
  }
  if (fx) {
    drawBeatOutlines(ctx, fx);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  }
}

function renderText(d) {
  const pal = state.palette;
  const { cols, rows, cellW, cellH } = state;
  const es = pal.entries;
  const n = es.length;
  const grid = state.lastGlyphs;
  const braille = state.kind === 'braille';
  const sw = sample.width;
  const fx = state.fx;

  lctx.globalCompositeOperation = 'source-over';
  lctx.clearRect(0, 0, layer.width, layer.height);
  if (fx) zoomPunch(lctx, fx);

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
      } else {
        const p = (y * cols + x) * 4;
        const l = luma(d[p], d[p + 1], d[p + 2]) / 256;
        idx = Math.min(n - 1, (l * n) | 0);
      }
      grid[y * cols + x] = idx;
      const e = es[idx];
      if (e.density === 0) continue;
      if (fx) drawCellFx(lctx, pal, e, x, y, cellW, cellH, fx, braille ? 0.8 : idx / (n - 1));
      else lctx.drawImage(pal.atlas, e.sx, e.sy, pal.cw, pal.ch, x * cellW, y * cellH, cellW, cellH);
    }
  }

  // Tint the white glyph mask.
  lctx.globalCompositeOperation = 'source-in';
  const ink = ui.ink.value;
  if (ink === 'full') {
    lctx.imageSmoothingEnabled = false;
    lctx.filter = 'saturate(1.3) brightness(1.25)';
    lctx.drawImage(sample, 0, 0, layer.width, layer.height);
    lctx.filter = 'none';
  } else {
    lctx.fillStyle = ink;
    lctx.fillRect(0, 0, layer.width, layer.height);
  }
  if (fx) lctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.drawImage(layer, 0, 0);
  if (fx) {
    zoomPunch(ctx, fx);
    drawBeatOutlines(ctx, fx);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  }
}

// ---------------------------------------------------------------------------
// Loop
// ---------------------------------------------------------------------------

let frames = 0;
let fpsT = performance.now();

function loop() {
  // Show the on-camera record button only while the live view is up.
  const showFlip = state.source === 'camera' && !!state.stream && ui.overlay.hidden && state.cameraCount !== 1;
  if (ui.flipFab.hidden === showFlip) ui.flipFab.hidden = !showFlip;
  updateSound();
  if (rec.recorder) copyFrameToRecording();
  if (!state.paused && video.readyState >= 2) {
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
  ui.record.textContent = recording ? `⏹ Stop ${time}` : '⏺ Record';
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

// Stop whatever is showing (camera/screen tracks, or the file).
function stopCurrentSource() {
  state.stream?.getTracks().forEach((t) => t.stop());
  state.stream = null;
  media.screenAudio?.disconnect();
  media.screenAudio = null;
  if (state.fileUrl) {
    video.pause();
    video.removeAttribute('src');
    video.load();
    URL.revokeObjectURL(state.fileUrl);
    state.fileUrl = null;
  }
}

function updateSourceUI() {
  for (const b of ui.sourceButtons) b.setAttribute('aria-pressed', String(b.dataset.source === state.source));
  ui.flip.disabled = state.source !== 'camera';
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
  dbg(`video file: ${file.name}, ${(file.size / 1e6).toFixed(1)} MB, ${file.type}`);
  stopCurrentSource();
  state.source = 'file';
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
  if (state.source === 'file' && media.elSource) {
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

function snapshot() {
  out.toBlob((blob) => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `emoji-fied-${Date.now()}.png`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    toast('Snapshot saved');
  }, 'image/png');
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

const soundPulses = () => ui.sound.value === 'pulse' || ui.sound.value === 'both';
const soundShuffles = () => ui.sound.value === 'shuffle' || ui.sound.value === 'both';
// Per-frame sound effects for the renderer, or null when off or silent.
function soundFx() {
  if (!sound.analyser || !soundPulses()) return null;
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
  const fx = {
    swell: strength * sound.level * 1.5,
    kick: strength * sound.kick,
    hue: strength * sound.hue,
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

// Draw one glyph with the sound effects: swell (brighter cells more),
// passing beat ripples, and a shake on beats.
function drawCellFx(c, pal, e, x, y, cellW, cellH, fx, bright) {
  let k = 1 + fx.swell * (0.3 + 0.7 * bright);
  if (fx.ripples.length) {
    const px = (x + 0.5) * cellW, py = (y + 0.5) * cellH;
    for (const rp of fx.ripples) {
      const t = 1 - Math.abs(waveDist(rp, px, py, rp.rotNow) - rp.r) / rp.w;
      if (t > 0) k += rp.amp * t;
    }
  }
  const w = cellW * k, h = cellH * k;
  let dx = x * cellW - (w - cellW) / 2, dy = y * cellH - (h - cellH) / 2;
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
  if (ui.sound.value === 'off') return;
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
  let node = state.source === 'file' ? media.elSource : state.source === 'screen' ? media.screenAudio : null;
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

async function onSoundModeChange() {
  const mode = ui.sound.value;
  ui.meter.hidden = mode === 'off';
  ui.soundOpts.hidden = mode === 'off';
  if (mode === 'off') {
    stopMic();
    return;
  }
  if (sound.analyser) return;
  try {
    await connectSoundInput();
    const what = state.source === 'file' ? 'the video' : state.source === 'screen' && media.screenAudio ? 'the shared tab' : null;
    if (what) toast(`🎵 Reacting to ${what}’s sound`);
    else toast(mode === 'pulse' ? '🎤 Pulsing to sound' : '🎤 Listening for beats');
  } catch (err) {
    dbg('microphone failed:', err.name, err.message);
    ui.sound.value = 'off';
    ui.meter.hidden = true;
    ui.soundOpts.hidden = true;
    toast(err.name === 'NotAllowedError' ? 'Microphone permission was denied' : 'Couldn’t start the microphone');
  }
}

// Called every frame: measure loudness, smooth it, and detect beats.
function updateSound() {
  if (!sound.analyser) return;
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

  // Beat: a jump above the recent average loudness.
  const now = performance.now();
  const isBeat = rms > sound.avg * (1 + 0.9 / sens) && rms > 0.004 / sens && now - sound.lastBeat > 160;
  sound.avg = sound.avg * 0.93 + rms * 0.07;
  sound.kick *= 0.86;
  sound.hue *= 0.96;
  if (isBeat) {
    sound.lastBeat = now;
    sound.kick = 1;
    sound.hue += (Math.random() < 0.5 ? -1 : 1) * (50 + Math.random() * 60);
    if (soundPulses()) spawnWave(now);
    ui.meter.classList.remove('beat');
    void ui.meter.offsetWidth;
    ui.meter.classList.add('beat');
    if (soundShuffles() && hasSource() && !state.paused && now - sound.lastShuffle > 600) {
      sound.lastShuffle = now;
      randomize({ quiet: true, keepDetail: true });
    }
  }
  ui.meterFill.style.transform = `scaleX(${sound.level.toFixed(3)})`;
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
  for (const el of [ui.clip, ui.player, ui.toast]) if (el.parentNode !== host) host.appendChild(el);
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

function syncLabels() {
  for (const [input, output, fmt] of ADJUSTMENTS) output.textContent = fmt(+input.value);
  ui.sensOut.textContent = `${(+ui.sens.value).toFixed(1)}×`;
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
ui.style.addEventListener('change', applyStyle);
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
ui.flip.addEventListener('click', switchCamera);
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
  ui.pause.textContent = state.paused ? '▶ Resume' : '⏸ Pause';
  if (state.source === 'file') state.paused ? video.pause() : video.play().catch(() => {});
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
ui.fileInput.addEventListener('change', () => {
  const file = ui.fileInput.files[0];
  ui.fileInput.value = ''; // so picking the same file again still fires
  playFile(file);
});
if (!canShareScreen()) {
  ui.startScreen.hidden = true;
  ui.sourceButtons.find((b) => b.dataset.source === 'screen').hidden = true;
}
ui.snap.addEventListener('click', snapshot);
ui.copy.addEventListener('click', copyText);
ui.random.addEventListener('click', () => randomize());
ui.sound.addEventListener('change', onSoundModeChange);
ui.sens.addEventListener('input', syncLabels);
ui.fxStrength.addEventListener('input', syncLabels);
const toggleRecording = () => (rec.recorder ? stopRecording() : startRecording());
ui.record.addEventListener('click', toggleRecording);
ui.clipShare.addEventListener('click', shareClip);
ui.clipDownload.addEventListener('click', downloadClip);
ui.clipDiscard.addEventListener('click', closeClip);
video.addEventListener('loadedmetadata', layout);

document.addEventListener('keydown', (e) => {
  if (e.target.matches('input[type="text"], select')) return;
  if (e.key === ' ') { e.preventDefault(); ui.pause.click(); }
  if (e.key === 's') snapshot();
  if (e.key === 'r') ui.record.click();
  if (e.key === 'd') randomize();
  if (e.key === 'f') switchCamera();
  if (e.key === 'Escape' && !ui.player.hidden) closePlayer();
  else if (e.key === 'Escape' && !ui.clip.hidden) closeClip();
  else if (e.key === 'Escape' && document.body.classList.contains('immersive')) exitFullscreen();
});

syncLabels();
requestAnimationFrame(loop);
try {
  applyStyle();
} catch (err) {
  ui.error.textContent = `Setup failed: ${err.message}`;
}
window.emojiFiedReady = '17';
dbg('app.js v17 initialised');
