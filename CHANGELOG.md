# Changelog

## Unreleased

- License: MIT. The spec, reference implementation, schema, and fixtures were
  BUSL-1.1 through 1.1.0; they are now permanently open. Applications remain
  BUSL-1.1 — see the design doc, docs/specs/2026-10-14-curt-standard-framework-design.md.
- License: Business Source License 1.1 (BUSL-1.1) — source-available;
  converts automatically to Apache-2.0 on the Change Date, 2030-10-12.
- Ecosystem capability tracker: `CAPABILITIES.md` + machine-readable
  `capabilities.json` — per-consumer read/write, spec revision implemented,
  conformance gaps (first audit 2026-10-14: 5 consumers in, 8 repos out,
  zero consumers on the `curt-format` package).

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
