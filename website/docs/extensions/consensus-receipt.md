---
id: consensus-receipt
title: "consensus-receipt"
description: "Draft extension (tractum): a signed k-of-n consensus decision bound to the transcript evidence."
---

# `consensus-receipt` — draft

A verifiable multi-agent consensus decision carried alongside the evidence
it was drawn from. The conversation's `messages` ARE the evidence
transcript; the decision rides in extension fields:

- **Conversation-level:** `consensusReceipt` (object — the full signed
  receipt envelope: `payload`, `algorithm`, `public_key`, `signature`,
  `payload_hash`, `signed_at`, `metadata`) and `consensusTranscripts`
  (array of `{ "id": string, "sha256": string }` — one entry per source
  transcript, where `sha256` is the hex digest over that document's
  canonical JSON serialization).
- The receipt's signed payload embeds its own copy of the
  `consensusTranscripts` refs. Verifiers recompute the hashes and compare —
  the decision is bound to this exact evidence or the artifact is invalid.
- Writers SHOULD declare `agent-context` alongside this extension (the
  receipt's per-agent statements reference agents that `agent-context`
  provenance describes).
- The extension guarantees only preservation. Signature and quorum
  verification semantics are writer-defined (tractum: Ed25519 or ML-DSA
  over canonical JSON, k-of-n quorum in `payload.quorum`).
- **Status: `draft`** — single implementation (tractum). Stable when a
  second independent implementation round-trips it.

This entry is also the extension mechanism working as designed: a new
capability class entered the format, `version` stayed `1`, and no existing
file parsed differently.
