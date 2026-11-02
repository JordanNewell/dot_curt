---
id: export-chats
slug: export-chats
title: "Exporting AI conversations: ChatGPT, Claude, Gemini, and agent logs"
description: "What each vendor's native AI chat export actually contains, what breaks when you build on it, and how to convert to .curt — the open conversation file format."
---

# Exporting AI conversations: ChatGPT, Claude, Gemini, and agent logs

A practical guide to getting your AI chat history out of each platform in
a form you can keep. Nothing here is proprietary knowledge — the exports
are things the platforms already hand you. The problems with them, and
what .curt does about each, are stated as they are; the [comparison
page](/docs/comparison) carries the full adversarial version of the same
argument.

## Why this is harder than it should be

Every major AI platform has an export feature, and every one of them
hands you a private snapshot of the platform's internal database. The
[preprint](https://dotcurt.org/paper/) documents the pattern across the
landscape (§1–§2): the exports are **undocumented** (no published schema),
**unversioned** (they change without notice, because nothing external
depends on them contractually), and **validation-free** (there is no rule
for detecting a corrupted export — bridge tools typically half-import
whatever parses). They are the problem statement, not part of the
solution space.

.curt is the counter-proposal: [one open, versioned, validated file per
conversation](/docs/spec), with [executable conformance
vectors](/docs/conformance) so a claim like "reads .curt" is testable
rather than prose.

## ChatGPT

**How to export:** ChatGPT → Settings → Data controls → Export data.
OpenAI emails a download link; the archive is a zip whose centerpiece is
`conversations.json`.

**What's inside:** an array of conversation objects. Each carries a
title, timestamps, and a `mapping` — a tree of message nodes, not a
linear list. The live thread is found by walking from the root to
`current_node`, which is why a regenerated answer stays in its branch
instead of corrupting the file. Message content arrives as `{text}` or
`{parts: [...]}` depending on message age and type.

**What breaks:** the field names and the mapping shape are undocumented
and have shifted before; a consumer has no way to tell a truncated
export from a complete one; branch handling is on you.

**Converting:** drag the zip (or `conversations.json` itself) onto
[dotcurt.org/try](https://dotcurt.org/try/). The converter walks the
mapping from the current node, so the branch you actually see in the UI
is the one that lands in the file, then writes conforming `.curt` files
through the reference implementation. It runs entirely in your browser —
nothing is uploaded.

## Claude

**How to export:** Claude → Settings → Privacy → Export data. Anthropic
emails a link to a zip containing `conversations.json`.

**What's inside:** conversation objects whose `chat_messages` is a flat
list, with threading expressed by `parent_uuid` chaining rather than a
tree. Titles ride in a `name` field.

**What breaks:** same class of problem — undocumented, unversioned, no
validation rule. The parent-uuid chain means a tool that ignores it
flattens edited conversations silently.

**Converting:** the same [dotcurt.org/try](https://dotcurt.org/try/)
page reads Claude exports from their chat-message lists and chains the
parent UUIDs correctly. In a terminal, the browser extension
([Curt Conversation Exporter](https://dotcurt.org/extension/)) grabs the
conversation already open in your tab in one click, locally.

## Gemini

**How to export:** Google Takeout. Gemini's history arrives as activity
logs (HTML or JSON), not as a conversation-first archive.

**What breaks:** Takeout's logs are an audit trail, not a transcript —
there is no per-conversation object with roles and timestamps in the
shape the other vendors provide, so no faithful one-click mapping
exists. This is the honest limit: the guide's other conversions are
lossless at the text level; Gemini's is best-effort at best. The
[preprint's landscape survey](https://dotcurt.org/paper/) treats this as
evidence for the portability argument, not a defect to paper over.

## Claude Code and agent session logs

**What's inside:** agent frameworks keep session transcripts as local
JSONL event logs — Claude Code writes one JSONL file per session; the
same pattern shows up in other agent runtimes (OpenClaw, Hermes). These
are the most machine-readable exports in the ecosystem, and the least
portable: a private event stream with no schema, tied to the tool's
internal model of a session.

**Converting:** [`curt-convert`](/docs/ecosystem/curt-convert) (npm)
maps Claude Code session JSONL to `.curt`, including the
[`tool-linkage`](/docs/extensions/tool-linkage) extension for
tool-call/result pairs. For other frameworks' JSONL logs there is not
yet a published converter — the mapping is small (the .curt envelope has
few required fields), and the [extension
registry](/docs/extensions/) is the intended route for agent-specific
provenance such as multi-agent context
([agent-context](/docs/extensions/agent-context)).

## Self-hosted chat UIs

**Open WebUI:** [`curt-openwebui`](/docs/ecosystem/curt-openwebui) is a
TypeScript CLI plus an Open WebUI pipelines filter that exports local
chats to `.curt` — no cloud involved, by construction.

## Bulk and research corpora

**WildChat-1M:** [`curt-wildchat`](/docs/ecosystem/curt-wildchat)
converts WildChat-1M records (ODC-BY licensed) to `.curt`. The [bulk
evidence run](/docs/status) — 1,000 records converted, 100%
independent re-parse — is the L3 conformance artifact.

## After conversion

- **Keep the files.** A `.curt` file is UTF-8 JSON, readable in any
  editor, and version-1 files stay readable forever by rule — [the
  spec](/docs/spec) freezes v1's meaning.
- **Read them anywhere:** [dotcurt.org/viewer](https://dotcurt.org/viewer/)
  opens any `.curt` file in the browser, or double-click with
  [`curt-openwith`](/docs/ecosystem/curt-openwith) (Windows, macOS,
  Linux).
- **Validate before you trust an archive:** the reader rejects a
  corrupted file whole — never half-imports it. The [JSON
  Schema](/docs/schema) covers editor and linter integration.
- **Interop:** [`curt-vcon`](/docs/ecosystem/curt-vcon) bridges to the
  IETF vCon container where a telephony-domain system needs the overlap.

## The portability framing

GDPR Article 20 gives you the right to receive your data "in a
structured, commonly used and machine-readable format." A vendor
snapshot of a private database satisfies the letter and not the spirit —
you cannot build on it, and nothing external can commit to parsing it.
A frozen, documented, openly licensed format with executable conformance
vectors is what the spirit requires. That is the whole argument of the
[preprint](https://dotcurt.org/paper/); the format is the answer.
