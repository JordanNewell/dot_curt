# dot_curt — the .curt conversation format

`.curt` is an open, single-file format for AI chat conversations: one file,
one conversation, full fidelity (images and tool calls ride verbatim). Born in
[Curtis AI Chat](https://github.com/JordanNewell/curtis-ai-chat), specified
here so any app can read and write it.

- [SPEC.md](SPEC.md) — the normative spec
- [src/index.ts](src/index.ts) — reference implementation (TypeScript, zero dependencies, BUSL-1.1)
- [schema/curt-v1.schema.json](schema/curt-v1.schema.json) — non-normative JSON Schema for tooling
- [tests/fixtures/](tests/fixtures/) — round-trip test vectors

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

- [Curtis AI Chat](https://github.com/JordanNewell/curtis-ai-chat) — origin, read + write

PRs welcome for bindings in other languages; keep `src/index.ts` and SPEC.md
in lockstep.
