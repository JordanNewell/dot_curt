# .curt ecosystem — capability tracker

Who reads/writes `.curt` across the Curtis ecosystem, which spec revision each
implements, and where conformance has drifted. Machine-readable twin:
[`capabilities.json`](capabilities.json) — re-audit by updating both, bump
`lastAudited`.

**Audited: 2026-10-14 · Format version: 1 · Spec revision: `curt-format@1.2.0`**

Entries dated 2026-11-01 (`curt-vcon`, `curt-convert`, `curt-openwebui`) were
added without a full re-audit — their per-entry `evidenceDate` is when their
evidence was last checked; `lastAudited` still refers to the 2026-10-14
sweep. All three are same-author (JordanNewell) local builds, unpublished.

Two version axes (per SPEC.md "Versioning"):

- **Format version** — the `version` field in the file. `1` everywhere today;
  bumps are breaking, rare, and never redefine `1`.
- **Spec revision** — additive clarifications within a version, tracked as
  `curt-format` package minors (1.0.0 → 1.1.0 added BOM tolerance, the
  `curtFilename` algorithm, type guards, JSON schema). Consumers are
  conforming to a *revision*, not just the version number.

## In / out

**In (9):** `curtis` (Obsidian plugin) · `curtis-ai-chat-porter` ·
`curtis-web` · `curtis-cloud` (`@curtisai/shared`) · `curtis-ai-tech`
(inline Porter app) · `tractum` (Python SDK) · `curt-vcon` (unpublished) ·
`curt-convert` (unpublished) · `curt-openwebui` (unpublished).

**Out (8, no `.curt` code):** curtis-compliance, curtis-console, curtis-os,
curtis-ai-chat-zed, curtis-ai-symphony, curtis-ai-crm, curtis-ai-browser,
curtis-ai-theme.

## Matrix

| Consumer | Role | R/W | Dependency | Gen stamp | BOM (1.1.0) | Strict reject | Unknown fields RT | `curtFilename` | Schema | Conformance |
|---|---|---|---|---|---|---|---|---|---|---|
| **dot_curt** (`curt-format@1.2.0`) | normative spec + reference impl | R/W | — | n/a | ✅ | ✅ | ✅ | ✅ | ✅ | ref=L1–L4 ✅ |
| **curtis** plugin (`curtis@1.0.0`) | import/export/backup | R/W | vendored copy | `curtis@v` | ❌ | ✅ (per file) | ⚠️ partial | ⚠️ divergent (`<id-6>`) | ❌ | ❌ (see notes) |
| **curtis-ai-chat-porter** (`curtis-ai-porter@1.0.0`) | converter + verify oracle | R/W | vendored oracle (curtis-ai-chat v2.0.1) | `curtis-ai-porter@v` | ⚠️ incidental | ✅ (per file) | ✅ (top-level dropped) | ⚠️ divergent | ❌ (17-test suite) | ❌ (see notes) |
| **curtis-web** (private, `curtis-web@0.1.0`) | export endpoint | W only | hand-rolled | `curtis-web@0.1.0` | n/a | n/a | ✅ on write | ❌ divergent (title-only) | ❌ | ❌ (writer only — see notes) |
| **curtis-cloud** (`@curtisai/shared@0.1.2`) | shared lib (no in-repo callers) | R/W | vendored mirror | `curtis@v` | ❌ | ✅ (shallow) | ⚠️ partial | ❌ absent | ❌ | ❌ (see notes) |
| **curtis-ai-tech** (`porter-app.html`) | embedded web app + docs | R/W | inline copy | `curtis-ai-chat-porter@v` | ⚠️ incidental | ✅ | ✅ | ⚠️ divergent | ❌ | ❌ (see notes) |
| **tractum** (`tractum@0.5.0`) | Python SDK — signed consensus receipts | R/W | native (own validator) | `tractum@v` | ✅ (rejects) | ✅ | ✅ | n/a (emits dicts) | ❌ | ⚠️ vectors not run — audit pending |
| **curt-vcon** (`curt-vcon@0.1.0`, unpublished) | .curt ⇄ vCon bridge | R/W | **npm `curt-format`** | `curt-vcon@0.1.0` | ✅ (via ref) | ✅ (via ref) | n/a (bridge) | ❌ (stdout CLI) | ❌ | ⚠️ vectors not run; 18 tests 2026-11-01 |
| **curt-convert** (`curt-convert@0.1.0`, unpublished) | Claude Code JSONL → .curt | W only | **npm `curt-format`** | `curt-convert@0.1.0` | n/a | ✅ (self-check via ref) | ⚠️ writer extras | ✅ (`curtFilename`, bulk collision-safe since 4719816) | ❌ | ⚠️ vectors not run; 30 tests + 1169→1169 corpus self-check (post collision fix) 2026-11-01 |
| **curt-openwebui** (`curt-openwebui-export@1.0.0` + Python pipeline, unpublished) | Open WebUI exporter (TS CLI + draft pipelines filter) | W only | **npm `curt-format`** (TS) / hand-rolled (Python) | both stamped | ✅ TS (via ref) / n/a Py | ✅ TS (self-check) / ⚠️ Py (conv dict only) | ⚠️ writer extras | ✅ both (spec algorithm) | ❌ | ⚠️ vectors not run; TS 15 tests + Py 8 tests + parseCurt cross-check 2026-11-01; pipeline not live-smoked |

