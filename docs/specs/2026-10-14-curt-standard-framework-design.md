# .curt Standard Framework — Design

**Date:** 2026-10-14
**Status:** Approved (Jordan, 2026-10-14)
**Repo:** dot_curt · **Scope:** sections 1–4 (framework, this cycle); rollout to consumers is a follow-up plan

## Goal

Turn `.curt` from "a spec plus five drifting copies" into a standard with one
license story, one governed evolution path, one conformance bar, and one
control plane — so every Curtis consumer (and any third party) builds around
the same thing.

Decisions locked by Jordan 2026-10-14:

1. **MIT the spec, keep BUSL on apps** — dot_curt's spec, reference
   implementation, schema, and fixtures become MIT; the five product repos
   stay BUSL-1.1.
2. **One package everywhere** — consumers adopt `curt-format` as a
   dependency (follow-up cycle; enabled by decision 1).
3. **Extensions registry** — frozen core + named optional extensions; version
   stays 1.
4. **dot_curt is the control plane** — registry, conformance vectors, and
   tracker live here.

## 1. License split

- Relicense dot_curt to MIT: `LICENSE` (BUSL-1.1 → MIT), `package.json`
  `license: "MIT"`, README license section, CHANGELOG entry noting the change
  and that prior versions shipped BUSL-1.1.
- Apps unchanged (BUSL-1.1). "Open format" claims in SPEC.md and
  curtis-ai-tech (`src/pages/curt.astro`, `licenses.astro`) become accurate —
  site copy sync is part of rollout, not this cycle.
- Rationale: the standard must be usable without permission or it isn't open;
  the moat stays in the apps. MIT spec text + schema + fixtures are
  self-sufficient (no BUSL code imports).

## 2. SPEC structure — frozen core + extensions registry

- **Core (frozen):** today's v1 rules verbatim — magic, `version: 1`, strict
  whole-file rejection, single leading UTF-8 BOM tolerance, unknown-field
  preservation, epoch-ms timestamps, untrusted-input notes.
- **Extensions:** optional top-level `extensions: [string, …]` array. Old v1
  readers treat it as an unknown field — declaration costs nothing and breaks
  nobody. Writers declare what they emit; readers that recognize a name may
  use it, otherwise ignore.
- **Registry:** `EXTENSIONS.md` in dot_curt — one entry per extension:
  `name`, status (`draft`/`stable`/`deprecated`), purpose, fields it
  defines/reads, which consumers emit/accept it, conformance vectors.
  Seed entries from what the ecosystem already round-trips informally:
  - `images-inline` — base64/data-URI payloads inside `content` (documented
    today; formalize as-is)
  - `usage-metadata` — cost/tokens/provider fields (curtis-web writes,
    tests assert)
  - `tool-linkage` — tool-call linkage fields
  - `agent-context` — swarm role/leaderId, agentId, skillIds (porter +
    curtis-cloud round-trip tests)
- **Versioning policy codified:** breaking changes → version 2, never a
  silent redefinition; additions → a new extension entry, `version` stays 1.

## 3. Conformance levels

| Level | Name | Requirement | Status |
|---|---|---|---|
| L1 | CORE | Parse/serialize v1 strict; BOM tolerance; unknown-field round-trip | MUST for "conforming implementation" |
| L2 | NAMED | `curtFilename` per the documented algorithm | SHOULD (promoted from "convention") |
| L3 | BULK | zip-of-`.curt` convention; readers must not depend on names | MAY |
| L4+ | per extension | that extension's vectors | MAY |

- `conformance/` directory: test vectors (JSON fixtures) + a per-level
  checklist doc. Passing the vectors = achieving the level; claims are
  recorded per consumer in `capabilities.json`.
- Porter's existing 17-test contract suite is the template; it generalizes
  here and later re-points at these vectors (rollout cycle).

## 4. Control plane

- `capabilities.json` (schemaVersion 1) extended with per-consumer:
  `conformanceLevel`, `extensions` (emitted/accepted), `specRevision`,
  `lastAudited`. It is the registry SSOT; `CAPABILITIES.md` renders it.
- Change process: spec, registry, and vector changes land as ordinary
  dot_curt commits (single maintainer, no committee). Each consumer release
  re-audits its row. SPEC/EXTENSIONS/CAPABILITIES/CHANGELOG move in lockstep.

## Non-goals (this cycle)

- Making consumers depend on `curt-format` (follow-up rollout, per repo)
- Fixing BOM/`curtFilename` gaps in the five copies (solved by adoption)
- Re-pointing porter's vendored oracle to dot_curt (rollout)
- curtis-ai-tech copy sync (rollout)
- Version 2 planning

## Success criteria

- dot_curt ships MIT with unchanged runtime behavior (tests green).
- SPEC.md has a normative core + extensions section; `extensions` array is
  spec'd and schema'd (draft-07 schema updated; old files without it still
  validate).
- `EXTENSIONS.md` exists with the four seed entries.
- `conformance/` vectors exist for L1/L2/L3 and each seed extension; the
  reference implementation passes all of them in CI.
- `capabilities.json` carries conformanceLevel/extensions per consumer.
