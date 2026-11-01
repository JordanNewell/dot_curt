---
id: agent-context
title: "agent-context"
description: "Draft extension: multi-agent provenance fields on conversations and messages."
---

# `agent-context` — draft

Multi-agent provenance:

- **Conversation-level:** `agentId` (string), `skillIds` (array of
  strings), `swarmRole` (string), `leaderId` (string).
- Semantics are writer-defined; the extension guarantees only
  preservation.
- **Status: `draft`.** Emitted by the curtis plugin, porter, curtis-cloud,
  and curtis-ai-tech.

Because semantics are writer-defined, two `.curt`-reading applications
agree on these fields only in the preservation sense — the values mean
what the writing application meant. This is the container-not-content
pattern the format adopts deliberately (see the [comparison](/docs/comparison)).
