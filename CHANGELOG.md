# Changelog

## Unreleased

- License: Business Source License 1.1 (BUSL-1.1) — source-available;
  converts automatically to Apache-2.0 on the Change Date, 2030-10-12.

## 1.1.0 — 2026-10-10

Additive release; format version stays `1` and every v1 file remains valid.

- `parseCurt` ignores a single leading UTF-8 BOM (spec clarified; writers
  still must not emit one).
- New exports: `isCurtMessage`, `isCurtConversation` (the validation rules as
  type guards), `curtFilename` (the documented naming convention), and
  `CURT_MAGIC`.
- Non-normative JSON Schema at `schema/curt-v1.schema.json`, importable from
  the package; tested to agree with `parseCurt`.
- SPEC.md: conformance section, BOM rule, integer-timestamp guidance,
  precise naming algorithm, untrusted-input notes.
- Package: `exports` map, `sideEffects: false`, schema + SPEC ship in the
  tarball. CI on Node 20/22 (Ubuntu + Windows). New empty-conversation
  fixture; 27 tests.

## 1.0.0 — 2025-10-10

Initial release: spec, reference implementation, round-trip fixtures.
