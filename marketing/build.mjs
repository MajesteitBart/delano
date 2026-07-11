import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const fontUri = f => `data:font/woff2;base64,${readFileSync(join(root, 'fonts', f)).toString('base64')}`;

let html = readFileSync(join(root, 'index.html'), 'utf8');
html = html
  .replace('url(fonts/inter-var.woff2) format(\'woff2-variations\')', `url(${fontUri('inter-var.woff2')}) format('woff2-variations')`)
  .replace('url(fonts/jbmono-var.woff2) format(\'woff2-variations\')', `url(${fontUri('jbmono-var.woff2')}) format('woff2-variations')`);

html = html.replace(/<img src="svg\/([a-z-]+\.svg)"([^>]*)>/g, (m, file, rest) => {
  let svg = readFileSync(join(root, 'svg', file), 'utf8').trim();
  const alt = (rest.match(/alt="([^"]*)"/) || [])[1] || '';
  svg = svg.replace('<svg ', `<svg style="width:100%;height:auto;display:block" aria-label="${alt}" `);
  return svg;
});

html = html.replace(/src="real\/([a-z-]+\.png)"/g, (m, file) => {
  const uri = `data:image/png;base64,${readFileSync(join(root, 'real', file)).toString('base64')}`;
  return `src="${uri}"`;
});

writeFileSync(join(root, 'delano-pub.html'), html);
const emdash = (html.match(/—/g) || []).length;
console.log(`delano-pub.html written, ${(html.length / 1024).toFixed(0)} KiB, em dashes: ${emdash}, remote refs: ${(html.match(/https?:\/\/(?!github\.com|www\.npmjs\.com)[^"']+/g) || []).join(', ') || 'none in assets'}`);
