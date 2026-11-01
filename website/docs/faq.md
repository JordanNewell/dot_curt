---
id: faq
slug: faq
title: FAQ
description: "Magic string, BOM, bulk zip, vCon, license split, empty messages — answered from SPEC.md."
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
