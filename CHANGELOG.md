# Changelog

## Unreleased

- Documentation corrections from the post-release audit: SPEC's bulk
  convention now states the L3 rules normatively (import valid entries,
  report corrupted ones — never silently drop; ignore directory entries);
  spec-revision pins updated to `curt-format@1.2.0`; the unused
  conversation-level `provider`/`model` fields were removed from the
  `CurtConversation` type (they were never in the spec's conversation table;
  the fields ride unknown-field passthrough or the `usage-metadata`
  extension).
- Publication history corrected: 1.0.0 and 1.1.0 were tagged in-repo but
  never published to npm. **1.2.0 is the first npm release.**

## 1.2.0 — 2026-10-14

- License: MIT. The spec, reference implementation, schema, and fixtures were
  BUSL-1.1 through 1.1.0; they are now permanently open. Applications remain
  BUSL-1.1 — see the design doc, docs/specs/2026-10-14-curt-standard-framework-design.md.
- Ecosystem capability tracker: `CAPABILITIES.md` + machine-readable
  `capabilities.json` — per-consumer read/write, spec revision implemented,
  conformance gaps (first audit 2026-10-14: 5 consumers in, 8 repos out,
  zero consumers on the `curt-format` package).
- Conformance: `conformance/` — levels L1 CORE / L2 NAMED / L3 BULK / L4
  extensions, executable vectors (`conformance/vectors/`), claim process.
  `capabilities.json` gains `conformanceLevel` / `extensions` per consumer
  (first grading 2026-10-14: only the reference implementation passes L1).

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

## 1.0.0 — 2026-10-10

Initial release: spec, reference implementation, round-trip fixtures. (Never
published to npm; the 2025 date in earlier revisions of this file was a typo.)
