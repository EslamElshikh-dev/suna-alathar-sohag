import { readFile, access } from 'node:fs/promises';
const root = new URL('../public/', import.meta.url);
const html = await readFile(new URL('index.html', root), 'utf8');
const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
const errors = [];
if (new Set(ids).size !== ids.length) errors.push('Duplicate HTML IDs.');
if ((html.match(/<h1\b/g) || []).length !== 1) errors.push('Home page must have exactly one H1.');
if (!html.includes('<html lang="ar" dir="rtl">')) errors.push('Arabic direction and language missing.');
for (const [,target] of html.matchAll(/href="#([^"]+)"/g)) if (!ids.includes(target)) errors.push(`Missing anchor: ${target}`);
const assets = new Set([...html.matchAll(/(?:src|href)="(\/(?:assets\/[^"?]+|app\.js|styles\.css))"/g)].map(match => match[1]));
for (const asset of assets) { try { await access(new URL('.' + asset, root)); } catch { errors.push(`Missing asset: ${asset}`); } }
const css = await readFile(new URL('styles.css', root), 'utf8');
const options = [...html.matchAll(/<option>([^<]+)<\/option>/g)].map(match => match[1]);
const districts = [...html.matchAll(/data-district="([^"]+)"/g)].map(match => match[1]);
for (const district of districts) if (!options.includes(district)) errors.push(`Missing district option: ${district}`);
if (options.length !== 13 || new Set(options).size !== 13) errors.push('Expected 12 district choices plus the outside-Sohag choice.');
await access(new URL('assets/social-card-v2.jpg', root));
for (const [,asset] of html.matchAll(/property="og:image" content="__SITE_URL__(\/assets\/[^\"]+)"/g)) {
  try { await access(new URL('.' + asset, root)); } catch { errors.push(`Missing social sharing image: ${asset}`); }
}
for (const [,asset] of css.matchAll(/url\(['"]?(\/assets\/[^)'"?]+)/g)) { try { await access(new URL('.' + asset, root)); } catch { errors.push(`Missing CSS asset: ${asset}`); } }
for (const tag of ['title', 'meta name="description"', 'link rel="canonical"', 'meta property="og:image"']) if (!html.includes('<' + tag)) errors.push(`Missing metadata: ${tag}`);
const jsonld = html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s);
if (jsonld) JSON.parse(jsonld[1]); else errors.push('Missing structured data.');
if (/lorem ipsum|TODO|your@email|example\.com/i.test(html)) errors.push('Unfinished placeholder content.');
if (errors.length) { console.error(errors.join('\n')); process.exitCode = 1; }
else console.log(`Content and asset checks passed: ${ids.length} unique IDs, ${assets.size} local assets, all section anchors resolve, Arabic metadata and JSON-LD valid.`);
