# dotcurt.org — launch post + adopt page (design)

Date: 2026-10-25 · Status: approved by Jordan (voice sample included in approval)

## Goal

Extend dotcurt.org (static site in `site/`, Cloudflare Workers static-assets,
zero build) with two new pages:

1. **Launch post** — `/posts/2026-10-25-one-file/` announcing the format v1
   launch (spec frozen, curt-format@1.2.0 MIT, 27 conformance vectors).
2. **Product page** — `/adopt/` — adopt-the-standard page for app builders.
   Attacks the zero-consumers gap (audit finding #1, E-001).

Non-goal: no npm release, no spec changes, no build tooling, no registry
changes. Site content only.

## Architecture

- `site/style.css` — shared stylesheet, extracted once from the inline
  `<style>` block in `site/index.html`. All three pages link it. Zero-build
  preserved; wrangler config untouched.
- `site/adopt/index.html` — product page.
- `site/posts/2026-10-25-one-file/index.html` — launch post.
- `site/index.html` — nav gains two links (adopt, post); markup unchanged
  otherwise. Page-specific styles stay inline in each new page's `<head>`.
- Relative links between pages (`../adopt/`, `../../`) so Pages/Workers
  routing works without absolute paths.

## Adopt page structure (`/adopt/`)

Kicker: *the format is free — the move is yours.*

1. **Why implement** — full fidelity (base64 images + tool calls verbatim),
   unknown-field passthrough on re-save, one diffable UTF-8 file per
   conversation, MIT for spec/impl/schema/fixtures.
2. **The path** — 4 steps: `npm i curt-format` → serialize/parse → pass the
   conformance vectors (L1 CORE → L4, 27 vectors in CI) → get listed in
   `capabilities.json` via PR (link to file + CAPABILITIES.md).
3. **Registry status** — consumers summary from capabilities.json (curtis,
   tractum, etc. — render as a simple table: id · role · read/write ·
   conformance). Extensions table from EXTENSIONS.md with draft/stable
   status; consensus-receipt shown as DRAFT.
4. **License line** — spec/impl/schema/fixtures MIT; Curtis applications
   remain BUSL.
5. **FAQ strip** — frozen core (registry-only evolution), BDFL/single
   maintainer, what draft→stable means (two independent implementations).

Voice: same register as the post (below) — plain, direct, first-person-plural
allowed but no corporate gloss.

## Launch post structure (`/posts/2026-10-25-one-file/`)

Title: **One file, one conversation, kept whole.** (matches site hero line;
the post is the story behind it)

Approved voice sample (binding tone reference):

> Every chat you've had with an AI lives in someone else's database, in a
> format you'll never see, behind an export button that flattens it. That
> never sat right with me. So I built the thing I wanted to exist: **.curt**
> — one UTF-8 file, one conversation, everything intact. Images, tool calls,
> the weird stuff — verbatim.
>
> Spec v1 is frozen. `curt-format@1.2.0` is on npm, MIT. Twenty-seven
> conformance vectors run in CI so "compatible" means something.
>
> Full disclosure: I built this in a vacuum. No consumers yet — that's not a
> humblebrag, it's the current score. If you build software where
> conversations matter, the format is free and the door's open.

Register rules derived from the sample: first person, speech rhythm, no
press-release verbs ("excited to announce", "proud to"), no slang cosplay,
honest about the empty ecosystem, concrete numbers over adjectives.

Body sections: what a .curt file is (short, envelope sketch) · what shipped
(spec v1 frozen core, registry, L1–L4 conformance) · the rules (frozen core /
extension registry / two-impl promotion) · adopt CTA linking `/adopt/` ·
close.

## Deploy + QA

- Push → Gitea/GitHub → CI deploy (existing wrangler-action@v4 pattern).
- Verify live on https://dotcurt.org (both new URLs 200).
- Screenshot QC: desktop + mobile (house headless-Chrome probe; AEON
  min-width ~469px gotcha) for both new pages + index nav.
- Link-check: nav anchors on index, cross-page links, external
  (npm/GitHub) links.

## Facts to render (source of truth, do not invent)

- Spec v1, frozen core. `curt-format@1.2.0` on npm, MIT (apps BUSL).
- 27 conformance vectors, L1 CORE / L2 NAMED / L3 BULK / L4 per-extension.
- Extensions (EXTENSIONS.md): images-inline, usage-metadata, tool-linkage,
  agent-context; consensus-receipt = DRAFT (needs 2nd independent impl).
- consumers list from capabilities.json (curated at build time; re-read the
  file when rendering — lastAudited 2026-10-17).
- BDFL / single maintainer.
