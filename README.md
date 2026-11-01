# dot_curt — the .curt conversation format

`.curt` is an open, single-file format for AI chat conversations: one file,
one conversation, full fidelity (images and tool calls ride verbatim). Born
in [Curtis AI Chat](https://github.com/JordanNewell/curtis-ai-chat),
specified here so any app can read and write it.

## Names, disambiguated

One format, four names. The map:

| Name | What it is |
|---|---|
| `.curt` | The file extension — and the format's public name. |
| `dot_curt` | This repo: the normative spec, reference implementation, schema, conformance vectors. |
| `curt-format` | The npm package that ships the reference implementation. |
| `"curtis-conversation"` | The literal magic string inside every `.curt` file. A v1-compatibility legacy of the Curtis origin — it cannot change without breaking every existing file, so it stays. |

The format and the Curtis applications are separate works with separate
licenses — see [License](#license). Nothing in the spec requires or favors
Curtis.

## Where things live

- [SPEC.md](SPEC.md) — the normative spec
- [src/index.ts](src/index.ts) — reference implementation (TypeScript, zero dependencies, MIT)
- [schema/curt-v1.schema.json](schema/curt-v1.schema.json) — non-normative JSON Schema for tooling
- [tests/fixtures/](tests/fixtures/) — round-trip test vectors
- [EXTENSIONS.md](EXTENSIONS.md) — the named-extension registry
- [CAPABILITIES.md](CAPABILITIES.md) — ecosystem audit: who reads/writes, what passes
- [conformance/](conformance/) — executable conformance vectors (L1–L4)

Spec site: [dotcurt.org](https://dotcurt.org/), served by Cloudflare Pages
(`dotcurt-site` project). Pushes deploy via
[`.github/workflows/deploy-site.yml`](.github/workflows/deploy-site.yml):
main → production, other branches → previews; or run
`wrangler pages deploy site --project-name=dotcurt-site` by hand.

## Install

```sh
npm install curt-format
```

## Use

```ts
import { serializeCurt, parseCurt } from 'curt-format';

const body = serializeCurt(conversation, 'my-app@1.0.0');
const back = parseCurt(body); // CurtConversation | null — null means invalid
```

Beyond the parse/serialize pair: `isCurtMessage` and `isCurtConversation` are
the spec's validation predicates as type guards, `curtFilename(conversation)`
builds the recommended `"<date> <slug> <suffix>.curt"` name from the
immutable fields, and `CURT_MAGIC`/`CURT_VERSION` expose the envelope
constants. Parsing tolerates a single leading UTF-8 BOM and preserves unknown
fields verbatim.

For non-TypeScript validators, the JSON Schema ships with the package:

```
curt-format/schema/curt-v1.schema.json
```

## Implementations

| Implementation | Role | Read/Write |
|---|---|---|
| [curtis](https://github.com/JordanNewell/curtis) (Obsidian plugin) | import / export / backup | R + W |
| [curt-openwith](https://github.com/JordanNewell/curt-openwith) | double-click any `.curt` file — offline viewer (Windows + macOS + Linux) | R |
| [curtis-ai-porter](https://github.com/JordanNewell/curtis-ai-porter) | converter + verify oracle | R + W |
| [curtis-web](https://github.com/JordanNewell/curtis-web) (private) | export endpoint | W |
| curtis-cloud (`@curtisai/shared`) | shared library | R + W |
| curtis-ai-tech | embedded converter + docs | R + W |
| [tractum](https://github.com/JordanNewell/tractum) | Python SDK — signed consensus receipts | R + W |
| [curt-vcon](https://github.com/JordanNewell/curt-vcon) | .curt ⇄ vCon bridge | R + W |
| [curt-convert](https://github.com/JordanNewell/curt-convert) | Claude Code JSONL → .curt | W |
| curt-openwebui (local, unpublished) | Open WebUI exporter | W |

Per-consumer detail — dependency style, spec revision, conformance drift —
lives in [CAPABILITIES.md](CAPABILITIES.md) (full sweep 2026-10-14; addendum
2026-11-01). The newest three are also the first to depend on the
`curt-format` package instead of vendoring the rules.

PRs welcome for bindings in other languages; keep `src/index.ts` and SPEC.md
in lockstep.

## Conformance

Implementations are graded against executable vectors in
[conformance/](conformance/) — L1 CORE (must), L2 NAMED, L3 BULK, L4
per-extension. Claims are self-reported but must be reproducible from the
vectors. The reference implementation passes L1–L4 in CI (27 vectors).

## License

MIT — see [LICENSE](LICENSE). The spec, reference implementation, schema, and
fixtures are free to use, fork, and build on. The Curtis *applications*
(plugin, Porter, web, cloud) are separate works under BUSL-1.1; this standard
is not.
