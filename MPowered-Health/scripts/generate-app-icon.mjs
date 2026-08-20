import { deflateSync } from 'node:zlib';
import { writeFileSync } from 'node:fs';

const crcTable = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k += 1) c = (c & 1) ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});

function crc32(buffer) {
  let c = 0xffffffff;
  for (const byte of buffer) c = crcTable[(c ^ byte) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(name, data) {
  const type = Buffer.from(name);
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([type, data])));
  return Buffer.concat([length, type, data, crc]);
}

function insidePolygon(x, y, points) {
  let inside = false;
  for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
    const [xi, yi] = points[i];
    const [xj, yj] = points[j];
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

function makePng(size, transparent = false) {
  const scale = size / 1024;
  const m = [[170, 790], [170, 234], [324, 234], [512, 560], [700, 234], [854, 234], [854, 790], [700, 790], [700, 488], [558, 730], [466, 730], [324, 488], [324, 790]];
  const rows = Buffer.alloc((size * 4 + 1) * size);
  for (let y = 0; y < size; y += 1) {
    const row = y * (size * 4 + 1);
    for (let x = 0; x < size; x += 1) {
      const pixel = row + 1 + x * 4;
      const isM = insidePolygon(x / scale, y / scale, m);
      if (isM) {
        rows[pixel] = 94;
        rows[pixel + 1] = 23;
        rows[pixel + 2] = 235;
        rows[pixel + 3] = 255;
      } else {
        rows[pixel] = 255;
        rows[pixel + 1] = 255;
        rows[pixel + 2] = 255;
        rows[pixel + 3] = transparent ? 0 : 255;
      }
    }
  }
  const header = Buffer.alloc(13);
  header.writeUInt32BE(size, 0);
  header.writeUInt32BE(size, 4);
  header[8] = 8;
  header[9] = 6;
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', header),
    chunk('IDAT', deflateSync(rows, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

writeFileSync('assets/images/icon.png', makePng(1024));
writeFileSync('assets/images/android-icon-background.png', makePng(512));
writeFileSync('assets/images/android-icon-foreground.png', makePng(512, true));
writeFileSync('assets/images/android-icon-monochrome.png', makePng(512, true));
