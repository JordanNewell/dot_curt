# .curt paper — literature sweep & claim cross-analysis

**Date:** 2026-10-25 · **Status:** complete — all findings folded into the paper draft
**Method:** ResearchRabbit-style citation-network discovery. Seeds = the paper's own
scrub-verified library (Syrmoudis 2021, De Hert et al. 2018, MCP survey); walked
forward citations, author networks, and slot-probe searches (Semantic Scholar API,
web discovery). Every claim below is checked against what was actually found, in
the house style: claims survive on evidence or they change.

---

## Verdicts at a glance

| # | Claim in the paper | Verdict | Action |
|---|---|---|---|
| 1 | "The Article 20 × LLM-chat slot is unclaimed in the literature" | **HOLDS — sharpened** | Slot re-precised; 3 nearest-neighbor works now cited [13][14][15] |
| 2 | "No open standard exists for single-file, conversations-first, LLM-native chat archives with executable conformance" | **HOLDS — with a named near-miss** | DTI AI Conversation Schema added as §3.6 peer [16]; claim re-anchored on LLM-native semantics + conformance |
| 3 | Landscape: training formats lossy; transports don't persist; vCon has no LLM semantics; PAM memory-first | **HOLDS** | No changes; vCon's voice-AI production direction (Jun 2026) reinforces it |
| 4 | Use case (export trap): undocumented, unstable vendor exports; bridge tools reimplement parsing | **STRENGTHENED** | §1 now carries concrete market evidence [17][18] |

---

## Claim 1 — the Article 20 × LLM-chat slot

