---
id: comparison
slug: comparison
title: ".curt, vCon, and vendor exports"
description: "An honest comparison: what each format solves, where .curt differs, and where it does not compete."
---

# .curt, vCon, and vendor exports

Three things get called "conversation formats," and they solve three
different problems. This page states what each is for, where .curt differs,
and — equally — where it does not compete. No format subsumes another here.

## The three

**Vendor exports** (ChatGPT's `conversations.json`, Claude's message lists,
Gemini's Takeout activity logs) are what platforms hand you when you ask
for your data. They are undocumented, unversioned, platform-internal, and
they change without notice, because nothing external depends on them
contractually. A consumer faced with one has no rule for detecting
corruption, and bridge tools typically half-import whatever parses. They
are the problem statement, not part of the solution space.

**[vCon](https://datatracker.ietf.org/doc/html/draft-ietf-vcon-vcon-core)**
(draft-ietf-vcon-vcon-core, IETF vCon working group) is the closest
standards-track relative: a JSON container for conversational data with a
working group, a dialog data model, and a party/participant model. Its
home community is human, real-time communications — voice and video calls,
transcriptions, call-center sessions, signaling metadata. It is a work in
progress: the draft is not yet an RFC and the WG is active.

**.curt** is a single-file conversation format for AI chats: one file, one
conversation, full fidelity, with strict whole-file validation and an
executable conformance suite.

## What each solves

| | Vendor exports | vCon | .curt |
|---|---|---|---|
| Published spec a third party can implement | no | yes (IETF draft) | yes |
| Stable target — versioned, won't shift under you | no (unversioned) | draft, evolving | yes (v1 frozen; registry is the only motion) |
| Validation — is the file well-formed decidable? | no rule | container conventions; no executable vectors | strict whole-file rules + 27 executable vectors |
| LLM-native fields — roles incl. `tool`, per-message `model`, tool calls | ad hoc | none — no model-inference role vocabulary, no tool-call linkage | core roles `user`/`assistant`/`system`/`tool`, optional `model`, `tool-linkage` extension |
| Binary payloads | varies | recording dialogs (external or inline) | base64/data URIs ride verbatim inside `content` |
| Domain | whatever the platform holds | telephony/conference/media conversations | AI-chat fidelity, single file per conversation |
| Conformance testing | none | none — claims are checked by reading | L1–L4 ladder, run in CI by the reference |

## Where .curt differs

Four differences carry the weight:

1. **AI-native fields.** .curt's core role vocabulary includes `tool`, and
   `model` is a first-class optional message field. vCon's data model has
   no role vocabulary tied to model inference and no tool-call linkage; its
   charter scopes chat logs in, so the fair statement is not that vCon
   cannot represent chat, but that representing it requires
   application-private conventions atop a container designed for another
   domain. The [`curt-vcon`](/docs/ecosystem/curt-vcon) bridge exists
   precisely to map the overlapping text subset — and its fidelity matrix
   documents exactly what such a mapping must drop.
2. **Strict whole-file validation.** vCon ships no validation semantics a
   receiver can mechanically apply; vendor exports have none at all. .curt
   defines a conjunction of rules where any failure rejects the whole file
   — converting silent corruption into a loud error at a known boundary.
   The bulk convention restores the pragmatic middle ground at the level
   where it belongs: the archive (import valid entries, report corrupted
   ones).
3. **Executable conformance vectors.** Neither vCon nor any vendor export
   ships test vectors, so "supports X" is verified by reading. .curt's L1
   through L4 vectors are plain JSON; the reference implementation runs
   them in CI, and third-party claims are recorded against them.
4. **The extension registry.** The registry is the only forward-motion
   mechanism inside version 1: new named capabilities enter without
   changing how existing files parse. It is worth crediting vCon here —
   the draft deprecates its top-level version field in favor of an
   extension mechanism, confirming the frozen-core-plus-registry pattern
   for containers of this kind. .curt starts there rather than arriving.

## Where .curt does not compete

- **vCon's domain.** Call recordings, audio/video dialogs, signaling
  metadata, multi-party telephony sessions — vCon is the standards-track
  home for these and .curt has no story for them. If your conversations
  are between people over real-time media, look at vCon first. The two are
  complementary: the
  [`curt-vcon`](/docs/ecosystem/curt-vcon) bridge moves the text subset
  between them, lossily and honestly.
- **Vendor exports' breadth.** An export bundle carries account state,
  settings, and history beyond conversations. .curt deliberately answers
  one question: what did the conversation contain. Use the export for the
  account, .curt for the archive.

## Status, stated plainly

- .curt v1's spec, reference implementation, schema, and vectors are
  MIT-licensed; the comparison document itself began as part of a
  **preprint** paper (draft 2, 2026-10-25) that has not yet been submitted
  to arXiv. Treat the scholarship framing accordingly.
- vCon is an active IETF working-group draft, not an RFC; field-level
  statements here are per draft-ietf-vcon-vcon-core-05 and may move with
  the draft.
- .curt's governance is a single maintainer and its conformance is
  self-reported — see [governance](/docs/governance) for that account,
  given as it is.
