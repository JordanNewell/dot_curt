# Show HN — launch post draft

## Title options (each under 80 characters)

1. Show HN: .curt — an open single-file format for AI chat conversations
2. Show HN: One file per AI conversation, kept whole (MIT, conformance-tested)
3. Show HN: .curt — an AI conversation file format with executable conformance

## Post (body, 223 words)

Your conversation history with ChatGPT, Claude, or Gemini is legally yours — GDPR Article 20 says so — and practically unreachable. The exports are undocumented, unversioned, platform-internal JSON. Each vendor changes the shape without notice, because nothing external depends on it contractually. Every bridge tool reimplements its own parser against a moving target, and importers typically half-import whatever parses.

I built .curt (dot-curt), an open single-file format for AI conversations. One UTF-8 JSON file is one conversation, kept whole: roles including tool results, model identifiers, timestamps, and full-fidelity content — images and tool payloads ride verbatim.

The differences from "just use JSON":

- Strict whole-file validation. A malformed file is rejected whole, never half-imported. Silent corruption becomes a loud error at a known boundary.
- Unknown fields survive. Readers must not fail on fields they do not know, and preserve them where possible on round-trip.
- 27 executable conformance vectors — L1 CORE (must) through L4 per-extension — run in CI. "Supports .curt" is a testable claim, not prose.
- MIT throughout: spec, reference implementation, schema, fixtures. curt-format@1.2.0 on npm, zero dependencies.
- Five applications already read or write it (curtis plugin, porter, curtis-web, curtis-cloud, curtis-ai-tech), and the registry has since gained a fifth entry, consensus-receipt, submitted through the extension process by tractum — my own project, to be plain: the mechanism works; independent adoption is the open item.

The core is frozen. New capability means a named extension in the registry, never a spec edit.

Site: https://dotcurt.org
Code: https://github.com/JordanNewell/dot_curt
npm: https://www.npmjs.com/package/curt-format

## First comment (author follow-up, HN convention)

What I would build with it, given a weekend:

- An archive tool that watches a folder for vendor exports — ChatGPT's `conversations.json`, Claude's parent-UUID message lists, Gemini's Takeout activity logs — and normalizes each conversation into one .curt file, deterministic names, nothing lost.
- A viewer that opens any .curt file and round-trips it, so people can inspect what they actually hold.
- An importer for whatever chat app is next, built against the vectors instead of against observed vendor behavior.

On the extension registry: growth inside version 1 happens only through named registry entries declared in an optional `extensions` array. Five exist today — `images-inline` and `usage-metadata` are stable; `tool-linkage`, `agent-context`, and `consensus-receipt` are draft. Draft moves to stable only when two independent implementations round-trip an entry. A reader that does not know an extension ignores it; malformed extension data never breaks a core parse.

Honest audit findings, published 2026-10-14: nobody depends on the npm package yet. All five in-ecosystem consumers vendor or hand-roll their parsing, so the package is currently documentation, not infrastructure. Only the reference implementation passed L1; the drift concentrated on BOM tolerance and the filename algorithm — precisely the failures the vector suite exists to catch. That is the current score, recorded in a public tracker (`capabilities.json`).

There is a paper: {{ARXIV_URL}}. The argument: GDPR Article 20 crossed with LLM conversation archives is an unclaimed slot. The legal literature has reached generative AI without treating the archive itself as a portability problem, and the nearest peers — DTI's AI Conversation History schema, PAM, vCon, the W3C Memory Community Group — each leave the slot open for stated, specific reasons.
