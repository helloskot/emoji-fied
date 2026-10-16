'use strict';

// Minimal animated GIF decoder. Browsers don't reliably expose a GIF's
// animation to <canvas> (Safari only ever draws the first frame), so the app
// decodes every frame itself: LZW image data, global/local palettes,
// interlacing, transparency, per-frame delays and disposal methods.
//
// decodeGif(arrayBuffer) -> { width, height, frames: [{ x, y, w, h, idx,
//   palette, transparent, disposal, delay }] }
// Frames keep palette indices (1 byte per pixel) rather than RGBA, so long
// GIFs stay small in memory; the player composites them as they play.

function decodeGif(buffer) {
  const b = new Uint8Array(buffer);
  let p = 0;
  const u16 = () => {
    const v = b[p] | (b[p + 1] << 8);
    p += 2;
    return v;
  };

  const sig = String.fromCharCode(...b.subarray(0, 6));
  if (sig !== 'GIF87a' && sig !== 'GIF89a') throw new Error('Not a GIF');
  p = 6;
  const width = u16();
  const height = u16();
  const packed = b[p++];
  p += 2; // background colour index, pixel aspect ratio

  let globalPalette = null;
  if (packed & 0x80) {
    const n = 2 << (packed & 7);
    globalPalette = b.subarray(p, p + n * 3);
    p += n * 3;
  }

  const readSubBlocks = () => {
    const parts = [];
    let total = 0;
    for (let len = b[p++]; len; len = b[p++]) {
      parts.push(b.subarray(p, p + len));
      total += len;
      p += len;
    }
    const data = new Uint8Array(total);
    let o = 0;
    for (const part of parts) {
      data.set(part, o);
      o += part.length;
    }
    return data;
  };
  const skipSubBlocks = () => {
    for (let len = b[p++]; len; len = b[p++]) p += len;
  };

  const frames = [];
  let control = null; // the Graphic Control Extension for the next image

  while (p < b.length) {
    const block = b[p++];
    if (block === 0x3b) break; // trailer
    if (block === 0x21) {
      const label = b[p++];
      if (label === 0xf9) {
        const size = b[p++];
        const flags = b[p];
        control = {
          disposal: (flags >> 2) & 7,
          transparent: flags & 1 ? b[p + 3] : -1,
          delay: b[p + 1] | (b[p + 2] << 8), // hundredths of a second
        };
        p += size;
        skipSubBlocks();
      } else {
        skipSubBlocks(); // application, comment, plain text
      }
    } else if (block === 0x2c) {
      const x = u16(), y = u16(), w = u16(), h = u16();
      const flags = b[p++];
      let palette = globalPalette;
      if (flags & 0x80) {
        const n = 2 << (flags & 7);
        palette = b.subarray(p, p + n * 3);
        p += n * 3;
      }
      const minCodeSize = b[p++];
      let idx = lzwDecode(minCodeSize, readSubBlocks(), w * h);
      if (flags & 0x40) idx = deinterlace(idx, w, h);
      frames.push({
        x, y, w, h, idx,
        palette: palette || GRAY_PALETTE,
        transparent: control ? control.transparent : -1,
        disposal: control ? control.disposal : 0,
        // Like browsers: delays of 0 or 1 (often "as fast as possible") play at 100 ms.
        delay: control && control.delay > 1 ? control.delay * 10 : 100,
      });
      control = null;
    } else {
      break; // unknown block: stop with what we have
    }
  }
  return { width, height, frames };
}

const GRAY_PALETTE = (() => {
  const pal = new Uint8Array(256 * 3);
  for (let i = 0; i < 256; i++) pal[i * 3] = pal[i * 3 + 1] = pal[i * 3 + 2] = i;
  return pal;
})();

// Variable-width LZW, as used by GIF. Each dictionary entry is stored as
// (prefix code, last byte, first byte); strings are unwound onto a stack.
function lzwDecode(minCodeSize, data, pixelCount) {
  const out = new Uint8Array(pixelCount);
  const clear = 1 << minCodeSize;
  const eoi = clear + 1;
  const prefix = new Int16Array(4096);
  const suffix = new Uint8Array(4096);
  const first = new Uint8Array(4096);
  const stack = new Uint8Array(4097);
  for (let i = 0; i < clear; i++) {
    prefix[i] = -1;
    suffix[i] = first[i] = i;
  }

  let codeSize = minCodeSize + 1;
  let codeMask = (1 << codeSize) - 1;
  let next = eoi + 1;
  let old = -1;
  let datum = 0, bits = 0, pi = 0, op = 0;

  while (op < pixelCount) {
    while (bits < codeSize) {
      if (pi >= data.length) return out; // truncated data: keep what we have
      datum |= data[pi++] << bits;
      bits += 8;
    }
    let code = datum & codeMask;
    datum >>>= codeSize;
    bits -= codeSize;

    if (code === clear) {
      codeSize = minCodeSize + 1;
      codeMask = (1 << codeSize) - 1;
      next = eoi + 1;
      old = -1;
      continue;
    }
    if (code === eoi) break;
    if (old === -1) {
      out[op++] = suffix[code];
      old = code;
      continue;
    }

    const inCode = code;
    let sp = 0;
    let firstChar;
    if (code >= next) {
      // The "KwKwK" case: the code being defined right now.
      firstChar = first[old];
      stack[sp++] = firstChar;
      code = old;
    } else {
      firstChar = first[code];
    }
    while (code > eoi) {
      stack[sp++] = suffix[code];
      code = prefix[code];
    }
    stack[sp++] = code; // a root code is its own byte
    while (sp && op < pixelCount) out[op++] = stack[--sp];

    if (next < 4096) {
      prefix[next] = old;
      suffix[next] = firstChar;
      first[next] = first[old];
      next++;
      if (next > codeMask && codeSize < 12) {
        codeSize++;
        codeMask = (1 << codeSize) - 1;
      }
    }
    old = inCode;
  }
  return out;
}

// Interlaced GIFs store rows in four passes: every 8th from 0, every 8th
// from 4, every 4th from 2, then every 2nd from 1.
function deinterlace(src, w, h) {
  const out = new Uint8Array(src.length);
  let row = 0;
  for (const [start, step] of [[0, 8], [4, 8], [2, 4], [1, 2]]) {
    for (let y = start; y < h; y += step) {
      out.set(src.subarray(row * w, row * w + w), y * w);
      row++;
    }
  }
  return out;
}
