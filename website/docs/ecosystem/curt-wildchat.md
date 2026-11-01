---
id: curt-wildchat
title: "curt-wildchat"
description: "Convert WildChat-1M records to .curt — npm curt-wildchat; bulk demos and the L3 conformance artifact."
---

# `curt-wildchat`

Convert WildChat conversation records (HuggingFace
[`allenai/WildChat-1M`](https://huggingface.co/datasets/allenai/WildChat-1M))
into `.curt` single-file conversation files. Sister to
[`curt-convert`](/docs/ecosystem/curt-convert) (Claude Code transcripts →
.curt).

- **Repo:** [github.com/JordanNewell/curt-wildchat](https://github.com/JordanNewell/curt-wildchat)
- **npm:** [`curt-wildchat@1.0.2`](https://www.npmjs.com/package/curt-wildchat) (MIT)
- **Role:** write only (bulk converter + dataset demos)
- **Depends on:** [`curt-format`](https://www.npmjs.com/package/curt-format)
  — every output is re-parsed with `parseCurt` before it is written; a
  file that fails round-trip validation is never written.

**What this is:** a bridge, not an endorsement. WildChat is research data
— real user conversations with ChatGPT, collected in the wild. The
converter moves records into a file format; it makes no claim that
WildChat content is representative, safe, or suitable for any particular
use. Screen anything you plan to show anyone.

## Install

```sh
npm install -g curt-wildchat   # or: npx curt-wildchat
```

## CLI

```sh
curt-wildchat wildchat.jsonl -o ./out
curt-wildchat wildchat.jsonl --sample 5
curt-wildchat wildchat.jsonl --language English
curt-wildchat wildchat.jsonl --stdout > one.curt
```

Input is JSONL, one WildChat record per line (HF exports parquet; the
datasets-server rows API or a parquet→JSONL export both work). Output
names follow the bulk convention via `curtFilename()`.

## Mapping highlights

- WildChat's id field is `conversation_hash` (verified against the
  datasets-server schema — it is not `conversation_id`).
- No titles exist in WildChat: the title is the first user text, single
  line, capped at 60 chars.
- `user`/`assistant`/`system` roles map 1:1; other roles dropped and
  counted. `provider` is always `"openai"` (WildChat-1M is ChatGPT
  conversations).
- Moderation payloads (`openai_moderation`, `detoxify_moderation`),
  `toxic`/`redacted` flags, language, and coarse location ride as extra
  fields — verbatim. That last part cuts both ways: `hashed_ip` and
  header data land in the output too, so treat output as
  record-equivalent and scrub before sharing.

## Bulk conformance artifact

:::info[Bulk evidence — 1000 real records, zero failures]

The repo publishes **<a href="/conformance-1k/CONFORMANCE-1K.md">CONFORMANCE-1K</a>**,
an **L3 BULK** artifact proving the format scales on a real corpus: the
first 1000 rows of WildChat-1M shard 0 converted with zero failures —
995 distinct `.curt` files written, all 995 re-parsed cleanly under an
independent `parseCurt` pass, envelope overhead **1.126×** over the source
JSONL. The 5-file shortfall is the artifact's honest finding: duplicate
`conversation_hash` rows in the source collide on the identity-keyed
filename. The sample stays local; only aggregate statistics are published
— no conversation content leaves the machine.

:::

## License and attribution

The converter is MIT and ships no WildChat content (fixtures are fully
synthetic). WildChat-1M data is ODC-BY; if you publicly convey converted
WildChat content, carry the ODC-BY §4.3 attribution notice — exact wording
and the verified license record are in
[ACCESS-AND-LICENSE.md](https://github.com/JordanNewell/curt-wildchat/blob/main/ACCESS-AND-LICENSE.md).

## Where to go deeper

Full mapping table, documented losses, the staged demos under `demos/`
(hand-picked benign records with identity metadata scrubbed), and
<a href="/conformance-1k/CONFORMANCE-1K.md"><code>CONFORMANCE-1K.md</code></a>:
[github.com/JordanNewell/curt-wildchat](https://github.com/JordanNewell/curt-wildchat).
