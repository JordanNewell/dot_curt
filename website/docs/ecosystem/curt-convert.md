---
id: curt-convert
title: "curt-convert"
description: "Convert Claude Code session transcripts (JSONL) to .curt — npm curt-convert."
---

# `curt-convert`

Convert Claude Code session transcripts (`.jsonl`) into `.curt`
single-file conversation files. Sister tool to
[`curt-wildchat`](/docs/ecosystem/curt-wildchat).

- **Repo:** [github.com/JordanNewell/curt-convert](https://github.com/JordanNewell/curt-convert)
- **npm:** [`curt-convert@1.0.2`](https://www.npmjs.com/package/curt-convert) (MIT)
- **Role:** write only
- **Depends on:** [`curt-format`](https://www.npmjs.com/package/curt-format)
  — every output file is re-parsed with `parseCurt` before it is written;
  a file that fails round-trip validation is never written.

## Install

```sh
npm install -g curt-convert   # or: npx curt-convert
```

## CLI

```sh
curt-convert ~/.claude/projects/C--tmp-demo/abc-123.jsonl
curt-convert ~/.claude/projects/C--tmp-demo/ -o ./out
curt-convert "**/*.jsonl" -o ./out
curt-convert session.jsonl --stdout > session.curt
```

- A `.jsonl` file, a directory (walked recursively), or a glob all work.
- Output defaults to alongside each input; `-o/--out` redirects.
- Names follow the bulk convention via `curtFilename()`.
- Bulk runs never overwrite: colliding inputs (parent sessions and
  sidechain files share a `sessionId`) get a deterministic `-<6 hex>`
  suffix from the source path — stable across runs. Set
  `CURT_CONVERT_SELFCHECK=0` to skip the self-check.

## Mapping highlights

- `sessionId` → `conversation.id`; `ai-title` (or first user text, ≤60
  chars) → `conversation.title`.
- `tool_use` blocks → `toolCalls[]` and `tool_result` blocks → separate
  `role: "tool"` messages with `toolCallId` — declares the
  [`tool-linkage`](/docs/extensions/tool-linkage) extension.
- Thinking blocks kept out of `content` as a message extra; the opaque
  signature dropped.
- Documented losses: token counts and cost, `parentUuid` chaining,
  `<system-reminder>` harness spans, meta/noise lines.

## Handling warnings

Output is transcript-equivalent, not redacted: if the transcript contains
secrets, the `.curt` file contains them too. Scrub before sharing.

## Where to go deeper

The full mapping table (every JSONL line type, kept or dropped), the
documented-losses ledger, and the security note live in the repo README:
[github.com/JordanNewell/curt-convert](https://github.com/JordanNewell/curt-convert).
