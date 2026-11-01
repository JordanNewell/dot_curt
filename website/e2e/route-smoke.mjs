#!/usr/bin/env node
/*
  route-smoke.mjs — contract-route smoke for the dotcurt.org build output.

  Pure Node, no browser, starts nothing: it checks the BUILT OUTPUT on disk
  (website/build/**). Every route in the docs-environment contract
  (docs/superpowers/specs/2026-11-01-dotcurt-docs-env-design.md, "Route map")
  must produce an index.html (or its file). HTML files must be non-empty and
  actually HTML.

  It then executes the judge-proofing sample: website/e2e/samples/round-trip.mts
  (real TypeScript, parse+serialize round-trip against the npm `curt-format`
  package). Graceful degradation, never a false fail:
    - curt-format not resolvable (website/node_modules not installed)
        -> SKIP-NODE_MODULES notice, sample step skipped, exit follows routes only
    - Node too old for --experimental-strip-types (< 22.6)
        -> SKIP-NODE notice, same treatment

  Exit 1 with a diff-style list on any missing/broken route.

  Usage:
    node website/e2e/route-smoke.mjs [buildDir]
    E2E_BUILD_DIR=/path node website/e2e/route-smoke.mjs
  Default buildDir: <repo>/website/build
*/
import { existsSync, readFileSync, statSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(scriptDir, '..', '..');
const BUILD = path.resolve(
  process.argv[2] || process.env.E2E_BUILD_DIR || path.join(REPO, 'website', 'build'),
);

// The contract route map. `file` is relative to the build dir.
const ROUTES = [
  { file: 'index.html', kind: 'html', route: '/' },
  { file: '404.html', kind: 'html', route: '404' },
  { file: 'llms.txt', kind: 'text', route: '/llms.txt' },

  { file: 'docs/spec/index.html', kind: 'html', route: '/docs/spec' },
  { file: 'docs/extensions/index.html', kind: 'html', route: '/docs/extensions' },
  { file: 'docs/extensions/images-inline/index.html', kind: 'html', route: '/docs/extensions/images-inline' },
  { file: 'docs/extensions/usage-metadata/index.html', kind: 'html', route: '/docs/extensions/usage-metadata' },
  { file: 'docs/extensions/tool-linkage/index.html', kind: 'html', route: '/docs/extensions/tool-linkage' },
  { file: 'docs/extensions/agent-context/index.html', kind: 'html', route: '/docs/extensions/agent-context' },
  { file: 'docs/extensions/consensus-receipt/index.html', kind: 'html', route: '/docs/extensions/consensus-receipt' },
  { file: 'docs/conformance/index.html', kind: 'html', route: '/docs/conformance' },
  { file: 'docs/api/index.html', kind: 'html', route: '/docs/api' },
  { file: 'docs/ecosystem/index.html', kind: 'html', route: '/docs/ecosystem' },
  { file: 'docs/ecosystem/curt-vcon/index.html', kind: 'html', route: '/docs/ecosystem/curt-vcon' },
  { file: 'docs/ecosystem/curt-convert/index.html', kind: 'html', route: '/docs/ecosystem/curt-convert' },
  { file: 'docs/ecosystem/curt-wildchat/index.html', kind: 'html', route: '/docs/ecosystem/curt-wildchat' },
  { file: 'docs/ecosystem/curt-openwith/index.html', kind: 'html', route: '/docs/ecosystem/curt-openwith' },
  { file: 'docs/ecosystem/curt-openwebui/index.html', kind: 'html', route: '/docs/ecosystem/curt-openwebui' },
  { file: 'docs/governance/index.html', kind: 'html', route: '/docs/governance' },
  { file: 'docs/comparison/index.html', kind: 'html', route: '/docs/comparison' },
  { file: 'docs/faq/index.html', kind: 'html', route: '/docs/faq' },
  { file: 'docs/schema/index.html', kind: 'html', route: '/docs/schema' },
  { file: 'docs/changelog/index.html', kind: 'html', route: '/docs/changelog' },
  { file: 'docs/spec-terms/index.html', kind: 'html', route: '/docs/spec-terms' },

  { file: 'adopt/index.html', kind: 'html', route: '/adopt' },
  { file: 'try/index.html', kind: 'html', route: '/try' },
  { file: 'viewer/index.html', kind: 'html', route: '/viewer' },
  { file: 'posts/2026-10-25-one-file/index.html', kind: 'html', route: '/posts/2026-10-25-one-file' },
  { file: 'paper/index.html', kind: 'html', route: '/paper' },
  { file: 'listen/index.html', kind: 'html', route: '/listen' },
];

const failures = [];

// ------------------------------------------------------------ route checks

if (!existsSync(BUILD)) {
  console.error(
    `BUILD NOT FOUND: ${BUILD}\nRun the build first: cd website && npm ci && npm run sync-docs && npm run build\n(override the location: node website/e2e/route-smoke.mjs <buildDir> or E2E_BUILD_DIR=...)`,
  );
  process.exit(1);
}

for (const { file, kind, route } of ROUTES) {
  const p = path.join(BUILD, file);
  if (!existsSync(p)) {
    failures.push(`route ${route} — missing build output (${file})`);
    continue;
  }
  const st = statSync(p);
  if (!st.isFile() || st.size === 0) {
    failures.push(`route ${route} — empty build output (${file})`);
    continue;
  }
  const head = readFileSync(p, 'utf8').slice(0, 512).toLowerCase();
  if (kind === 'html' && !head.includes('<!doctype html') && !head.includes('<html')) {
    failures.push(`route ${route} — ${file} exists but is not HTML`);
  }
}

// ------------------------------------------------- judge-proofing sample

const sample = path.join(scriptDir, 'samples', 'round-trip.mts');
if (!existsSync(sample)) {
  failures.push(`sample missing: website/e2e/samples/round-trip.mts`);
} else {
  let curtFormatEntry = null;
  try {
    // Resolve from the samples dir so we find website/node_modules/curt-format.
    const requireFromSamples = createRequire(path.join(scriptDir, 'samples', 'round-trip.mts'));
    curtFormatEntry = requireFromSamples.resolve('curt-format');
  } catch {
    /* not installed yet */
  }

  if (!curtFormatEntry) {
    console.log(
      'SKIP-NODE_MODULES: curt-format is not resolvable from website/e2e/samples ' +
        '(website/node_modules not installed) — sample execution skipped, not a failure. ' +
        'Run: cd website && npm install curt-format',
    );
  } else {
    const [major, minor] = process.versions.node.split('.').map(Number);
    const stripTypesSupported = major > 22 || (major === 22 && minor >= 6);
    if (!stripTypesSupported) {
      console.log(
        `SKIP-NODE: Node ${process.versions.node} cannot run TypeScript samples ` +
          '(needs >= 22.6 for --experimental-strip-types) — sample execution skipped, not a failure.',
      );
    } else {
      const res = spawnSync(
        process.execPath,
        ['--experimental-strip-types', '--no-warnings', sample],
        { encoding: 'utf8', timeout: 60000 },
      );
      if (res.status !== 0) {
        const detail = (res.stderr || res.stdout || '').trim().split('\n').slice(-8).join('\n');
        failures.push(`sample round-trip.mts failed (exit ${res.status}):\n    ${detail.replaceAll('\n', '\n    ')}`);
      } else {
        console.log((res.stdout || '').trim());
      }
    }
  }
}

// ------------------------------------------------------------------ report

console.log(
  `route-smoke: ${ROUTES.length} contract route(s) checked against ${path.relative(REPO, BUILD).split(path.sep).join('/') || BUILD}`,
);
if (failures.length) {
  console.error(`\nROUTE SMOKE FAIL — ${failures.length} issue(s):`);
  for (const f of failures) console.error('  ' + f);
  process.exit(1);
}
console.log('ROUTES OK');
