import { mkdir, copyFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { illustrations } from '../src/illustrations.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
await mkdir(join(root, 'dist/assets'), { recursive: true });
for (const file of ['index.html', 'analytics.html', 'claim.html', 'style.css', 'app.js', 'steps.mjs', 'shell.js', 'pages.js', 'market.mjs']) {
  await copyFile(join(root, 'src', file), join(root, 'dist', file));
}
for (const [name, svg] of Object.entries(illustrations)) {
  await writeFile(join(root, 'dist/assets', name + '.svg'), svg);
}
console.log('Built 3 pages and 4 guide illustrations in dist/.');
