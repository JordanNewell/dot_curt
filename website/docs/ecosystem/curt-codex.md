---
id: curt-codex
title: "curt-codex"
description: "OpenAI Codex CLI session rollouts -> .curt, and .curt -> Codex rollout JSONL — npm curt-codex."
---

# `curt-codex`

A two-direction bridge between **OpenAI Codex CLI** session rollout files and **.curt**.

- **Repo:** [github.com/JordanNewell/curt-codex](https://github.com/JordanNewell/curt-codex)
- **npm:** [`curt-codex@1.0.0`](https://www.npmjs.com/package/curt-codex) (MIT)
- **Depends on:** [`curt-format`](https://www.npmjs.com/package/curt-format)
  — parsing and validation come from the reference; every converted file
  is round-trip checked before it is written.

## What it does

Codex CLI keeps sessions as rollout JSONL files. This converter reads rollouts into validated `.curt` archives, and writes `.curt` files back out as rollout JSONL — the native input format for `hermes sessions import` and OpenClaw sessions import. Same loop as curt-hermes: archive in the open format, return through whatever door the tool already has.

Part of the .curt converter suite — see the
[status page](/docs/status) for the registry entry.
