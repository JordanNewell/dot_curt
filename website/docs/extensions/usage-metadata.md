---
id: usage-metadata
title: "usage-metadata"
description: "Stable extension: per-message token counts, cost, and provider as optional extra fields."
---

# `usage-metadata` — stable

Optional extra fields recording economics and provenance:

- **Message-level:** `tokens` (object, e.g.
  `{ "input": 12, "output": 340 }`), `cost` (number, writer's currency),
  `provider` (string).
- Readers MUST preserve these verbatim on round-trip; they never affect
  validation.
- **Status: `stable`.** Emitted by porter, curtis-web, and curtis-ai-tech.

Like every extension, these fields are unknown fields as far as core
parsing is concerned: a reader that doesn't implement `usage-metadata`
ignores the names and reads only the fields it knows. See
[SPEC](/docs/spec), "Unknown fields".