## Findings (2026-10-14)

Conformance claims live per consumer in `capabilities.json`
(`conformanceLevel` / `extensions`); the bar they are measured against is
[`conformance/README.md`](conformance/README.md).

1. **Nobody depends on `curt-format`.** All five consumers vendored or
   hand-rolled the rules. The npm package is currently documentation, not
   infrastructure. Any spec revision therefore lands in ≤5 places by hand.
2. **The 1.1.0 BOM rule is unimplemented outside the reference.** A
   BOM-prefixed file (the spec's own tolerance case) is rejected by the
   plugin, curtis-cloud, and — via `parseCurt` itself — porter and the
   porter-app (they only survive it incidentally through `TextDecoder`).
3. **Three different filename sanitizers, none the spec's `curtFilename`.**
   Plugin: `<date> <slug> <id-6>.curt` (spec says last-8 or post-`_` suffix).
   Porter + porter-app: 100-char capped title. curtis-web: title-only, no
   date, no id. Files are findable but not interchangeably named.
4. **Top-level envelope extras don't round-trip** in plugin, porter, and
   curtis-cloud parsers (spec: "preserve where possible"). Conversation-level
   extras survive everywhere.
5. **Version lineage is broken by the rename.** Porter's conformance oracle
   pins `curtis-ai-chat v2.0.1 (1c7a19f)`, but that repo now self-identifies
   as `curtis@1.0.0`. A consumer audit can't map oracle → product version.
6. **The plugin has zero direct `parseCurt` unit tests** — coverage rides on
   backup-format tests. curtis-web (14 tests) and porter (27+ titles,
   conformance suite) are the strong ones.

### Addendum (2026-11-01)

Three same-author consumers were added; per-entry detail (including round-trip
losses) lives in `capabilities.json`.

1. **First npm-dependency consumers.** `curt-vcon`, `curt-convert`, and
   `curt-openwebui` (TS side) depend on `curt-format@1.2.0` instead of
   vendoring — finding 1 above now applies only to the five original
   consumers. `curt-convert` and `curt-openwebui` are also the first writers
   to use the spec's `curtFilename` algorithm (finding 3 narrows the same
   way).
2. **All three are same-author (JordanNewell) and unpublished** — local
   repos, no GitHub remotes, no npm packages. Same-author emissions do not
   promote draft extensions: `curt-convert` emitting `tool-linkage` keeps it
   at draft (stable requires two *independent* implementations).
3. **`curt-convert` bulk output is not collision-safe:** transcripts sharing
   a `sessionId` (parent + sidechain subagent files) produce identical
   `curtFilename` names and silently overwrite — 2026-11-01 corpus run:
   1168 inputs → 878 distinct filenames (0 self-check failures).
   **Fixed 2026-11-01** (curt-convert commit `4719816`): bulk runs now keep
   the plain `curtFilename` name for the first occurrence and give later
   colliding inputs a deterministic `-<6 hex>` suffix (SHA-256 of the source
   file's absolute path) — no timestamps or randomness, stable across runs;
   single-file and `--stdout` modes unchanged. Post-fix corpus revalidation:
   1169 inputs → 1169 distinct outputs, 0 self-check failures, 294
   hash-suffixed names, identical file lists across two runs. Suite grew
   25 → 30 tests, all green.
4. **`curt-openwebui`'s Python pipeline is draft** — never live-smoked in a
   real Open WebUI pipelines runtime; its validator is shallower than
   `parseCurt` (conversation dict only, envelope never checked). A
   pipeline-written body does parse valid in the reference parser
   (cross-checked 2026-11-01).

## Conformance ladder

Ranked by what a fix is worth as the ecosystem grows:

1. **Adopt `curt-format` as a dependency** in plugin / porter / curtis-web /
   `@curtisai/shared` — collapses findings 1–3 to one implementation.
2. Until then: port the 1.1.0 BOM rule + `curtFilename` into each copy
   (smallest diffs, biggest interop win).
3. Restore version lineage: porter oracle should pin the canonical repo URL +
   commit, not the retired `curtis-ai-chat` name.
4. Add direct `parseCurt` edge-case tests to the plugin.

## Re-audit method

Grep each repo for `curtis-conversation|.curt` (exclude `node_modules`,
`dist`), then check: magic/version constants, BOM handling, whole-file
rejection, unknown-field preservation, generator stamp, filename helper,
schema usage. Update `capabilities.json` (this file follows from it) and bump
`lastAudited`. Out-of-ecosystem repos need one grep to confirm still-out.
