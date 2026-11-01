---
id: extensions
title: Extension registry
description: "Named, optional capability sets for .curt v1 — the registry overview and its five entries."
---

# Extension registry

Extensions are named, optional capability sets a writer declares in the
top-level `extensions` array (see [SPEC](/docs/spec), "Extensions"). Core
v1 parsing is never affected: a reader that doesn't know an extension
ignores it — the field is never a validation input and never a reason to
reject.

```json
{
	"curt": "curtis-conversation",
	"version": 1,
	"extensions": ["images-inline"],
	"conversation": { }
}
```

Three properties make the mechanism safe:

1. **Declaration costs nothing.** The array is itself an unknown field to
   old readers — never a validation input, whatever its shape.
2. **Extensions are behaviorally inert at the core.** Behavior lives
   entirely in the fields an extension reads and writes inside the
   conversation and its messages; an extension must not change how the
   core validates.
3. **The registry is additive.** New entries never change how existing v1
   files parse, and entries cannot conflict with core field names.

## Status rule

Entries start `draft` and move to `stable` when **two independent
implementations** round-trip them. Same-author emissions do not count —
the registry states this per entry where it applies. `deprecated` retires
an entry.

## Registry

| Name | Status | Emitted by | Purpose |
|---|---|---|---|
| [`images-inline`](/docs/extensions/images-inline) | stable | curtis plugin, porter, curtis-web, curtis-cloud, curtis-ai-tech | Image payloads ride inside `content` |
| [`usage-metadata`](/docs/extensions/usage-metadata) | stable | porter, curtis-web, curtis-ai-tech | Per-message cost/token/provider fields |
| [`tool-linkage`](/docs/extensions/tool-linkage) | draft | porter, curtis-ai-tech, curt-convert (same author — does not count toward stability) | Tool-call requests and their results |
| [`agent-context`](/docs/extensions/agent-context) | draft | curtis plugin, porter, curtis-cloud, curtis-ai-tech | Agent/swarm provenance on conversations and messages |
| [`consensus-receipt`](/docs/extensions/consensus-receipt) | draft | tractum | Signed k-of-n consensus decision bound to the transcript evidence |

The browsable per-extension pages above are hand-authored views; the
registry's full normative text is rendered at
[Extension registry — full text](/docs/extensions-registry).

Full per-consumer emit/accept data lives in
[`capabilities.json`](https://github.com/JordanNewell/dot_curt/blob/main/capabilities.json).

## Adding an entry

Open a PR against
[`EXTENSIONS.md`](https://github.com/JordanNewell/dot_curt/blob/main/EXTENSIONS.md)
— see [governance](/docs/governance) for the required sections and the
stability bar.