**Found (2025–2026, all post-dating the original scrub's legal frame):**

1. **Feretzakis et al. 2025**, "GDPR and Large Language Models: Technical and
   Legal Obstacles," *Future Internet* 17(4):151, DOI 10.3390/fi17040151,
   ~72 citations — the heaviest traffic in the slot. Full text read.
   **What it actually does:** compliance-obstacles survey of Articles 15/16/17/22
   *inside model weights* (unlearning, XAI, differential privacy, federated
   learning, AI Act). Article 20 appears exactly once — a one-line definition in
   the rights overview (§1.1) — and is never analyzed. Conversation archives,
   export formats, interoperability: absent. **Verdict: nearest neighbor, not an
   occupant.** Cite as [13]; the paper's slot claim now names it and states the
   difference.
2. **Matsumi 2026**, "Generating Personal Data and the GDPR," *Canadian Journal
   of Law and Technology* 23(2). Conceptual analysis of AI-generated personal
   data, incl. Article 20 and the Art. 29 WP interpretations. Legal theory; no
   format problem, no archive data class. **Cite as [14].**
3. **Beduschi 2026**, "Data protection in the era of agentic artificial
   intelligence," *Computer Law & Security Review* 61:106342, DOI
   10.1016/j.clsr.2026.106342 — note, **same journal as De Hert 2018**. Extends
   the portability discussion via the EU Data Act for agentic AI. Agent-side,
   not archive-side. **Cite as [15].**

**New slot claim (in paper §2):** the legal literature reached generative AI in
2025–26 along three strands — LLM compliance (model internals), generated-data
ontology, and agentic portability via the Data Act — and the nearest of them
defines Article 20 without analyzing it. None treats the conversation archive as
a portability problem requiring an interoperable file format. The slot survives,
sharpened and citable.

## Claim 2 — "no open standard"

**Found:** the **Data Transfer Initiative's "AI Conversation History" schema**
(schemas.pub/schemas/24; registered Nov 13 2025, rev. May 14 2026; source:
github.com/dtinit/schema-refs, dti/ai-conversation.md). The original scrub
missed it; this sweep caught it. Full details read.

**What it is:** a JSON conversation export schema — `details` (createdBy,
createdAt, startTime, endTime, modality), `identifiers[]` (named participant
identities), `messages[]` (`sentAt`, `sender`, `text`, `channel`), with the rule
that senders must appear in `identifiers` (except a lone "AI"). One listed
implementation (Inflection). DTI frames it exactly as we do: "Your conversations
with your AI tools and services are your personal data."

**What it is not:** no role vocabulary (user/assistant/system/tool), no tool
calls, no model metadata, no attachments story, no version number, no stated
license on the registry page, no validation semantics, no conformance vectors,
no tooling, single listed implementation. It is a registry entry — a transcript
schema aimed at identity/portability concerns — not a normative spec with
executable conformance.

**Verdict:** the claim as originally written ("no open standard exists") would
now read as out of date. Re-anchored: an open export specification exists,
establishes demand, and stops short of everything .curt contributes — which is
stronger than absence. Now paper §3.6 + §6 note + abstract/intro updates.

## Claim 3 — landscape

- **vCon:** no LLM extension found; production momentum is voice-AI
  (webrtc.ventures, Jun 2026). Reinforces "human/real-time community." No change.
- **PAM:** unchanged (v1.0, memory-first, "vCard for AI memories"). No change.
- **W3C AIMI CG:** still charter-stage; scope is memory cells; an IETF
  memory-protocol draft (draft-saihm-memory-protocol) now references it. No
  file format. No change.
- **Academic technical slot:** probe searches found chat-history *tampering*
  (Wei 2024, security — adjacent, useful color for untrusted-input notes, not
  cited) and memory *summarization* work. **Zero academic proposals of a
  conversation-export format.** A "Portable Agent Memory protocol" arXiv paper
  (Ravindran, 2026) surfaced — **not cited in the paper: ID unverified. Verify
  before adding if wanted.**

## Claim 4 — use case, strengthened

Market evidence gathered (now paper refs [17][18]):

- ChatGPT export = ZIP of raw HTML + JSON, documented "difficult to work with"
  (dev.to walkthrough; Baruch College libguide documents both ChatGPT ZIP and
  Claude single-JSON exports — an institutional archive guide is strong
  third-party evidence).
- No vendor imports another's export. The quotable failure: "You can save
  ChatGPT conversation as PDF all day. But you can't load that PDF into Claude
  and have it understand your history."
- Bridge-tool micro-industry confirmed: AI Exporter (Chrome extension, 16+ AI
  sites → PDF/Word/Markdown), ai-chat-md-export (offline CLI, ChatGPT/Claude →
  Markdown), round-up guides ("5 ways to export AI conversations"). Every one
  reimplements parsing from observations; none has a target schema with
  validation — the exact gap §1 describes.

---

## New citations added to the paper

[13] Feretzakis et al. 2025 — mdpi.com/1999-5903/17/4/151 (DOI 10.3390/fi17040151)
[14] Matsumi 2026 — digitalcommons.schulichlaw.dal.ca/cjlt/vol23/iss2/5
[15] Beduschi 2026 — doi.org/10.1016/j.clsr.2026.106342
[16] DTI AI Conversation History — schemas.pub/schemas/24 · dtinit.org/open · github.com/dtinit/schema-refs
[17] Baruch College Library, archiving AI chat transcripts — guides.newman.baruch.cuny.edu/c.php?g=1527743&p=11443010
[18] Bridge-tool ecosystem — AI Exporter (Chrome Web Store) · ai-chat-md-export (GitHub) · backrun.co round-up

## Follow-ups (before arXiv)

- ~~Verify the Ravindran 2026 arXiv ID~~ — **done 2026-10-25**: verified as
  arXiv:2605.11032 (S. K. Ravindran, Microsoft, May 2026, DOI
  10.48550/arXiv.2605.11032, ~11 citations). Cited as paper ref [19] in §3.5.
- S2 API remained rate-limited on retry (shared-IP throttling, not our burst);
  forward-citation walks of Syrmoudis/Feretzakis stay search-approximated. A
  keyed S2/API pass before camera-ready would close that gap. Slot-probe
  coverage via search was thorough, so risk is low.
- Optional: DTI outreach — a peer schema + a conformance-tested format make a
  natural complement; DTI's policy channels would amplify the arXiv launch.
