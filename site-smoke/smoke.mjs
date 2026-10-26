/*
  Site smoke — runs after every Deploy site.
  Catches the two regression classes the 2026-10-26 fine-tooth comb found:
    1. horizontal overflow (the .rules flex-row bug class) at 1440 and 390
    2. broken links (the ../../ path-depth bug class), same-origin one level deep
  Exit 1 with a report on any failure.
*/
import { chromium } from 'playwright';

const BASE = (process.env.BASE_URL || 'https://dotcurt.org').replace(/\/$/, '');
const PAGES = ['/', '/adopt/', '/try/', '/paper/', '/listen/', '/posts/2026-10-25-one-file/'];
const failures = [];

const browser = await chromium.launch();
const page = await browser.newPage();

// 1. every known page responds
for (const path of PAGES) {
  const res = await page.request.get(BASE + path);
  if (res.status() !== 200) failures.push(`GET ${path} -> ${res.status()} (expected 200)`);
}

// 2. overflow at both widths + collect same-origin links
const links = new Set();
for (const width of [1440, 390]) {
  await page.setViewportSize({ width, height: width === 1440 ? 900 : 844 });
  for (const path of PAGES) {
    await page.goto(BASE + path, { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready);
    const overflow = await page.evaluate(() =>
      document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
    if (overflow) failures.push(`overflow at ${width}px on ${path}`);
    const hrefs = await page.evaluate((base) =>
      [...document.querySelectorAll('a[href]')]
        .map(a => a.href)
        .filter(h => h.startsWith(base)), BASE);
    for (const h of hrefs) links.add(h.split('#')[0].replace(/\/$/, '') || BASE);
  }
}

// 3. same-origin links resolve (one level deep, deduped)
for (const url of links) {
  const res = await page.request.get(url);
  if (res.status() >= 400) failures.push(`link ${url} -> ${res.status()}`);
}

await browser.close();

console.log(`pages: ${PAGES.length} · widths: 1440+390 · same-origin links checked: ${links.size}`);
if (failures.length) {
  console.error(`SMOKE FAIL — ${failures.length} issue(s):`);
  for (const f of failures) console.error('  ' + f);
  process.exit(1);
}
console.log('SMOKE OK');
