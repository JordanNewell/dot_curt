#!/usr/bin/env node
/*
  check-doc-facts.mjs — the dot_curt fact-drift guard.

  Root-cause fix for the "docs are ambiguous" complaint: the SAME facts
  (published npm versions, implementation count, extension names+statuses,
  magic string, format version) are stated across README.md, CAPABILITIES.md,
  EXTENSIONS.md, the website landing page, and website/docs/**. This script
  fetches reality from the npm registry and fails — with a diff-style report —
  on every place a doc states a fact that contradicts reality or the other
  docs. Facts a doc may omit freely: omitting a version is fine, stating a
  wrong one is not.

  Checks:
    a. npm versions  — every `curt-format@x.y.z`-style pin in any doc must
                       equal https://registry.npmjs.org/<pkg>/latest, or the
                       doc must omit the version. Also cross-checks the root
                       package.json version against the published latest.
    b. impl count    — the CAPABILITIES.md "In (N)" list: N must equal the
                       actual number of `·`-separated entries, and every
                       count claim anywhere ("In (N)", "N implementations")
                       must equal that same N.
    c. extensions    — the EXTENSIONS.md registry table is the authority;
                       any doc/landing claim of `name (status)` or
                       `name — status` must match it exactly; unknown
                       extension names are flagged.
    d. magic+version — the literal magic string must be spelled
                       `curtis-conversation` everywhere (no variants); the
                       format version must be 1 everywhere it is claimed
                       (forward-looking "future version 2" / "v2 someday"
                       contexts are whitelisted); src/index.ts constants must
                       still be CURT_MAGIC='curtis-conversation',
                       CURT_VERSION=1.

  Exit 0 all-consistent; exit 1 with the mismatch report.

  Usage:
    node scripts/check-doc-facts.mjs [repoRoot]     # default: repo root
    DOCFACTS_ROOT=/path node scripts/check-doc-facts.mjs

  Env:
    FACTS_STRICT=1  make "npm unreachable and no cache" fatal instead of a
                    warning (for CI hard mode)
  No dependencies: Node >= 18 (global fetch). A successful registry fetch is
  cached to scripts/.doc-facts-cache.json; when the network is down the cache
  is used and the check notes it.
*/
import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(
  process.argv[2] || process.env.DOCFACTS_ROOT || path.join(scriptDir, '..'),
);
const CACHE_FILE = path.join(scriptDir, '.doc-facts-cache.json');
const PACKAGES = ['curt-format', 'curt-vcon', 'curt-convert', 'curt-wildchat'];
const STRICT = process.env.FACTS_STRICT === '1';

/** @type {(check: string, msg: string) => void} */
const failures = [];
const warnings = [];
const fail = (check, msg) => failures.push(`[${check}] ${msg}`);
const warn = (check, msg) => warnings.push(`[${check}] ${msg}`);

// ---------------------------------------------------------------- surfaces

function walkMd(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const p = path.join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) out.push(...walkMd(p));
    else if (/\.(md|mdx)$/.test(name)) out.push(p);
  }
  return out.sort();
}

function collectSurfaces() {
  const surfaces = [];
  for (const f of ['README.md', 'CAPABILITIES.md', 'EXTENSIONS.md', 'SPEC.md', 'CHANGELOG.md']) {
    const p = path.join(ROOT, f);
    if (!existsSync(p)) {
      fail('files', `required doc missing: ${f}`);
      continue;
    }
    surfaces.push({ label: f, text: readFileSync(p, 'utf8') });
  }

  const websiteDir = path.join(ROOT, 'website');
  if (!existsSync(websiteDir)) {
    // Pre-integration runs: the guard is still useful on the root docs alone.
    warn('files', 'website/ not present yet — landing + website/docs surfaces skipped');
    return { surfaces };
  }

  const landingExts = ['tsx', 'ts', 'jsx', 'js', 'mdx', 'md'];
  let landing = null;
  for (const ext of landingExts) {
    const p = path.join(websiteDir, 'src', 'pages', `index.${ext}`);
    if (existsSync(p)) {
      landing = p;
      break;
    }
  }
  if (!landing) {
    fail(
      'files',
      'landing page missing: expected one of website/src/pages/index.{tsx,ts,jsx,js,mdx,md}',
    );
  } else {
    surfaces.push({
      label: 'website/src/pages/index.* (landing)',
      text: readFileSync(landing, 'utf8'),
    });
  }

  const docsDir = path.join(websiteDir, 'docs');
  if (!existsSync(docsDir)) {
    fail('files', 'website/docs/ missing');
  } else {
    const md = walkMd(docsDir);
    if (md.length === 0) fail('files', 'website/docs/ contains no markdown');
    for (const f of md) {
      surfaces.push({
        label: path.relative(ROOT, f).split(path.sep).join('/'),
        text: readFileSync(f, 'utf8'),
      });
    }
  }
  return { surfaces };
}

