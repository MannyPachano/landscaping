/**
 * Re-encodes key AVIFs and writes responsive hero derivatives (img7-640, img7-960) for LCP.
 * Run: npm run optimize:images
 * Requires: sharp (devDependency)
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'public', 'images');

async function toAvif(buffer, { width, quality = 48, effort = 5 } = {}) {
  let img = sharp(buffer);
  if (width) {
    img = img.resize(width, null, { fit: 'inside', withoutEnlargement: true });
  }
  return img.avif({ quality, effort }).toBuffer();
}

const heroPng = path.join(root, 'img7.png');
const heroAvif = path.join(root, 'img7.avif');
let heroBuf = null;
if (fs.existsSync(heroPng)) {
  heroBuf = await fs.promises.readFile(heroPng);
} else if (fs.existsSync(heroAvif)) {
  heroBuf = await fs.promises.readFile(heroAvif);
}

if (heroBuf) {
  const qSmall = 40;
  const qFull = 44;
  for (const [name, w] of [
    ['img7-640.avif', 640],
    ['img7-960.avif', 960],
  ]) {
    const out = await toAvif(heroBuf, { width: w, quality: qSmall, effort: 6 });
    await fs.promises.writeFile(path.join(root, name), out);
    console.log(name, '→', Math.round(out.length / 1024), 'KiB');
  }
  const main = await toAvif(heroBuf, { width: 1400, quality: qFull, effort: 6 });
  await fs.promises.writeFile(path.join(root, 'img7.avif'), main);
  console.log('img7.avif', '→', Math.round(main.length / 1024), 'KiB');
} else {
  console.warn('skip hero derivatives: add public/images/img7.png or img7.avif');
}

const files = ['img3.avif', 'img6.avif', 'img8.avif'];
for (const name of files) {
  const p = path.join(root, name);
  if (!fs.existsSync(p)) {
    console.warn('skip (missing):', name);
    continue;
  }
  const input = await fs.promises.readFile(p);
  const out = await toAvif(input, { quality: 48, effort: 5 });
  await fs.promises.writeFile(p, out);
  console.log(name, '→', Math.round(out.length / 1024), 'KiB');
}
