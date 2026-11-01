---
id: governance
slug: governance
title: Governance
description: "BDFL, the extension proposal process, and the stability criteria — stated as it is."
---

# Governance

Stated as it is, not as a committee would describe a committee.

## One maintainer

dot_curt has a single maintainer (Jordan Newell) acting as BDFL. Spec,
registry, and vector changes land as ordinary commits; there is no working
group, no chair, no consensus procedure. This is a limitation and, at
current scale, a feature: the format moves at the speed of its problem,
and the audit trail is the git history.

## Extension proposal process

Open a pull request against
[`EXTENSIONS.md`](https://github.com/JordanNewell/dot_curt/blob/main/EXTENSIONS.md)
adding a section. Each entry MUST have:

- `name` — lowercase, hyphenated, unique.
- `status` — `draft` (new entries always start here) → `stable`;
  `deprecated` retires an entry.
- Purpose.
- The exact fields it reads/writes, and where (conversation-level or
  message-level).
- Conformance vectors in
  [`conformance/vectors/extensions.json`](https://github.com/JordanNewell/dot_curt/blob/main/conformance/vectors/extensions.json).

Constraints the spec imposes on every entry: extensions cannot conflict
with core field names, must not change how the core validates, and the
registry is additive — new entries never change how existing v1 files
parse.

## Stability criteria

An extension moves `draft` → `stable` when **at least two independent
implementations** round-trip it. Same-author emissions do not count:
`curt-convert` emitting `tool-linkage` alongside the reference's own
implementation keeps that extension at draft, because both share an author.
This is checked against the ecosystem tracker
([CAPABILITIES.md](https://github.com/JordanNewell/dot_curt/blob/main/CAPABILITIES.md)),
not asserted.

## Self-reported conformance

Claims are made by implementers against public vectors and recorded in a
public tracker, with the expectation of a reproducible run. Nothing
independently audits the reference implementation either; what makes the
system honest is that the vectors are executable and public, so any claim
can be checked by anyone in minutes. The first ecosystem audit
(2026-10-14) graded five consumers and found none passing L1 — the tracker
made drift visible, which is its job.

## Precedents

Small-foundation formats have reached ubiquity in exactly this shape: JSON
was controlled by Douglas Crockford until RFC 8259; RSS 2.0 was shepherded
by Dave Winer with a frozen spec. The instructive failure is Markdown,
whose ambiguity plus single-implementer drift produced the CommonMark
fork. The lessons taken: freeze the core early (done — version 1's rules
are frozen at release), keep extension as the only motion (done), and
donate to a foundation early enough that the fork never becomes the
rational move (open).

## Licensing

The spec, reference implementation, schema, and fixtures were BUSL-1.1
through release 1.1.0; as of 1.2.0 (2026-10-14) they are MIT, permanently.
The Curtis applications remain BUSL-1.1. See the [FAQ](/docs/faq#whats-the-license-split).
