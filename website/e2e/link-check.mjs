#!/usr/bin/env node
/*
  link-check.mjs — local-link integrity for the dotcurt.org build output.

  Pure Node, no browser, NO external network calls. Crawls every .html file
  in the build output, extracts href/src attributes, and verifies each LOCAL
  target exists on disk:
    - absolute (/docs/faq) and relative (../faq, ./x.png) refs resolve
    - extension-less targets accepted via <path>/index.html or <path>.html
      (both Docusaurus output shapes)
    - http(s)://, protocol-relative (//), mailto:, tel:, data:, javascript:,
      and bare hash (#anchor) refs are skipped — the web's problem, not ours

  Exit 0 clean / exit 1 with a diff-style list of broken refs
  (which file references what, and what was tried).

  Usage:
    node website/e2e/link-check.mjs [buildDir]
    E2E_BUILD_DIR=/path node website/e2e/link-check.mjs
  Default buildDir: <repo>/website/build
*/
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(scriptDir, '..', '..');
const BUILD = path.resolve(
  process.argv[2] || process.env.E2E_BUILD_DIR || path.join(REPO, 'website', 'build'),
);

const SKIP_PREFIX = /^(https?:|\/\/|mailto:|tel:|data:|javascript:)/i;

const failures = [];
let refsChecked = 0;

function walkHtml(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const p = path.join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) out.push(...walkHtml(p));
    else if (name.endsWith('.html')) out.push(p);
  }
  return out;
}

/** Candidate disk paths that satisfy a local target (hash/query stripped). */
function candidatePaths(target, fromDir) {
  const abs = target.startsWith('/')
    ? path.join(BUILD, target)
    : path.resolve(fromDir, target);
  const cands = [abs];
  if (!/\.[a-z0-9]+$/i.test(abs)) {
    // Extension-less / directory-style: accept either Docusaurus output shape.
    cands.push(path.join(abs, 'index.html'), abs + '.html');
  }
  return cands;
}

function toRel(p) {
  return path.relative(BUILD, p).split(path.sep).join('/');
}

if (!existsSync(BUILD)) {
  console.error(
    `BUILD NOT FOUND: ${BUILD}\nRun the build first: cd website && npm ci && npm run sync-docs && npm run build`,
  );
  process.exit(1);
}

const htmlFiles = walkHtml(BUILD);
if (htmlFiles.length === 0) {
  console.error(`No .html files under ${BUILD} — nothing to check.`);
  process.exit(1);
}

for (const file of htmlFiles) {
  const html = readFileSync(file, 'utf8');
  const fromDir = path.dirname(file);
  const re = /(?:href|src)="([^"]*)"/g;
  let m;
  while ((m = re.exec(html)) !== null) {
    const raw = m[1].trim();
    if (!raw || raw.startsWith('#')) continue;
    if (SKIP_PREFIX.test(raw)) continue;
    const target = raw.split('#')[0].split('?')[0];
    if (!target) continue; // pure-hash link
    refsChecked++;
    const cands = candidatePaths(target, fromDir);
    if (!cands.some((c) => existsSync(c) && statSync(c).isFile())) {
      failures.push(`${toRel(file)} -> "${raw}" — no local target (tried: ${cands.map(toRel).join(' | ')})`);
    }
  }
}

console.log(
  `link-check: ${htmlFiles.length} html file(s) · ${refsChecked} local ref(s) · build ${
    toRel(BUILD) || BUILD
  }`,
);
if (failures.length) {
  console.error(`\nLINK CHECK FAIL — ${failures.length} broken local ref(s):`);
  for (const f of failures) console.error('  ' + f);
  process.exit(1);
}
console.log('LINKS OK');
