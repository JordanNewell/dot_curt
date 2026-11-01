---
id: tool-linkage
title: "tool-linkage"
description: "Draft extension: links assistant tool-call requests to their tool-role results."
---

# `tool-linkage` — draft

Links assistant tool calls to their `tool`-role results:

- **Assistant message:** `toolCalls` — an array of objects with `id`
  (string), `name` (string), `arguments` (writer's JSON value).
- **Tool message:** `toolCallId` (string) referencing the
  `toolCalls[].id`.
- Round-trip is verbatim; readers must not reorder or drop entries.
- **Status: `draft`.**

On the status, stated exactly as the registry states it: the second emitter
(`curt-convert`) was added 2026-11-01, but it is same-author as the
reference — and stability requires two *independent* implementations, so
`tool-linkage` stays `draft` until a second author's implementation
round-trips it. The core/tool-role split is deliberate: the *existence* of
tool results is core (an LLM conversation without them is not full
fidelity), while this linkage schema is still stabilizing and so rides as
a draft extension.

Conformance vectors for it live in
[`conformance/vectors/extensions.json`](https://github.com/JordanNewell/dot_curt/blob/main/conformance/vectors/extensions.json);
all extension cases are accept-only — declaring or malforming the
extension must never cause rejection.
