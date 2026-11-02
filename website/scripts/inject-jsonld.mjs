// Injects JSON-LD into the built docs HTML after `docusaurus build`:
//   - FAQPage on /docs/faq/ (Q&As parsed from docs/faq.md, so the two stay in sync)
//   - TechArticle on /docs/spec/ and /docs/conformance/
// Docusaurus already emits BreadcrumbList, canonical, and OG tags; this
// script adds only what it does not. Idempotent: skips pages already tagged.
//
// Run: node scripts/inject-jsonld.mjs   (wired into the `build` script)

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const WEBROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DOCS = join(WEBROOT, 'docs');
const BUILD = join(WEBROOT, 'build');

const BASE = 'https://docs.dotcurt.org';
const AUTHOR = { '@type': 'Person', name: 'Jordan Newell', url: 'https://dotcurt.org/' };

function plainText(md) {
	return md
		.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1')
		.replace(/`([^`]*)`/g, '$1')
		.replace(/\*\*([^*]+)\*\*/g, '$1')
		.replace(/\*([^*]+)\*/g, '$1')
		.replace(/\s+/g, ' ')
		.trim();
}

function faqItems() {
	const md = readFileSync(join(DOCS, 'faq.md'), 'utf8');
	const body = md.replace(/^---[\s\S]*?---/, '');
	const sections = body.split(/^## /m).slice(1);
	return sections.map((sec) => {
		const [q, ...rest] = sec.split('\n');
		const answer = plainText(rest.join('\n')).trim();
		return {
			'@type': 'Question',
			name: plainText(q),
			acceptedAnswer: { '@type': 'Answer', text: answer },
		};
	});
}

function inject(relUrl, jsonld) {
	const file = join(BUILD, relUrl, 'index.html');
	if (!existsSync(file)) {
		console.error(`inject-jsonld: missing ${file} — run docusaurus build first`);
		process.exitCode = 1;
		return;
	}
	let html = readFileSync(file, 'utf8');
	if (html.includes('application/ld+json" data-injected')) {
		console.log(`inject-jsonld: ${relUrl} already tagged`);
		return;
	}
	const tag =
		'<script type="application/ld+json" data-injected="inject-jsonld">' +
		JSON.stringify(jsonld).replace(/</g, '\\u003c') +
		'</script>';
	if (!html.includes('</head>')) {
		console.error(`inject-jsonld: no </head> in ${relUrl}`);
		process.exitCode = 1;
		return;
	}
	html = html.replace('</head>', tag + '</head>');
	writeFileSync(file, html);
	console.log(`inject-jsonld: ${jsonld['@type']} -> ${relUrl}`);
}

// FAQPage — parsed live from docs/faq.md
const items = faqItems();
if (items.length === 0) {
	console.error('inject-jsonld: no Q&As parsed from docs/faq.md');
	process.exitCode = 1;
} else {
	inject('docs/faq', {
		'@context': 'https://schema.org',
		'@type': 'FAQPage',
		mainEntity: items,
	});
}

// TechArticle — spec and conformance
for (const [slug, name] of [
	['spec', 'The .curt format — SPEC'],
	['conformance', 'Conformance — the L1–L4 ladder'],
]) {
	const file = join(DOCS, `${slug}.md`);
	const md = readFileSync(file, 'utf8');
	const desc = (md.match(/^description:\s*"([^"]+)"/m) ?? [])[1] ?? '';
	inject(`docs/${slug}`, {
		'@context': 'https://schema.org',
		'@type': 'TechArticle',
		headline: name,
		description: desc,
		url: `${BASE}/docs/${slug}/`,
		inLanguage: 'en',
		image: `${BASE}/og.png`,
		author: AUTHOR,
		license: 'https://opensource.org/licenses/MIT',
		isPartOf: { '@type': 'WebSite', name: '.curt docs', url: BASE },
		about: { '@type': 'Thing', name: '.curt conversation file format' },
	});
}
