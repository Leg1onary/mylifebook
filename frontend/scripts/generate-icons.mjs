/**
 * generate-icons.mjs
 * Generates icon-192.png and icon-512.png from public/icon.svg
 * Requires: sharp  (npm i -D sharp)
 * Usage:    node scripts/generate-icons.mjs
 */
import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const src = resolve(__dirname, '../public/icon.svg');
const out = resolve(__dirname, '../public');

const sizes = [192, 512];

for (const size of sizes) {
  await sharp(src)
    .resize(size, size)
    .png()
    .toFile(resolve(out, `icon-${size}.png`));
  console.log(`✓ icon-${size}.png`);
}

console.log('Done.');
