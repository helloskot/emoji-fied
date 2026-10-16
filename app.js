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
  pause: $('#pause'),
  snap: $('#snap'),
  copy: $('#copy'),
  record: $('#record'),
  recordFab: $('#recordFab'),
  recordFabTime: $('#recordFabTime'),
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
  if (state.stream) ui.stage.style.aspectRatio = `${out.width} / ${out.height}`;

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
  if (fx) ctx.setTransform(1, 0, 0, 1, 0, 0);
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
}

// ---------------------------------------------------------------------------
// Loop
// ---------------------------------------------------------------------------

let frames = 0;
let fpsT = performance.now();

function loop() {
  // Show the on-camera record button only while the live view is up.
  const showFab = !!state.stream && ui.overlay.hidden;
  if (ui.recordFab.hidden === showFab) ui.recordFab.hidden = !showFab;
  const showFlip = showFab && state.cameraCount !== 1;
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
    ui.fps.textContent = state.stream ? `${state.cols}×${state.rows} · ${frames} fps` : '';
    if (state.stream && (loop.ticks = (loop.ticks || 0) + 1) <= 10) dbg(`running: ${frames} fps`);
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
  if (!state.stream) {
    toast('Start the camera first');
    return;
  }
  // While "React to sound" is on, the microphone goes into the clip too.
  const audioTracks = sound.stream ? sound.stream.getAudioTracks().filter((t) => t.readyState === 'live') : [];
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

// Keep both record buttons (the one in the controls and the one over the
// camera view) in sync. `time` is null when not recording.
function setRecordUI(time) {
  const recording = time !== null;
  ui.record.classList.toggle('recording', recording);
  ui.record.textContent = recording ? `⏹ Stop ${time}` : '⏺ Record';
  ui.recordFab.classList.toggle('recording', recording);
  ui.recordFab.setAttribute('aria-label', recording ? 'Stop recording' : 'Start recording');
  ui.recordFabTime.textContent = recording ? time : '';
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
    ui.status.textContent = 'Safari needs one more tap to show the video.';
    ui.start.textContent = 'Tap to show camera';
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
  ripples: [], // start times of beat ripples
};

const RIPPLE_MS = 700;

const soundPulses = () => ui.sound.value === 'pulse' || ui.sound.value === 'both';
const soundShuffles = () => ui.sound.value === 'shuffle' || ui.sound.value === 'both';
// Per-frame sound effects for the renderer, or null when off or silent.
function soundFx() {
  if (!sound.analyser || !soundPulses()) return null;
  const strength = +ui.fxStrength.value;
  if (strength <= 0) return null;
  const now = performance.now();
  const maxD = Math.hypot(out.width, out.height) / 2;
  const ripples = [];
  for (const t0 of sound.ripples) {
    const age = (now - t0) / RIPPLE_MS;
    if (age < 1) ripples.push({ r: age * maxD, w: maxD * 0.16, amp: strength * 1.5 * (1 - age) });
  }
  const fx = {
    swell: strength * sound.level * 1.5,
    kick: strength * sound.kick,
    hue: strength * sound.hue,
    ripples,
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
    const d = Math.hypot((x + 0.5) * cellW - fx.cx, (y + 0.5) * cellH - fx.cy);
    for (const rp of fx.ripples) {
      const t = 1 - Math.abs(d - rp.r) / rp.w;
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

async function startMic() {
  // Create/resume the audio context synchronously inside the user's tap;
  // iOS only lets audio start from a gesture.
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) throw new Error('Web Audio is not supported');
  sound.ctx = sound.ctx || new AC();
  sound.ctx.resume?.().catch(() => {});
  dbg('requesting microphone');
  // Raw signal: echo cancellation, noise suppression and auto gain would
  // flatten music and claps.
  sound.stream = await navigator.mediaDevices.getUserMedia({
    audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
  });
  const src = sound.ctx.createMediaStreamSource(sound.stream);
  sound.analyser = sound.ctx.createAnalyser();
  sound.analyser.fftSize = 1024;
  sound.analyser.smoothingTimeConstant = 0;
  src.connect(sound.analyser); // not connected to the speakers: no feedback
  sound.buf = new Float32Array(sound.analyser.fftSize);
  sound.peak = 0.01;
  sound.avg = 0;
  dbg(`microphone on, audio context ${sound.ctx.state}, ${sound.ctx.sampleRate} Hz`);
}

function stopMic() {
  sound.stream?.getTracks().forEach((t) => t.stop());
  sound.stream = null;
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
    await startMic();
    toast(mode === 'pulse' ? '🎤 Pulsing to sound' : '🎤 Listening for beats');
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
    sound.ripples = sound.ripples.filter((t) => now - t < RIPPLE_MS).concat(now).slice(-4);
    ui.meter.classList.remove('beat');
    void ui.meter.offsetWidth;
    ui.meter.classList.add('beat');
    if (soundShuffles() && state.stream && !state.paused && now - sound.lastShuffle > 600) {
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
  if (!ui.start.onclick) startCamera();
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
ui.pause.addEventListener('click', () => {
  state.paused = !state.paused;
  ui.pause.textContent = state.paused ? '▶ Resume' : '⏸ Pause';
});
ui.snap.addEventListener('click', snapshot);
ui.copy.addEventListener('click', copyText);
ui.random.addEventListener('click', () => randomize());
ui.sound.addEventListener('change', onSoundModeChange);
ui.sens.addEventListener('input', syncLabels);
ui.fxStrength.addEventListener('input', syncLabels);
const toggleRecording = () => (rec.recorder ? stopRecording() : startRecording());
ui.record.addEventListener('click', toggleRecording);
ui.recordFab.addEventListener('click', toggleRecording);
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
  if (e.key === 'Escape' && !ui.clip.hidden) closeClip();
});

syncLabels();
requestAnimationFrame(loop);
try {
  applyStyle();
} catch (err) {
  ui.error.textContent = `Setup failed: ${err.message}`;
}
window.emojiFiedReady = '12';
dbg('app.js v12 initialised');
