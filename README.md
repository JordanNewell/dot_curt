# dot_curt — the .curt conversation format

`.curt` is an open, single-file format for AI chat conversations: one file,
one conversation, full fidelity (images and tool calls ride verbatim). Born in
[Curtis AI Chat](https://github.com/JordanNewell/curtis-ai-chat), specified
here so any app can read and write it.

- [SPEC.md](SPEC.md) — the normative spec
- [src/index.ts](src/index.ts) — reference implementation (TypeScript, zero dependencies, BUSL-1.1)
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

## Implementations

- [Curtis AI Chat](https://github.com/JordanNewell/curtis-ai-chat) — origin, read + write

PRs welcome for bindings in other languages; keep `src/index.ts` and SPEC.md
in lockstep.
