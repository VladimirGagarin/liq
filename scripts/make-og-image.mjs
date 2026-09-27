// Generates public/og.png — a 1200x630 share card drawn with a minimal software
// rasterizer and encoded by hand, so the project keeps zero image dependencies.
// Run: node scripts/make-og-image.mjs
import { deflateSync } from 'node:zlib'
import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const W = 1200
const H = 630
const SS = 3 // supersampling factor, gives antialiasing for free
const w = W * SS
const h = H * SS

const PAPER = [0xfa, 0xf9, 0xf7]
const INK = [0x14, 0x13, 0x1a]
const ACCENT = [0x7a, 0x5a, 0xf8]
const FAINT = [0xe6, 0xe3, 0xdd]

const canvas = new Uint8Array(w * h * 3)
for (let i = 0; i < w * h; i++) {
  canvas[i * 3] = PAPER[0]
  canvas[i * 3 + 1] = PAPER[1]
  canvas[i * 3 + 2] = PAPER[2]
}

const px = (x, y, rgb) => {
  if (x < 0 || y < 0 || x >= w || y >= h) return
  const at = (y * w + x) * 3
  canvas[at] = rgb[0]
  canvas[at + 1] = rgb[1]
  canvas[at + 2] = rgb[2]
}

const fillRect = (x0, y0, x1, y1, rgb) => {
  for (let y = Math.round(y0); y < Math.round(y1); y++) {
    for (let x = Math.round(x0); x < Math.round(x1); x++) px(x, y, rgb)
  }
}

const segmentDistance = (x, y, ax, ay, bx, by) => {
  const dx = bx - ax
  const dy = by - ay
  const lengthSq = dx * dx + dy * dy
  let t = lengthSq === 0 ? 0 : ((x - ax) * dx + (y - ay) * dy) / lengthSq
  t = Math.max(0, Math.min(1, t))
  const nx = ax + t * dx
  const ny = ay + t * dy
  return Math.hypot(x - nx, y - ny)
}

const ring = (cx, cy, radius, thickness, rgb, gap) => {
  const pad = thickness
  for (let y = Math.max(0, Math.floor(cy - radius - pad)); y < Math.min(h, cy + radius + pad + 1); y++) {
    for (let x = Math.max(0, Math.floor(cx - radius - pad)); x < Math.min(w, cx + radius + pad + 1); x++) {
      const d = Math.hypot(x + 0.5 - cx, y + 0.5 - cy)
      if (Math.abs(d - radius) > thickness / 2) continue
      if (gap) {
        let angle = (Math.atan2(y + 0.5 - cy, x + 0.5 - cx) * 180) / Math.PI
        if (angle < 0) angle += 360
        if (angle >= gap[0] && angle <= gap[1]) continue
      }
      px(x, y, rgb)
    }
  }
}

const stroke = (ax, ay, bx, by, thickness, rgb) => {
  const pad = thickness
  for (let y = Math.max(0, Math.floor(Math.min(ay, by) - pad)); y < Math.min(h, Math.ceil(Math.max(ay, by) + pad) + 1); y++) {
    for (let x = Math.max(0, Math.floor(Math.min(ax, bx) - pad)); x < Math.min(w, Math.ceil(Math.max(ax, bx) + pad) + 1); x++) {
      if (segmentDistance(x + 0.5, y + 0.5, ax, ay, bx, by) <= thickness / 2) px(x, y, rgb)
    }
  }
}

const dot = (cx, cy, radius, rgb) => {
  for (let y = Math.max(0, Math.floor(cy - radius)); y < Math.min(h, Math.ceil(cy + radius) + 1); y++) {
    for (let x = Math.max(0, Math.floor(cx - radius)); x < Math.min(w, Math.ceil(cx + radius) + 1); x++) {
      if (Math.hypot(x + 0.5 - cx, y + 0.5 - cy) <= radius) px(x, y, rgb)
    }
  }
}

