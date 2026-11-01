# dotcurt.org docs environment — design (2026-11-01)

## Goal

Replace the hand-rolled static site with a Docusaurus docs environment at
dotcurt.org. Feel: developers.google.com (left nav, search, calm hierarchy).
Look: Meta dev-portal, **dark-first**. The project vibe is its own (NOT
NEWELL green): dark canvas `#0A0A0A`-family, gold/ochre accent carried from
the current Records Office identity (ochre `#8A6A00` for secondary, a
brighter gold `#E8C878`-family for accent TEXT — must pass WCAG AA on dark),
JetBrains Mono stays the code face, modern grotesk for display.

## Framework

Docusaurus (Meta-authored; first-class versioning for spec v2 someday).
Local search (Lunr via `@easyops-cn/docusaurus-search-local`) — no Algolia
dependency. Dark theme default, light toggle.

## Route map (CONTRACT — all agents code against these exact paths)

```
/                    → landing (custom Docusaurus home page, dark, bold)
/docs/spec           → SPEC.md (NORMATIVE badge + freeze banner)
/docs/extensions     → registry overview
/docs/extensions/<name> → per-extension page (images-inline, usage-metadata,
                          tool-linkage, agent-context, consensus-receipt)
/docs/conformance    → L1–L4 ladder + claiming + vectors
/docs/api            → curt-format API reference (hand-authored MDX:
                       parseCurt, serializeCurt, curtFilename,
                       isCurtMessage, isCurtConversation, CURT_MAGIC,
                       CURT_VERSION)
/docs/ecosystem      → capability matrix + 10 implementations
/docs/ecosystem/<tool>  → curt-vcon, curt-convert, curt-wildchat,
                          curt-openwith, curt-openwebui overview pages
                          (high-level; deep-dives stay in tool repos)
/docs/governance     → BDFL stated, extension proposal process,
                       stability criteria (two independent impls)
/docs/comparison     → .curt vs vCon vs vendor exports (adversarially
                       reviewed; cite the vCon draft)
/docs/faq            → magic string, BOM, zip bulk, why-not-vCon, license split
/docs/schema         → JSON Schema rendered + validate-your-file snippet
/docs/changelog      → CHANGELOG.md rendered
/docs/spec-terms     → RFC 2119 keywords + v1 freeze rule
/adopt /try /viewer /posts /paper /listen → carried static pages (chrome restyled)
404                  → branded
llms.txt             → generated, LLM-readable spec pointers
```

## Single source of truth

Root `SPEC.md`, `EXTENSIONS.md`, `CAPABILITIES.md`, `CHANGELOG.md` stay at
repo root (published tools link to those GitHub URLs). A build-time sync
script (`scripts/sync-spec-docs.mjs`) copies them into
`website/docs/` with frontmatter injected. Never hand-edit the copies.

## File ownership map (parallel agents — DO NOT cross these lines)

| Agent | Owns |
|---|---|
| A scaffold-theme | `website/` root: `docusaurus.config.js`, `sidebars.js`, `package.json`, `babel.config.js`, `src/` (customCSS, pages/index + landing components), `static/img/` |
| B content | `website/docs/**` (all MDX), `scripts/sync-spec-docs.mjs`, root `CAPABILITIES.md` (curt-wildchat row + publish-day updates) |
| C static-carry | `website/static/**` (carried pages: adopt, try, viewer, posts, paper, listen, 404.html, llms.txt) + restyled chrome for carried pages |
| D guardrails | `scripts/check-doc-facts.mjs`, `.github/workflows/deploy-site.yml` (update build: `cd website && npm ci && npm run build`, artifact `website/build`), `website/e2e/` smoke checks |

Shared reads: everyone reads this file + root `README.md`, `SPEC.md`,
`EXTENSIONS.md`, `CAPABILITIES.md`, `CHANGELOG.md`, current `site/` HTML.

## Landing page content

Hero: "One file, one conversation, kept whole." · install command with copy
button · vitals row (npm version badge, CI badge, 27 vectors, MIT) · section
cards linking the docs routes · NOT-YET block (stated plainly, carried from
current site) · footer identical links to today's.

## Judge-proofing (launch bar)

- Every code sample compiles — samples live in `website/e2e/samples/` and
  are run by D.
- Fact drift check (D): script greps README/docs/landing for implementation
  count, extension statuses, npm versions — fails on mismatch. Inventory
  from npm + GitHub reality (curt-wildchat@1.0.1 published; verify all).
- Dark-mode contrast WCAG AA (D verifies; A fixes).
- Link check all docs routes (D).
- Branch preview deploy FIRST (CF Pages branch previews exist) — Jordan
  eyeballs before production.

## Content debt fixed in this build

- CAPABILITIES: add curt-wildchat (published npm today, S860), re-check the
  In/Out lists against `npm view` + GitHub reality, bump lastAudited date
  IF a real audit sweep is done (else mark the row evidenceDate honestly).
- Extension emitter lists verified against published packages.

## Later (NOT this build)

Per-language binding stubs, RSS, per-page OG images, versioned docs (v2
someday), TypeDoc generation.
