/**
 * Re-encodes key AVIFs at a higher compression level for Lighthouse "Improve image delivery".
 * Run: node scripts/optimize-lcp-images.mjs
 * Requires: npm install sharp --save-dev
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'public', 'images');
const files = ['img3.avif', 'img6.avif', 'img7.avif', 'img8.avif'];

for (const name of files) {
  const p = path.join(root, name);
  if (!fs.existsSync(p)) {
    console.warn('skip (missing):', name);
    continue;
  }
  const input = await fs.promises.readFile(p);
  const out = await sharp(input).avif({ quality: 52, effort: 4 }).toBuffer();
  await fs.promises.writeFile(p, out);
  console.log(name, '→', Math.round(out.length / 1024), 'KiB');
}