// The question mark: a ring open at the lower left, a stem hanging from where the
// stroke ends, and a dot. Laid out in final pixels, then scaled by SS.
const questionMark = (cx, cy, radius, thickness) => {
  ring(cx, cy, radius, thickness, ACCENT, [96, 152])
  const endAngle = (96 * Math.PI) / 180
  const ex = cx + Math.cos(endAngle) * radius
  const ey = cy + Math.sin(endAngle) * radius
  stroke(ex + 6 * SS, ey - 4 * SS, cx - 6 * SS, ey + 76 * SS, thickness, ACCENT)
  dot(cx - 8 * SS, ey + 132 * SS, thickness * 0.5, ACCENT)
}

// Geometric L\IQ wordmark: two bars for L, a diagonal, a bar for I, a ring for Q.
const wordmark = (x, y, cap) => {
  const t = cap * 0.17
  let cursor = x + t / 2
  const bar = (a, b) => stroke(cursor, a, cursor, b, t, INK)
  bar(y, y + cap)
  fillRect(cursor - t / 2, y + cap - t, cursor + cap * 0.6, y + cap, INK)
  cursor += t + cap * 0.6 + cap * 0.18
  stroke(cursor, y, cursor + cap * 0.5, y + cap, t, INK)
  cursor += cap * 0.5 + cap * 0.18
  bar(y, y + cap)
  cursor += t + cap * 0.18
  const radius = cap / 2
  const qx = cursor + radius
  const qy = y + radius
  ring(qx, qy, radius, t, INK)
  stroke(qx + radius * 0.3, qy + radius * 0.3, qx + radius * 1.08, qy + radius * 1.08, t, INK)
}

questionMark(600 * SS, 252 * SS, 152 * SS, 46 * SS)
wordmark(84 * SS, 516 * SS, 42 * SS)
fillRect(0, h - 7 * SS, w, h, FAINT)

const out = Buffer.alloc(W * H * 3)
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    let r = 0
    let g = 0
    let b = 0
    for (let sy = 0; sy < SS; sy++) {
      for (let sx = 0; sx < SS; sx++) {
        const at = ((y * SS + sy) * w + (x * SS + sx)) * 3
        r += canvas[at]
        g += canvas[at + 1]
        b += canvas[at + 2]
      }
    }
    const count = SS * SS
    const at = (y * W + x) * 3
    out[at] = Math.round(r / count)
    out[at + 1] = Math.round(g / count)
    out[at + 2] = Math.round(b / count)
  }
}

const CRC_TABLE = (() => {
  const table = new Int32Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    table[n] = c
  }
  return table
})()

function crc32(buffer) {
  let c = -1
  for (const byte of buffer) c = CRC_TABLE[(c ^ byte) & 0xff] ^ (c >>> 8)
  return (c ^ -1) >>> 0
}

function chunk(type, data) {
  const length = Buffer.alloc(4)
  length.writeUInt32BE(data.length)
  const body = Buffer.concat([Buffer.from(type, 'latin1'), data])
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(body))
  return Buffer.concat([length, body, crc])
}

const ihdr = Buffer.alloc(13)
ihdr.writeUInt32BE(W, 0)
ihdr.writeUInt32BE(H, 4)
ihdr[8] = 8 // bit depth
ihdr[9] = 2 // truecolour
const scanlines = Buffer.alloc((W * 3 + 1) * H)
for (let y = 0; y < H; y++) {
  scanlines[y * (W * 3 + 1)] = 0
  out.copy(scanlines, y * (W * 3 + 1) + 1, y * W * 3, (y + 1) * W * 3)
}

const png = Buffer.concat([
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  chunk('IHDR', ihdr),
  chunk('IDAT', deflateSync(scanlines, { level: 9 })),
  chunk('IEND', Buffer.alloc(0)),
])

const target = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'og.png')
writeFileSync(target, png)
console.log(`wrote ${target} (${W}x${H}, ${(png.length / 1024).toFixed(1)} kB)`)