/** Run `regex` line-by-line, callback gets (match, lineNo, line). */
function scanLines(surface, regex, cb) {
  surface.text.split(/\r?\n/).forEach((line, i) => {
    regex.lastIndex = 0;
    let m;
    while ((m = regex.exec(line)) !== null) cb(m, i + 1, line);
  });
}

// -------------------------------------------------------- npm reality (a)

async function fetchNpmLatest(pkg) {
  const res = await fetch(`https://registry.npmjs.org/${pkg}/latest`, {
    headers: { accept: 'application/json', 'user-agent': 'dotcurt-doc-facts' },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`registry returned HTTP ${res.status}`);
  const body = await res.json();
  if (typeof body.version !== 'string') throw new Error('registry response has no version field');
  return body.version;
}

function readCache() {
  try {
    return JSON.parse(readFileSync(CACHE_FILE, 'utf8'));
  } catch {
    return {};
  }
}

async function npmReality() {
  const reality = {};
  const cache = readCache();
  let cacheTouched = false;
  for (const pkg of PACKAGES) {
    try {
      reality[pkg] = await fetchNpmLatest(pkg);
      cache[pkg] = { version: reality[pkg], fetchedAt: new Date().toISOString() };
      cacheTouched = true;
    } catch (err) {
      const hit = cache[pkg];
      if (hit?.version) {
        reality[pkg] = hit.version;
        warn('npm', `registry unreachable for ${pkg} (${err.message}) — using cached ${hit.version}`);
      } else {
        const msg = `npm registry unreachable and no cache for ${pkg} (${err.message}) — version check skipped for it`;
        if (STRICT) fail('npm', msg);
        else warn('npm', msg);
      }
    }
  }
  if (cacheTouched) {
    try {
      writeFileSync(CACHE_FILE, JSON.stringify(cache, null, '\t') + '\n');
    } catch {
      /* cache write is best-effort */
    }
  }
  return reality;
}

// --------------------------------------------------------------- checks

function checkNpmVersions(surfaces, reality) {
  const re = /\b(curt-(?:format|vcon|convert|wildchat))@(\d+\.\d+\.\d+)\b/g;
  for (const surface of surfaces) {
    scanLines(surface, re, (m, lineNo) => {
      const [, pkg, version] = m;
      const latest = reality[pkg];
      if (!latest) return; // unreachable + no cache: already warned
      if (version !== latest) {
        fail(
          'npm-version',
          `${surface.label}:${lineNo}: pins ${pkg}@${version} — npm latest is ${latest}`,
        );
      }
    });
  }
  // The reference package must not drift from its own published release.
  const pkgJsonPath = path.join(ROOT, 'package.json');
  if (reality['curt-format'] && existsSync(pkgJsonPath)) {
    try {
      const v = JSON.parse(readFileSync(pkgJsonPath, 'utf8')).version;
      if (v !== reality['curt-format']) {
        fail(
          'npm-version',
          `package.json: curt-format ${v} — npm latest is ${reality['curt-format']} (publish or repin)`,
        );
      }
    } catch (err) {
      warn('npm-version', `package.json unreadable: ${err.message}`);
    }
  }
}

function checkImplCount(surfaces) {
  const cap = surfaces.find((s) => s.label === 'CAPABILITIES.md');
  if (!cap) return;
  const m = /\*\*In \((\d+)\):\*\*([\s\S]*?)\n\s*\*\*Out/.exec(cap.text);
  if (!m) {
    fail('impl-count', 'CAPABILITIES.md: no "**In (N):** ..." list found');
    return;
  }
  const declared = Number(m[1]);
  const entries = m[2]
    .split('·')
    .map((t) => t.trim())
    .filter(Boolean).length;
  if (declared !== entries) {
    fail(
      'impl-count',
      `CAPABILITIES.md: "In (${declared})" but the list has ${entries} entries — fix the number or the list`,
    );
  }
  const authority = entries; // the actual In-list length is the only truth

  const claims = [
    /\bIn\s*\((\d+)\)/g,
    /\b(\d+)\s+implementations?\b/gi,
    /\bimplementations?\s*\((\d+)\)/gi,
  ];
  for (const surface of surfaces) {
    for (const re of claims) {
      scanLines(surface, re, (mm, lineNo) => {
        const n = Number(mm[1]);
        if (n !== authority) {
          fail(
            'impl-count',
            `${surface.label}:${lineNo}: claims ${mm[0].trim()} — CAPABILITIES In-list has ${authority}`,
          );
        }
      });
    }
  }
  return authority;
}

function checkExtensions(surfaces) {
  const ext = surfaces.find((s) => s.label === 'EXTENSIONS.md');
  if (!ext) return;
  const registry = new Map(); // name -> status
  scanLines(ext, /^\s*\|\s*`([a-z0-9-]+)`\s*\|\s*(stable|draft|deprecated)\b/gi, (m) => {
    registry.set(m[1], m[2].toLowerCase());
  });
  if (registry.size === 0) {
    fail('extensions', 'EXTENSIONS.md: registry table not found (no `name | status` rows)');
    return;
  }
  // Registry detail sections in EXTENSIONS.md itself must agree with the table.
  scanLines(ext, /^#{2,4}\s+`([a-z0-9-]+)`\s*[—–-]\s*(stable|draft|deprecated)\b/gi, (m, lineNo) => {
    const known = registry.get(m[1]);
    if (!known) {
      fail('extensions', `EXTENSIONS.md:${lineNo}: detail section for unknown extension \`${m[1]}\``);
    } else if (known !== m[2].toLowerCase()) {
      fail(
        'extensions',
        `EXTENSIONS.md:${lineNo}: detail says \`${m[1]}\` is ${m[2].toLowerCase()} — registry table says ${known}`,
      );
    }
  });

  // Everywhere else: any (name, status) pairing must match the registry.
  const pairRes = [
    /`([a-z0-9-]+)`\s*[—–]\s*(stable|draft|deprecated)\b/gi,
    /`([a-z0-9-]+)`\s*\(\s*(stable|draft|deprecated)\s*\)/gi,
  ];
  for (const surface of surfaces) {
    if (surface.label === 'EXTENSIONS.md') continue;
    for (const re of pairRes) {
      scanLines(surface, re, (m, lineNo) => {
        const [name, status] = [m[1], m[2].toLowerCase()];
        const known = registry.get(name);
        if (!known) {
          fail('extensions', `${surface.label}:${lineNo}: mentions unknown extension \`${name}\` (${status})`);
        } else if (known !== status) {
          fail(
            'extensions',
            `${surface.label}:${lineNo}: \`${name}\` claimed ${status} — registry says ${known}`,
          );
        }
      });
    }
  }
}

