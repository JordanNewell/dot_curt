---
id: curt-openclaw
title: "curt-openclaw"
description: "OpenClaw gateway session transcripts -> .curt — npm curt-openclaw."
---

# `curt-openclaw`

Converts **OpenClaw** gateway session transcripts (the file-based store) to **.curt** single-file conversation files.

- **Repo:** [github.com/JordanNewell/curt-openclaw](https://github.com/JordanNewell/curt-openclaw)
- **npm:** [`curt-openclaw@1.0.0`](https://www.npmjs.com/package/curt-openclaw) (MIT)
- **Depends on:** [`curt-format`](https://www.npmjs.com/package/curt-format)
  — parsing and validation come from the reference; every converted file
  is round-trip checked before it is written.

## What it does

OpenClaw is the open-source agent gateway framework. Its sessions live as JSONL files under a per-agent file-based store (`agents/<id>/sessions/*.jsonl`, with a `sessions.json` index) — a private event stream with no schema and no version. This converter reads that store and writes validated `.curt` files: one conversation per session, with tool-call linkage, usage metadata, and subagent lineage preserved where the store carries them.

It exists because OpenClaw's own documentation recommends exporting sessions for disk management while the product ships no export command — this is the archival path.

Part of the .curt converter suite — see the
[status page](/docs/status) for the registry entry.
