---
id: curt-openwebui
title: "curt-openwebui"
description: "Export Open WebUI chats to .curt — a TypeScript CLI plus an Open WebUI pipelines filter."
---

# `curt-openwebui`

Export [Open WebUI](https://github.com/open-webui/open-webui) chats to
`.curt` v1 single-file conversation files. Two artifacts in one repo:

1. **`curt-openwebui-export`** — a standalone TypeScript/Node CLI. Reads a
   chat export file or fetches from the Open WebUI REST API; writes one
   validated `.curt` per chat.
2. **`pipelines/curt_export_pipeline.py`** — a community
   [open-webui/pipelines](https://github.com/open-webui/pipelines) filter
   that writes/updates a `.curt` file as each conversation happens.

- **Repo:** [github.com/JordanNewell/curt-openwebui](https://github.com/JordanNewell/curt-openwebui)
- **Publishing status:** local and unpublished — no npm package yet. The
  TS side depends on
  [`curt-format`](https://www.npmjs.com/package/curt-format); the Python
  pipeline implements the serializer and v1 validation stdlib-only.
- **Role:** write only

## CLI usage

```sh
npm i && npm run build

# from a UI export file (Settings > Chats > Export) — NDJSON or JSON array
node dist/src/cli.js chat-export.ndjson -o ./curt-out

# or straight from the API
OPENWEBUI_BASE_URL=https://openwebui.example \
OPENWEBUI_API_KEY=sk-... \
node dist/src/cli.js -o ./curt-out
```

Every file is validated with the reference `parseCurt` before it is
written; an invalid conversation is reported and skipped, never
half-written. Output names follow the bulk convention via `curtFilename`.

## Mapping highlights

- Field names were verified against the open-webui `main` source, not
  guessed (`ChatResponse` from `models/chats.py`, the NDJSON streaming
  export, the `parentId`-linked message tree).
- Open WebUI stores epoch **seconds**; .curt carries epoch milliseconds —
  ×1000 on the way in.
- The UI-visible branch of the message tree is exported; regenerate/
  variant siblings are dropped, and the count is recorded as
  `openwebuiSkippedBranches` passthrough.
- Files, sources, usage, annotations, and error payloads ride as
  same-named passthrough fields — readers ignore unknowns and preserve
  them on round-trip.

## Pipeline status, stated honestly

The Python pipeline is draft: never live-smoked in a real Open WebUI
pipelines runtime, and its validator is shallower than `parseCurt`
(conversation dict only, envelope never checked). A pipeline-written body
does parse valid in the reference parser (cross-checked 2026-11-01).

## Where to go deeper

The full schema-verification table (every field name with its open-webui
source file), the complete mapping table, known losses, and pipeline
valves live in the repo README:
[github.com/JordanNewell/curt-openwebui](https://github.com/JordanNewell/curt-openwebui).
