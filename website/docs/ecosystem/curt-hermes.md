---
id: curt-hermes
title: "curt-hermes"
description: "Hermes agent state.db (SQLite) -> .curt, and .curt -> Claude Code session JSONL — npm curt-hermes."
---

# `curt-hermes`

A two-direction bridge between the **Hermes** agent store (an SQLite `state.db`) and **.curt** — plus an emitter that writes **Claude Code session JSONL**, which Hermes imports natively.

- **Repo:** [github.com/JordanNewell/curt-hermes](https://github.com/JordanNewell/curt-hermes)
- **npm:** [`curt-hermes@1.0.0`](https://www.npmjs.com/package/curt-hermes) (MIT)
- **Depends on:** [`curt-format`](https://www.npmjs.com/package/curt-format)
  — parsing and validation come from the reference; every converted file
  is round-trip checked before it is written.

## What it does

The interesting direction is the loop: Hermes cannot import its own exports. But it *does* import Claude Code session JSONL natively — so this converter reads Hermes's `state.db` into `.curt`, and writes `.curt` archives back out as Claude Code JSONL. Round-trip a Hermes agent's history through the open format and back into the tool, with no upstream change required.

Part of the .curt converter suite — see the
[status page](/docs/status) for the registry entry.
