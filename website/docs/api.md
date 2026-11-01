---
id: api
slug: api
title: "curt-format API"
description: "The reference implementation's exports: parseCurt, serializeCurt, curtFilename, isCurtMessage, isCurtConversation, CURT_MAGIC, CURT_VERSION."
---

# `curt-format` API

The reference implementation ships as the zero-dependency npm package
[`curt-format`](https://www.npmjs.com/package/curt-format) (TypeScript,
MIT). Current release: **1.2.0** — the first npm release (1.0.0 and 1.1.0
were tagged in-repo but never published).

```sh
npm install curt-format
```

## Constants

```ts
export const CURT_MAGIC = 'curtis-conversation';
export const CURT_VERSION = 1;
```

## Types

```ts
export interface CurtMessage {
	id: string;
	role: 'user' | 'assistant' | 'system' | 'tool';
	content: string;
	/** Epoch milliseconds. */
	timestamp: number;
	/** Provider model id, recorded on assistant messages when known. */
	model?: string;
	/** Implementations may attach extra fields; readers ignore unknowns. */
	[key: string]: unknown;
}

export interface CurtConversation {
	id: string;
	title: string;
	/** Epoch milliseconds. */
	createdAt: number;
	/** Epoch milliseconds. */
	updatedAt: number;
	messages: CurtMessage[];
	[key: string]: unknown;
}
```

## `parseCurt`

```ts
export function parseCurt(raw: string): CurtConversation | null;
```

Parse a `.curt` body. Returns `null` when the magic field, version, or
conversation shape fails validation — a corrupted file is reported, never
half-parsed (whole-file rejection, SPEC "Validation rules"). A single
leading UTF-8 BOM is ignored. Unknown fields on the conversation and its
messages are preserved for round-tripping; unknown top-level envelope
fields are rebuilt on serialization and therefore not preserved
(preservation is best-effort, never normative).

```ts
import { parseCurt } from 'curt-format';

const conversation = parseCurt(fileText);
if (conversation === null) {
	// invalid: reject whole-file
}
```

## `serializeCurt`

```ts
export function serializeCurt(
	conversation: CurtConversation,
	generator?: string,
	extensions?: string[],
): string;
```

Serialize a conversation as a `.curt` file body (tab-indented JSON,
version-1 envelope). `generator` is provenance in `"writer-name@version"`
form; readers ignore it. `extensions` declares registry names (see the
[extension registry](/docs/extensions)).

```ts
import { serializeCurt } from 'curt-format';

const body = serializeCurt(conversation, 'my-app@1.0.0', ['images-inline']);
```

## `isCurtMessage` / `isCurtConversation`

```ts
export function isCurtMessage(v: unknown): v is CurtMessage;
export function isCurtConversation(v: unknown): v is CurtConversation;
```

The spec's validation predicates as type guards. `isCurtConversation` is
the exact predicate `parseCurt` applies to the `conversation` field;
`isCurtMessage` is the per-message rule ("Each message in `messages`").
Exported so third-party validators share the canonical behavior instead of
re-deriving it.

## `curtFilename`

```ts
export function curtFilename(conversation: CurtConversation): string;
```

The recommended file name, `"<YYYY-MM-DD> <slug> <suffix>.curt"`. It
derives only from the immutable fields `createdAt` and `id`, so the name
survives title edits and later updates. `<date>` is `createdAt` as a UTC
date (`1970-01-01` when not a finite timestamp); `<slug>` is the lowercased
title joined on `-`, capped at 50 characters (`untitled` when nothing
remains); `<suffix>` is the part of `id` after the last `_`, else the last
8 characters of `id`.

```ts
import { curtFilename } from 'curt-format';

curtFilename(conversation); // "2025-10-09 fixture-conversation 001.curt"
```

## JSON Schema

For non-TypeScript validators, a non-normative draft-07 schema ships in the
package — tested to agree with `parseCurt`:

```
curt-format/schema/curt-v1.schema.json
```

See [Schema](/docs/schema) for a validate-your-file snippet.
