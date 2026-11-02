---
id: faq
slug: faq
title: FAQ
description: "Exporting ChatGPT and Claude conversations, vendor export formats, provider switching, GDPR portability, plus the magic string, BOM, bulk zip, vCon, and license questions — answered from SPEC.md."
---

# FAQ

Answers grounded in [SPEC.md](/docs/spec); each links the section that
decides.

## Why is the magic string `"curtis-conversation"`?

It is a version-1 compatibility legacy of the format's origin in Curtis AI
Chat. It cannot change without breaking every existing file, so it stays.
The format itself is vendor-neutral, and nothing in the spec favors
Curtis — the spec says so directly, and the `generator` field exists so
*your* app can sign what it wrote. See SPEC "File shape" and the [names
table](https://github.com/JordanNewell/dot_curt#names-disambiguated) in the
README.

## Why tolerate a BOM?

A UTF-8 byte-order mark is not JSON, but Windows editors prepend one
anyway. Release 1.1.0 clarified the rule: readers MUST ignore at most one
leading UTF-8 BOM — it is not part of the JSON body — and writers MUST NOT
emit one. Tolerance on read, discipline on write. See SPEC "File shape".

## Why zip for bulk?

Because one file is one conversation. There is no manifest, no account
wrapper; a directory of conversations is a directory of files, and bulk
transfer is a zip of them. No naming scheme is required — readers MUST NOT
depend on file names — and readers import the valid entries and report
(not silently drop) corrupted ones. The recommended `curtFilename`
convention exists so names order chronologically and survive title edits,
but it is a convenience, never an input. See SPEC "Bulk convention".

## Why not just use vCon?

vCon and .curt model different domains. vCon (draft-ietf-vcon-vcon-core,
IETF) targets real-time human conversations — calls, transcriptions,
call-center sessions — and has no LLM-native semantics: no role vocabulary
tied to model inference, no tool-call linkage, no model metadata, and no
executable conformance vectors. .curt targets AI-chat fidelity in a single
file with strict validation and a testable conformance ladder. Neither
subsumes the other; the [`curt-vcon`](/docs/ecosystem/curt-vcon) bridge
maps the overlapping text subset, and its fidelity matrix shows what such
a mapping drops. Full comparison: [.curt vs vCon vs vendor
exports](/docs/comparison).

## What's the license split?

The spec, reference implementation, schema, and fixtures are **MIT** — as
of release 1.2.0 (2026-10-14), permanently. Through 1.1.0 they were
BUSL-1.1; the relicense was deliberate: a standard that requires permission
to implement is not open. The Curtis *applications* (plugin, Porter, web,
cloud) are separate works under BUSL-1.1 — the moat is in the apps, not
the standard. See the README's [License
section](https://github.com/JordanNewell/dot_curt#license).

## Is an empty `messages` array valid?

Yes — spec-valid. Readers accept it: `messages` is an array in which every
entry passes message validation, and an empty array trivially satisfies
that. Writers should not emit one, since a conversation with no messages
carries nothing. See SPEC, the `conversation` table, and the validation
rules.

## How do I export my ChatGPT conversations?

ChatGPT's own export (Settings → Data controls → Export data) emails you
a zip whose centerpiece is `conversations.json` — an undocumented,
unversioned snapshot of the platform's internal store, where each
conversation is a `mapping` tree rather than a linear transcript. Drop
that zip (or the `conversations.json` itself) onto
[dotcurt.org/try](https://dotcurt.org/try/): the converter walks the
mapping from the current node and writes conforming `.curt` files, one
per conversation, entirely in your browser. The
[exporting guide](/docs/guides/export-chats) walks through the shape and
the failure modes.

## How do I export Claude conversations?

Claude's export (Settings → Privacy → Export data) emails a zip with
`conversations.json`, where each conversation's `chat_messages` is a
flat list threaded by `parent_uuid` chaining. The same
[dotcurt.org/try](https://dotcurt.org/try/) converter reads that shape
directly; the [Curt Conversation
Exporter](https://dotcurt.org/extension/) browser extension takes the
conversation already open in your tab in one click, with no network
calls. Details: the [exporting guide](/docs/guides/export-chats).

## What format are ChatGPT exports?

A zip archive containing JSON — chiefly `conversations.json`, an array
of conversation objects with a `mapping` of message nodes, plus account
metadata and (separately requested) media. There is no published schema
and no version number: the shape is platform-internal and has changed
without notice. That is precisely the gap [`.curt`](/docs/spec) fills —
a documented, versioned, validated single-file format. See the
[comparison](/docs/comparison) for the point-by-point.

## Can I move chats between AI providers?

Not directly — no provider imports another provider's export, and their
export shapes are mutually incompatible. What you can do is move your
history into a format every tool *can* read, so the move stops being
per-platform work: convert the exports to [`.curt`](/docs/spec) (one
open file per conversation), keep the archive, and convert from `.curt`
to whatever a given system accepts. The [`curt-vcon`](/docs/ecosystem/curt-vcon)
bridge covers the IETF vCon container; the
[conversion ladder](/docs/guides/export-chats) covers the vendor
exports.

## Is there an open conversation file format?

Yes — this one. `.curt` is an open, MIT-licensed single-file format for
AI chat conversations: one UTF-8 JSON file per conversation, full
fidelity (base64 images and tool calls ride verbatim in content),
strict whole-file validation, and [executable conformance
vectors](/docs/conformance) so implementations are testable against the
same JSON. Spec v1 is [frozen](/docs/spec-terms): version 1 never
changes meaning, and growth happens through the named [extension
registry](/docs/extensions). The reference implementation is
[`curt-format` on npm](https://www.npmjs.com/package/curt-format).

## Does this help with GDPR data-portability requests?

GDPR Article 20 requires export "in a structured, commonly used and
machine-readable format." A vendor's private snapshot technically
satisfies the letter — it is structured JSON — but nothing outside the
vendor can commit to parsing it: no schema, no version, no validation
rule, and it changes without notice. A frozen, documented, openly
licensed format with executable conformance vectors is what makes the
right exercisable in practice. The [preprint](https://dotcurt.org/paper/)
makes this argument in full; the format is the implementation of it.
