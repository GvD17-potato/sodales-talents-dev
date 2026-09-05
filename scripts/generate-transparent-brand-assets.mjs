// Deterministic, dependency-free generator for transparent runtime derivatives
// of the official Sodales brand PNGs.
//
// WHY THIS EXISTS: the official source assets (docs/brand/assets/*.png) are
// flat opaque exports on a white background. Runtime uses (masking, dark
// surfaces) need an alpha-channel version. An earlier unauthorized attempt to
// produce one used AI image generation and introduced geometry distortion and
// stray-pixel artifacts; that attempt was reverted. This script replaces that
// approach with a fully deterministic, re-runnable, auditable algorithm:
// no AI, no tracing, no redraw, no resizing — pixel-for-pixel alpha recovery
// against the known, exact background/foreground colors already present in
// the source file.
//
// METHOD (standard "de-matte against a known solid background" recovery):
// The source PNG is a flat composite: C = alpha*F + (1-alpha)*White, where F
// is one of a small, known set of official flat brand colors. For each pixel
// we find the foreground reference (from `foregrounds` below) whose
// white-blend line the pixel's colour lies closest to, solve for alpha via
// least squares, and emit that reference colour at the recovered alpha. This
// preserves anti-aliased edges (partial alpha) and produces a clean cutout
// with no white halo, because edge pixels are re-composited from the exact
// official flat colour rather than left with residual white contamination.
//
// Usage: node scripts/generate-transparent-brand-assets.mjs

import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");

const WHITE = [255, 255, 255];
const ELECTRIC_VIOLET = [0x5e, 0x4f, 0xb3]; // 94, 79, 179 — confirmed exact match in both source PNGs
const GRAPHITE = [0x35, 0x37, 0x3b]; // 53, 55, 59 — documented CLAUDE.md palette value, matches the wordmark's dark ink within anti-aliasing/compression noise

const RESIDUAL_THRESHOLD = 10; // if a pixel doesn't lie near ANY known white-blend line within this Euclidean tolerance, treat it as fully opaque, original colour (safe fallback — never invents transparency it isn't sure of)
const WHITE_EPSILON = 2; // pixels within this distance of pure white are treated as fully transparent background

const jobs = [
  {
    label: "symbol",
    src: path.join(repoRoot, "docs/brand/assets/sodales-symbol.png"),
    dest: path.join(repoRoot, "apps/talents/public/media/sodales-symbol-transparent.png"),
    foregrounds: [{ name: "electric-violet", rgb: ELECTRIC_VIOLET }],
  },
  {
    label: "wordmark-horizontal",
    src: path.join(repoRoot, "docs/brand/assets/sodales-wordmark-horizontal.png"),
    dest: path.join(repoRoot, "apps/talents/public/media/sodales-wordmark-horizontal-transparent.png"),
    foregrounds: [
      { name: "electric-violet", rgb: ELECTRIC_VIOLET },
      { name: "graphite", rgb: GRAPHITE },
    ],
  },
];

function readPng(filePath) {
  const buf = fs.readFileSync(filePath);
  if (buf.readUInt32BE(0) !== 0x89504e47) throw new Error(`${filePath}: not a PNG`);
  let off = 8;
  let width, height, bitDepth, colorType;
  const idatChunks = [];
  while (off < buf.length) {
    const len = buf.readUInt32BE(off);
    const type = buf.toString("ascii", off + 4, off + 8);
    const data = buf.subarray(off + 8, off + 8 + len);
    if (type === "IHDR") {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      bitDepth = data.readUInt8(8);
      colorType = data.readUInt8(9);
      const interlace = data.readUInt8(12);
      if (interlace !== 0) throw new Error(`${filePath}: interlaced PNGs not supported`);
    } else if (type === "IDAT") {
      idatChunks.push(data);
    }
    off += 8 + len + 4;
    if (type === "IEND") break;
  }
  if (bitDepth !== 8) throw new Error(`${filePath}: expected 8-bit depth, got ${bitDepth}`);
  const channels = colorType === 2 ? 3 : colorType === 6 ? 4 : colorType === 0 ? 1 : null;
  if (!channels) throw new Error(`${filePath}: unsupported colorType ${colorType}`);

  const raw = zlib.inflateSync(Buffer.concat(idatChunks));
  const bpp = channels; // 8-bit depth => 1 byte per channel
  const stride = width * bpp;
  const pixels = Buffer.alloc(height * stride);
  let pos = 0;
  let prevLine = Buffer.alloc(stride);
  for (let y = 0; y < height; y++) {
    const filterType = raw[pos];
    pos++;
    const line = raw.subarray(pos, pos + stride);
    pos += stride;
    const outLine = Buffer.alloc(stride);
    for (let x = 0; x < stride; x++) {
      const a = x >= bpp ? outLine[x - bpp] : 0;
      const b = prevLine[x];
      const c = x >= bpp ? prevLine[x - bpp] : 0;
      let val = line[x];
      if (filterType === 1) val = (val + a) & 0xff;
      else if (filterType === 2) val = (val + b) & 0xff;
      else if (filterType === 3) val = (val + Math.floor((a + b) / 2)) & 0xff;
      else if (filterType === 4) {
        const p = a + b - c;
        const pa = Math.abs(p - a);
        const pb = Math.abs(p - b);
        const pc = Math.abs(p - c);
        const pred = pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
        val = (val + pred) & 0xff;
      } else if (filterType !== 0) {
        throw new Error(`${filePath}: unsupported filter type ${filterType}`);
      }
      outLine[x] = val;
    }
    outLine.copy(pixels, y * stride);
    prevLine = outLine;
  }
  return { width, height, channels, pixels };
}

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const typeBuf = Buffer.from(type, "ascii");
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length, 0);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([lenBuf, typeBuf, data, crcBuf]);
}

