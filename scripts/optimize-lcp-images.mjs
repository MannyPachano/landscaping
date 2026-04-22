/**
 * Re-encodes AVIFs, builds responsive hero derivatives for img7 (template 1/3) and img11 (template 2).
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

async function heroDerivatives(baseName, { maxWidth, qSmall, qFull }) {
  const png = path.join(root, `${baseName}.png`);
  const avif = path.join(root, `${baseName}.avif`);
  let buf = null;
  if (fs.existsSync(png)) buf = await fs.promises.readFile(png);
  else if (fs.existsSync(avif)) buf = await fs.promises.readFile(avif);
  if (!buf) {
    console.warn(`skip ${baseName} derivatives: add ${baseName}.png or ${baseName}.avif`);
    return;
  }
  for (const [name, w] of [
    [`${baseName}-640.avif`, 640],
    [`${baseName}-960.avif`, 960],
  ]) {
    const out = await toAvif(buf, { width: w, quality: qSmall, effort: 6 });
    await fs.promises.writeFile(path.join(root, name), out);
    console.log(name, '→', Math.round(out.length / 1024), 'KiB');
  }
  const main = await toAvif(buf, { width: maxWidth, quality: qFull, effort: 6 });
  await fs.promises.writeFile(path.join(root, `${baseName}.avif`), main);
  console.log(`${baseName}.avif`, '→', Math.round(main.length / 1024), 'KiB');
}

await heroDerivatives('img7', { maxWidth: 1400, qSmall: 40, qFull: 44 });
await heroDerivatives('img11', { maxWidth: 1920, qSmall: 36, qFull: 40 });

const compressOnly = [
  'img2.avif',
  'img3.avif',
  'img5.avif',
  'img6.avif',
  'img8.avif',
  'img9.avif',
  'img10.avif',
  'img12.avif',
  'img13.avif',
  'img14.avif',
  'img17.avif',
  'img18.avif',
  'img19.avif',
  'img20.avif',
];
for (const name of compressOnly) {
  const p = path.join(root, name);
  if (!fs.existsSync(p)) {
    console.warn('skip (missing):', name);
    continue;
  }
  const input = await fs.promises.readFile(p);
  const out = await toAvif(input, { quality: 40, effort: 5 });
  await fs.promises.writeFile(p, out);
  console.log(name, '→', Math.round(out.length / 1024), 'KiB');
}