function checkMagicAndVersion(surfaces) {
  // Implementation constants are the reality anchor.
  const implPath = path.join(ROOT, 'src', 'index.ts');
  if (!existsSync(implPath)) {
    fail('magic', 'src/index.ts missing — cannot anchor CURT_MAGIC/CURT_VERSION');
  } else {
    const impl = readFileSync(implPath, 'utf8');
    const magicM = /CURT_MAGIC\s*=\s*['"]([^'"]+)['"]/.exec(impl);
    const verM = /CURT_VERSION\s*=\s*(\d+)/.exec(impl);
    if (!magicM || magicM[1] !== 'curtis-conversation') {
      fail('magic', `src/index.ts: CURT_MAGIC is ${magicM ? magicM[1] : 'missing'} — must be "curtis-conversation"`);
    }
    if (!verM || verM[1] !== '1') {
      fail('magic-version', `src/index.ts: CURT_VERSION is ${verM ? verM[1] : 'missing'} — must be 1`);
    }
  }

  // Any spelling variant of the magic string in docs is drift.
  const variantRe = /curt[i]?s[\s_-]?conversations?/gi;
  for (const surface of surfaces) {
    scanLines(surface, variantRe, (m, lineNo) => {
      // The literal is always spelled exactly `curtis-conversation` in these
      // docs (verified: no space/underscore prose variants), so any drift in
      // spelling is a bug, not prose.
      const normalized = m[0].toLowerCase();
      if (normalized !== 'curtis-conversation') {
        fail(
          'magic',
          `${surface.label}:${lineNo}: magic string variant "${m[0]}" — must be exactly "curtis-conversation"`,
        );
      }
    });
  }

  // Format version must be 1 wherever a doc claims it; forward-looking
  // mentions of a future version are whitelisted, present-tense claims are not.
  const forward = /\bfuture\b|\bsomeday\b|\bbreaking\b|\bbumps?\b|\bnew version\b|\bwould\b/i;
  const versionClaimRes = [
    /"version"\s*:\s*(\d+)/g,
    /\bversion\s*[:=]\s*["']?(\d+)/gi,
    /\bversion[-\s`]+(\d+)\b/gi,
    /\bspec is [`'](\d+)/gi,
    /\bformat version\b[^.\n]{0,24}?(\d+)/gi,
  ];
  for (const surface of surfaces) {
    for (const re of versionClaimRes) {
      scanLines(surface, re, (m, lineNo, line) => {
        const n = Number(m[1]);
        if (n !== 1 && !forward.test(line)) {
          fail(
            'magic-version',
            `${surface.label}:${lineNo}: claims format version ${n} (in "${line.trim().slice(0, 90)}") — v1 is the live version`,
          );
        }
      });
    }
  }
  // Bare "v2" claims (excluding semver tails like v2.0.1).
  const v2Re = /\bv2\b(?!\.\d)/gi;
  for (const surface of surfaces) {
    scanLines(surface, v2Re, (m, lineNo, line) => {
      if (!forward.test(line)) {
        fail(
          'magic-version',
          `${surface.label}:${lineNo}: mentions "v2" as if real (in "${line.trim().slice(0, 90)}")`,
        );
      }
    });
  }
}

// ------------------------------------------------------------------ main

const { surfaces } = collectSurfaces();
const reality = await npmReality();

checkNpmVersions(surfaces, reality);
checkImplCount(surfaces);
checkExtensions(surfaces);
checkMagicAndVersion(surfaces);

const seen = new Set();
const report = failures.filter((f) => (seen.has(f) ? false : (seen.add(f), true)));
const seenW = new Set();
const reportW = warnings.filter((f) => (seenW.has(f) ? false : (seenW.add(f), true)));

console.log(
  `check-doc-facts: ${surfaces.length} doc surface(s) · npm reality: ${
    Object.entries(reality)
      .map(([p, v]) => `${p}@${v}`)
      .join(', ') || 'unavailable'
  }`,
);
for (const w of reportW) console.log(`WARN ${w}`);
if (report.length) {
  console.error(`\nFACT DRIFT — ${report.length} mismatch(es):`);
  for (const f of report) console.error(`  FAIL ${f}`);
  console.error('\nFix the docs to match reality (or omit the fact). Re-run: node scripts/check-doc-facts.mjs');
  process.exit(1);
}
console.log('ALL CONSISTENT');