function encodePngRgba(width, height, rgba) {
  const stride = width * 4;
  const raw = Buffer.alloc(height * (stride + 1));
  for (let y = 0; y < height; y++) {
    raw[y * (stride + 1)] = 0; // filter type: none — deterministic, no adaptive-filter heuristic needed
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, y * stride + stride);
  }
  const compressed = zlib.deflateSync(raw, { level: 9 });

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr.writeUInt8(8, 8); // bit depth
  ihdr.writeUInt8(6, 9); // color type: RGBA
  ihdr.writeUInt8(0, 10);
  ihdr.writeUInt8(0, 11);
  ihdr.writeUInt8(0, 12);

  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  return Buffer.concat([signature, chunk("IHDR", ihdr), chunk("IDAT", compressed), chunk("IEND", Buffer.alloc(0))]);
}

function project(color, fg) {
  // Least-squares alpha for C = alpha*fg + (1-alpha)*white, solved across all 3 channels.
  let num = 0;
  let den = 0;
  for (let ch = 0; ch < 3; ch++) {
    const d = WHITE[ch] - fg[ch];
    num += (WHITE[ch] - color[ch]) * d;
    den += d * d;
  }
  const alpha = den === 0 ? 0 : Math.max(0, Math.min(1, num / den));
  let residual = 0;
  for (let ch = 0; ch < 3; ch++) {
    const predicted = alpha * fg[ch] + (1 - alpha) * WHITE[ch];
    residual += (predicted - color[ch]) ** 2;
  }
  return { alpha, residual: Math.sqrt(residual) };
}

function processImage(img, foregrounds) {
  const { width, height, channels, pixels } = img;
  const out = Buffer.alloc(width * height * 4);
  const stats = { transparent: 0, ambiguousFallback: 0, perForeground: Object.fromEntries(foregrounds.map((f) => [f.name, 0])) };

  for (let i = 0; i < width * height; i++) {
    const si = i * channels;
    const color = [pixels[si], pixels[si + 1], pixels[si + 2]];
    const di = i * 4;

    const distWhite = Math.hypot(color[0] - WHITE[0], color[1] - WHITE[1], color[2] - WHITE[2]);
    if (distWhite <= WHITE_EPSILON) {
      out[di] = foregrounds[0].rgb[0];
      out[di + 1] = foregrounds[0].rgb[1];
      out[di + 2] = foregrounds[0].rgb[2];
      out[di + 3] = 0;
      stats.transparent++;
      continue;
    }

    let best = null;
    for (const fg of foregrounds) {
      const { alpha, residual } = project(color, fg.rgb);
      if (!best || residual < best.residual) best = { fg, alpha, residual };
    }

    if (best.residual <= RESIDUAL_THRESHOLD) {
      out[di] = best.fg.rgb[0];
      out[di + 1] = best.fg.rgb[1];
      out[di + 2] = best.fg.rgb[2];
      out[di + 3] = Math.round(best.alpha * 255);
      stats.perForeground[best.fg.name]++;
    } else {
      // Ambiguous pixel not explained by any known white-blend line (e.g. two
      // foreground colours meeting with no white in between). Safe fallback:
      // keep it fully opaque with its original, unmodified colour rather than
      // guessing at transparency.
      out[di] = color[0];
      out[di + 1] = color[1];
      out[di + 2] = color[2];
      out[di + 3] = 255;
      stats.ambiguousFallback++;
    }
  }
  return { width, height, rgba: out, stats };
}

for (const job of jobs) {
  const img = readPng(job.src);
  const { width, height, rgba, stats } = processImage(img, job.foregrounds);
  const png = encodePngRgba(width, height, rgba);
  fs.mkdirSync(path.dirname(job.dest), { recursive: true });
  fs.writeFileSync(job.dest, png);

  const total = width * height;
  console.log(`\n=== ${job.label} ===`);
  console.log(`source: ${path.relative(repoRoot, job.src)}`);
  console.log(`output: ${path.relative(repoRoot, job.dest)}`);
  console.log(`dimensions: ${width}x${height} (unchanged from source)`);
  console.log(`transparent (background) pixels: ${stats.transparent} (${((stats.transparent / total) * 100).toFixed(1)}%)`);
  for (const [name, count] of Object.entries(stats.perForeground)) {
    console.log(`${name} pixels: ${count} (${((count / total) * 100).toFixed(1)}%)`);
  }
  console.log(`ambiguous-fallback (opaque, unmodified) pixels: ${stats.ambiguousFallback} (${((stats.ambiguousFallback / total) * 100).toFixed(2)}%)`);
}
