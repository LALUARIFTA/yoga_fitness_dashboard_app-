import { copyFile, cp, mkdir, rm } from 'node:fs/promises';

await rm('dist', { recursive: true, force: true });
await Promise.all([
  mkdir('dist/assets/js', { recursive: true }),
  mkdir('dist/assets/fonts', { recursive: true }),
]);

const poppins = 'node_modules/@fontsource/poppins';
await Promise.all([
  copyFile('src/index.html', 'dist/index.html'),
  copyFile('src/scripts/dashboard.js', 'dist/assets/js/dashboard.js'),
  cp('src/images', 'dist/assets/images', { recursive: true }),
  copyFile(`${poppins}/LICENSE`, 'dist/assets/fonts/poppins-LICENSE.txt'),
  ...[400, 500, 600, 700].map((weight) => {
    const file = `poppins-latin-${weight}-normal.woff2`;
    return copyFile(`${poppins}/files/${file}`, `dist/assets/fonts/${file}`);
  }),
]);
