/**
 * If responsive hero AVIFs are missing, copy the master file so URLs don’t 404.
 * Run via prebuild/predev. For real widths, run `npm run optimize:images`.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'public', 'images');

const sets = [
  { base: 'img7.avif', derivatives: ['img7-640.avif', 'img7-960.avif'] },
  { base: 'img11.avif', derivatives: ['img11-640.avif', 'img11-960.avif'] },
];

for (const { base, derivatives } of sets) {
  const main = path.join(root, base);
  if (!fs.existsSync(main)) {
    console.warn('ensure-hero-avif-variants:', base, 'not found, skip');
    continue;
  }
  for (const name of derivatives) {
    const dest = path.join(root, name);
    if (!fs.existsSync(dest)) {
      fs.copyFileSync(main, dest);
      console.log('ensure-hero-avif-variants: copied', base, '→', name);
    }
  }
}
