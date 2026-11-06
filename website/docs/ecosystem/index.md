---
id: ecosystem
title: Ecosystem
description: "Who reads and writes .curt — the capability matrix and the tool suite, each linked for depth."
---

# Ecosystem

Twelve implementations read or write `.curt` today. All are same-author
(JordanNewell); third-party implementations are invited — the
[conformance vectors](/docs/conformance) exist so a claim from anyone can
be checked in minutes. Per-consumer detail (dependency style, spec
revision, conformance drift) lives in
[CAPABILITIES.md](https://github.com/JordanNewell/dot_curt/blob/main/CAPABILITIES.md)
and its machine-readable twin
[`capabilities.json`](https://github.com/JordanNewell/dot_curt/blob/main/capabilities.json) — rendered for humans, at build time, on the
[Ecosystem status](/docs/status) page.

## In (12)

| Implementation | Role | Read/Write |
|---|---|---|
| [curtis](https://github.com/JordanNewell/curtis) (Obsidian plugin) | import / export / backup | R + W |
| [curt-openwith](https://github.com/JordanNewell/curt-openwith) | double-click any `.curt` file — offline viewer | R |
| [curtis-ai-porter](https://github.com/JordanNewell/curtis-ai-porter) | converter + verify oracle | R + W |
| curtis-web (private) | export endpoint | W |
| curtis-cloud (`@curtisai/shared`) | shared library | R + W |
| curtis-ai-tech | embedded converter + docs | R + W |
| [tractum](https://github.com/JordanNewell/tractum) | Python SDK — signed consensus receipts | R + W |
| [curt-vcon](https://github.com/JordanNewell/curt-vcon) | .curt ⇄ vCon (IETF) bridge | R + W |
| [curt-convert](https://github.com/JordanNewell/curt-convert) | Claude Code transcripts → .curt | W |
| [curt-busabase](https://github.com/JordanNewell/curt-busabase) | Busabase review trails → .curt | W |
| [curt-wildchat](https://github.com/JordanNewell/curt-wildchat) | WildChat-1M records → .curt | W |
| curt-openwebui (local, unpublished) | Open WebUI exporter | W |

## Out (8, no `.curt` code)

curtis-compliance, curtis-console, curtis-os, curtis-ai-chat-zed,
curtis-ai-symphony, curtis-ai-crm, curtis-ai-browser, curtis-ai-theme.
Out-of-ecosystem repos need one grep to confirm still-out.

## Capability matrix

Condensed from CAPABILITIES.md (full sweep 2026-10-14, addendum
2026-11-01):

| Consumer | Dependency | BOM tolerance | Strict reject | Unknown fields RT | `curtFilename` | Conformance |
|---|---|---|---|---|---|---|
| **dot_curt** (`curt-format@1.2.0`) | — (reference) | yes | yes | yes | yes | ref = L1–L4 |
| curt-openwith | hand-rolled port | yes | yes | yes | no | not audited |
| curtis plugin | vendored copy | no | yes | partial | divergent | fails L1 (see tracker) |
| curtis-ai-porter | vendored oracle | incidental | yes | top-level dropped | divergent | fails L1 (see tracker) |
| curtis-web | hand-rolled | n/a (W only) | n/a | yes on write | divergent | writer only |
| curtis-cloud | vendored mirror | no | shallow | partial | absent | fails L1 (see tracker) |
| curtis-ai-tech | inline copy | incidental | yes | yes | divergent | fails L1 (see tracker) |
| tractum | native (own validator) | rejects BOM | yes | yes | n/a (dicts) | vectors not run |
| curt-vcon | **npm `curt-format`** | via ref | via ref | n/a (bridge) | no | vectors not run |
| curt-convert | **npm `curt-format`** | n/a (W only) | self-check via ref | writer extras | yes | vectors not run |
| curt-wildchat | **npm `curt-format`** | n/a (W only) | self-check via ref | writer extras | yes | [L3 artifact run](/docs/ecosystem/curt-wildchat#bulk-conformance-artifact) |
| curt-openwebui | **npm `curt-format`** (TS) / hand-rolled (Py) | TS via ref / n/a Py | TS self-check / shallow Py | writer extras | yes (both) | vectors not run |
| curt-busabase | **npm `curt-format`** | n/a (W only) | self-check via ref | writer extras | yes | vectors not run |

The trend the matrix records: the newest three writers depend on the
`curt-format` package instead of vendoring the rules, and they are the
first to use the spec's `curtFilename` algorithm — the two fixes the
original audit ranked highest.

## The tool suite

- [`curt-vcon`](/docs/ecosystem/curt-vcon) — bridge to the IETF vCon container
- [`curt-convert`](/docs/ecosystem/curt-convert) — Claude Code transcripts
- [`curt-wildchat`](/docs/ecosystem/curt-wildchat) — WildChat-1M research data
- [`curt-openwith`](/docs/ecosystem/curt-openwith) — offline desktop viewer
- [`curt-openwebui`](/docs/ecosystem/curt-openwebui) — Open WebUI exporter
- [`curt-busabase`](/docs/ecosystem/curt-busabase) — Busabase review trails

To view a `.curt` file without installing anything:
[dotcurt.org/viewer](https://dotcurt.org/viewer/) — the in-browser
viewer, fully client-side. To convert a vendor export into `.curt`
files: [dotcurt.org/try](https://dotcurt.org/try/).

These pages are high-level overviews; deep-dives (field-mapping tables,
loss ledgers, packaging internals) live in each tool's repo.
