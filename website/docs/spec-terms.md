---
id: spec-terms
slug: spec-terms
title: Spec terminology
description: "How RFC 2119 keywords are used in SPEC.md, and the version-1 freeze rule."
---

# Spec terminology

## RFC 2119 keywords

SPEC.md uses RFC 2119 keywords in their usual sense:

- **MUST / MUST NOT** — an absolute requirement. Violating one means the
  implementation is not conforming; there is no partial credit.
- **SHOULD** — a strong recommendation. A conforming implementation may
  deviate only when there is a good reason, and the deviation is recorded.
- **MAY** — a genuinely optional behavior. Doing it or not is conforming
  either way.

Examples from the spec:

- A reader MUST reject a file whole on any validation failure — never
  best-effort half-import it.
- Readers MUST ignore the `generator` field entirely.
- Readers MUST NOT fail on unknown fields, and preserve them on round-trip
  where possible ("where possible" is deliberate — see SPEC "Unknown
  fields").
- Writers MUST NOT emit a byte-order mark; readers MUST tolerate one
  leading UTF-8 BOM (the 1.1.0 clarification).
- A reader SHOULD use `curtFilename` for bulk entry names; it MUST NOT
  depend on file names.
- Importing corrupted zip entries is reported rather than dropped; whether
  an implementation ships bulk support at all is MAY (conformance level L3).

## The version-1 freeze rule

The validation rules of a format version are **frozen at its release**.
Within version 1:

- **Additions** ship as new [extension registry](/docs/extensions) entries
  or as clarifications. `version` stays `1`, and every existing v1 file
  remains valid. The registry is additive: new entries never change how
  existing files parse, and entries cannot conflict with core field names.
- **Breaking changes** — anything that would make a conforming v1 reader
  reject or misparse a file it previously accepted — get a new version
  number. A future version 2 bumps `version` and keeps version-1 files
  readable forever. Breaking changes are never a silent redefinition of 1.

Two version axes are in play, and they are distinct:

- **Format version** — the `version` field in the file. `1` everywhere
  today.
- **Spec revision** — additive clarifications within a version, tracked as
  `curt-format` package minors (1.0.0 → 1.1.0 added BOM tolerance, the
  `curtFilename` algorithm, the type guards, the JSON schema). Consumers
  conform to a *revision*, not just the version number. Current revision:
  `curt-format@1.2.0`.
