---
id: conformance
slug: conformance
title: Conformance
description: "The L1–L4 conformance ladder, the executable vectors, and how to claim a level."
---

# Conformance

"Supports .curt" is a testable claim, not an adjective. An implementation
claims a level by passing its vectors; the vectors are plain JSON in
[`conformance/vectors/`](https://github.com/JordanNewell/dot_curt/blob/main/conformance/vectors)
and the reference implementation executes them in CI. If your parser accepts
what the vectors accept and rejects what they reject, you match the level.

## The ladder

| Level | Name | Requirement | Obligation |
|---|---|---|---|
| L1 | CORE | Parse/serialize v1: magic + `version` exact-match; whole-file rejection; single leading UTF-8 BOM tolerated; unknown fields preserved on round-trip; any JSON-number timestamps accepted | MUST for "conforming" |
| L2 | NAMED | `curtFilename` implements the `<date> <slug> <suffix>.curt` algorithm exactly | SHOULD |
| L3 | BULK | Zip-of-`.curt` convention; entry names from `curtFilename`; readers never depend on names; corrupted entries reported (not silently dropped), valid ones imported | MAY |
| L4+ | Extension | Each extension's vectors in `vectors/extensions.json` | MAY |

## The vectors

- `vectors/core.json` — L1. Each case's `body` is a raw file body string;
  `expect` is `"accept"` or `"reject"`.
- `vectors/named.json` — L2. `conversation` in, exact filename out.
- `vectors/bulk.json` — L3. Rules plus a canonical example; zip-level
  behavior is asserted by rule, not binary fixture, so the vectors stay
  plain JSON.
- `vectors/extensions.json` — all cases are `accept`: extension presence —
  or malformation — must never cause rejection.

The suite is 27 cases: 13 L1 accept/reject bodies, 7 L2 naming cases, 6
extension cases, and the L3 rules. The reference implementation passes
L1–L4 in CI.

## Claiming a level

1. Run your implementation against the vectors.
2. Update your row in
   [`capabilities.json`](https://github.com/JordanNewell/dot_curt/blob/main/capabilities.json):
   `conformanceLevel` (for example `"L1"`, `"L1+L2"`), `extensions` (names
   you emit/accept), and `evidenceDate`.
3. Link the run (a CI job or script) from your repo.

Claims are self-reported, but they MUST be reproducible from the vectors.
That is the entire enforcement model — and it is enough, because a claim
that cannot be reproduced takes minutes to expose.

## What conformance caught

The first ecosystem audit (2026-10-14) found that none of the five
in-ecosystem consumers passed L1: drift concentrated on BOM tolerance and
the naming algorithm — exactly the failures a vector suite exists to catch.
See the [ecosystem tracker](/docs/ecosystem) for the current scoreboard.
