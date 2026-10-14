# .curt academic writeup — scope

**Date:** 2026-10-14 · **Status:** draft scope, awaiting Jordan approval
**Basis:** 3-way adversarial scrub (repo / vCon draft-04 / PAM v1.0) — all claims below are scrub-verified.

## Thesis

AI conversation data is trapped in undocumented, platform-internal vendor
exports. GDPR Article 20 grants a right to portability that empirically fails
without actual interoperable formats (Syrmoudis, PoPETs 2021). No open
standard exists for single-file, conversations-first, LLM-native chat archives
with executable conformance testing. We present .curt: a frozen-core JSON
envelope with an extension registry and tiered conformance vectors, MIT-
licensed, published as `curt-format` on npm.

## Corrected positioning rules (from the scrub — non-negotiable in the text)

- Say **conversations-first, LLM-native, conformance-tested**. Do NOT say
  "human-owned" or "vendor-neutral" (neither phrase is in the repo).
- Unknown-field preservation is **"where possible"** (SPEC.md:69); the
  reference implementation drops envelope-top-level extras. Never write
  "preservation as a normative requirement."
- Tool calls are the **draft `tool-linkage` extension**; only the `tool`
  role is core. Model metadata: message-level `model` is core; cost/tokens/
  provider are the `usage-metadata` extension.
- vCon: its charter explicitly scopes chat logs and text dialogs are
  first-class — so the claim is "no LLM-native semantics (roles, tool calls,
  model metadata) and a human/real-time community", NOT "vCon can't do chat".
  Cite draft-ietf-vcon-vcon-core-04; field is `vcon` (deprecated in favor of
  the extension mechanism — which validates .curt's frozen-core+registry bet).
- PAM (portable-ai-memory.org): maintainer IS named (Daniel Gines); it has
  semver policy + governance pages (single-maintainer-minimal, like .curt).
  Grant its technical lead explicitly: Ed25519 signatures, W3C DIDs, RFC 8785
  canonicalization, shipped OpenAI/Anthropic/xAI importers. Its gap: memory-
  first (conversations are an index + companion files), no conformance levels.
- Governance honesty: single maintainer, BDFL ("ordinary dot_curt commits,
  no committee" — design doc). Conformance is self-reported; today only the
  reference implementation passes L1. Precedents that won the same way: JSON
  (Crockford → RFC 8259), RSS 2.0 (Winer); cautionary: Markdown → CommonMark
  fork (donate to a foundation early).
- MIT is version-scoped: BUSL-1.1 through 1.1.0, MIT as of 1.2.0 (2026-10-14).
  The Curtis applications remain BUSL.

## Structure (target: 8–10 pp. or ~4.5k words)

1. **Introduction** — the export trap: OpenAI tree-mapping `conversations.json`,
   Claude parent-UUID chaining, Gemini Takeout activity logs; every bridge tool
   reimplements parsing from observations.
2. **The right that needs formats** — GDPR Art. 20 + Recital 68 ("interoperable
   formats"); De Hert et al. 2018 (CLSR); Syrmoudis 2021 (PoPETs); OECD 2024.
   The Art.20 × LLM-chat slot is unclaimed in the literature.
3. **Landscape** — vendor exports (platform-internal, no schema/import);
   training formats (ShareGPT, OpenAI/Cohere JSONL — lossy, no metadata);
   agent transport (A2A, MCP — persistence out of scope); formal containers
   (vCon: standards-track, telco-origin, no LLM semantics, no executable
   vectors; mbox RFC 4155 as archival precedent); memory-first (PAM, W3C AI
   Agent Memory CG — chartered Jun 2026, no file format yet).
4. **The .curt design** — envelope + strict v1 whole-file rejection; frozen
   core + named extension registry (aligning with vCon's own
   extensions-replace-versioning direction); L1 CORE / L2 NAMED / L3 BULK /
   L4 per-extension executable vectors (27, run in CI); deterministic naming
   + zip bulk convention.
5. **Governance** — single-maintainer honesty; self-reported conformance;
   promotion path (JSON/RSS precedents; CommonMark lesson).
6. **Limitations** — no crypto/signing layer vs PAM; preservation where
   possible; content semantics out of scope (the container-not-content pattern
   of mbox/HAR/vCon).
7. **Conclusion + artifact** — MIT, npm `curt-format@1.2.0`, vectors, registry.

## Citation library (scrub-verified URLs)

- De Hert, Paul; Gutwirth, Serge; Moscibroda, Antonio; et al. (2018), "The
  right to data portability in the GDPR", CLSR — sciencedirect.com/science/article/pii/S0267364917303333
- Syrmoudis, Kosmas (2021), PoPETs 2021(5) — petsymposium.org/popets/2021/popets-2021-0051.pdf
- OECD (2024), data portability report — oecd.org
- GDPR Art. 20 / Recital 68 — gdpr-info.eu
- draft-ietf-vcon-vcon-core-04 (Sep 2026) + WG charter — datatracker.ietf.org
- PAM v1.0 — portable-ai-memory.org; github.com/portable-ai-memory
- W3C AI Agent Memory Interop CG charter (Jun 2026) — w3.org/community/ai-agent-memory-interop
- RFC 4155 (mbox), RFC 8259 (JSON), RFC 8785 (JCS) — rfc-editor.org
- CommonMark fork history — blog.codinghorror.com/standard-markdown-is-now-common-markdown
- A2A spec, MCP survey arXiv 2505.02279
- LangChain serialization advisory GHSA-c67j-w6g6-q2cm (untrusted-archive caution)

## Venue options

| Option | Speed | Weight | Notes |
|---|---|---|---|
| **arXiv preprint (cs.CY)** | days | citable DOI, no gate | recommended first move; establish priority |
| IETF Internet-Draft (individual) | weeks | standards-track presence | SPEC.md → ID is near-mechanical; sits next to vCon |
| Journal (CLSR) | months | heaviest academic | where De Hert 2018 lives; do later if at all |

Recommendation: arXiv preprint first (priority + citability), optionally the
I-D in parallel. Author: Jordan Newell (sole).

## Effort

1–2 agent sessions: draft + cite-check + scrub-consistency pass + polish.
Draft target: this week.
