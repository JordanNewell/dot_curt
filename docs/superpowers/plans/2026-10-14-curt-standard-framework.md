# .curt Standard Framework Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the framework from `docs/specs/2026-10-14-curt-standard-framework-design.md`: MIT license on dot_curt, `extensions` registry in SPEC + schema + reference impl, `EXTENSIONS.md`, executable `conformance/` vectors (L1–L3 + seed extensions), and conformance fields in `capabilities.json`.

**Architecture:** dot_curt is the standard's control plane. The frozen core stays byte-identical in behavior; extensions are additive metadata (`extensions: string[]` top-level, ignored by readers). Conformance vectors are plain JSON files that the repo's own vitest suite executes — the reference implementation passing them in CI is the conformance proof.

**Tech Stack:** TypeScript (zero deps), vitest, ajv (schema tests only), GitHub Pages site (no build system beyond `npm run build`).

**Repo:** `E:\dev\projects\dot_curt` — work on `main` (single-maintainer repo, matches existing flow). Run tests with `npm test` (vitest), build with `npm run build`.

---

### Task 1: Relicense dot_curt to MIT

**Files:**
- Modify: `LICENSE` (replace entirely)
- Modify: `package.json` (`license` field)
- Modify: `README.md` (License section)
- Modify: `CHANGELOG.md` (Unreleased entry)

- [ ] **Step 1: Replace LICENSE with MIT text**

```
MIT License

Copyright (c) 2025-2026 Jordan Newell

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

- [ ] **Step 2: Update package.json**

Change `"license": "BUSL-1.1"` to `"license": "MIT"`.

- [ ] **Step 3: Update README.md License section**

Replace the entire `## License` section (currently the BUSL paragraph) with:

```markdown
## License

MIT — see [LICENSE](LICENSE). The spec, reference implementation, schema, and
fixtures are free to use, fork, and build on. The Curtis *applications*
(plugin, Porter, web, cloud) are separate works under BUSL-1.1; this standard
is not.
```

- [ ] **Step 4: Add CHANGELOG entry**

Under `## Unreleased`, add as the first bullet:

```markdown
- License: MIT. The spec, reference implementation, schema, and fixtures were
  BUSL-1.1 through 1.1.0; they are now permanently open. Applications remain
  BUSL-1.1 — see the design doc, docs/specs/2026-10-14-curt-standard-framework-design.md.
```

- [ ] **Step 5: Verify nothing else references BUSL in dot_curt**

Run: `grep -ri "BUSL" --include="*.ts" --include="*.json" --include="*.md" . | grep -v node_modules | grep -v CHANGELOG | grep -v docs/`
Expected: no hits (CHANGELOG and the design doc keep the historical mention).

- [ ] **Step 6: Commit**

```bash
git add LICENSE package.json README.md CHANGELOG.md
git commit -m "license: MIT — the standard is open, the apps stay BUSL"
```

---

### Task 2: `extensions` array in the reference implementation (TDD)

**Files:**
- Modify: `src/index.ts` (`CurtFile` interface ~line 38, `serializeCurt` ~line 80)
- Test: `tests/curt.test.ts` (append new `describe` block)

The reference reader already accepts unknown fields, so `parseCurt` needs **zero changes** — only writers gain the ability to declare extensions.

- [ ] **Step 1: Write the failing tests**

Append to `tests/curt.test.ts`:

```ts
describe('extensions declaration', () => {
	const conv = { ...base, messages: [] };

	it('serializes a declared extensions array', () => {
		const body = serializeCurt(conv, 'test@1.0.0', ['images-inline', 'usage-metadata']);
		const f = JSON.parse(body);
		expect(f.extensions).toEqual(['images-inline', 'usage-metadata']);
	});

	it('omits extensions when not passed or empty', () => {
		expect('extensions' in JSON.parse(serializeCurt(conv))).toBe(false);
		expect('extensions' in JSON.parse(serializeCurt(conv, 'test@1', []))).toBe(false);
	});

	it('parseCurt accepts extension-bearing files (readers ignore the field)', () => {
		const body = JSON.stringify({
			curt: CURT_MAGIC,
			version: CURT_VERSION,
			extensions: ['images-inline'],
			conversation: conv,
		});
		expect(parseCurt(body)).not.toBeNull();
	});

	it('parseCurt accepts files with malformed extensions — it is an unknown field, never a validation input', () => {
		const bad = (ext: unknown) =>
			JSON.stringify({ curt: CURT_MAGIC, version: CURT_VERSION, extensions: ext, conversation: conv });
		expect(parseCurt(bad('not-an-array'))).not.toBeNull();
		expect(parseCurt(bad([42]))).not.toBeNull();
		expect(parseCurt(bad(null))).not.toBeNull();
	});
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run tests/curt.test.ts -t "extensions declaration"`
Expected: FAIL — `serializeCurt` accepts only 2 arguments (TS error / assertion failure on `f.extensions`).

- [ ] **Step 3: Implement**

In `src/index.ts`, add to the `CurtFile` interface (after `generator?`):

```ts
	/**
	 * Optional declaration of registry extensions the writer emits
	 * (EXTENSIONS.md). Readers must ignore it entirely, whatever its shape —
	 * it is an unknown field, never a validation input.
	 */
	extensions?: string[];
```

Change `serializeCurt` to:

```ts
/** Serialize a conversation as a .curt file body (tab-indented JSON). */
export function serializeCurt(
	conversation: CurtConversation,
	generator?: string,
	extensions?: string[],
): string {
	const file: CurtFile = {
		curt: CURT_MAGIC,
		version: CURT_VERSION,
		conversation,
	};
	if (generator) file.generator = generator;
	if (extensions?.length) file.extensions = [...extensions];
	return JSON.stringify(file, null, '\t');
}
```

- [ ] **Step 4: Run the full suite**

Run: `npm test`
Expected: all PASS (existing round-trip tests unaffected — no extensions emitted by default).

- [ ] **Step 5: Commit**

```bash
git add src/index.ts tests/curt.test.ts
git commit -m "feat: extensions declaration — writers may name registry extensions"
```

---

### Task 3: Schema support + agreement test

**Files:**
- Modify: `schema/curt-v1.schema.json` (add `extensions` property after `generator`)
- Test: `tests/schema.test.ts` (append cases)

**Design note:** `tests/schema.test.ts` opens with the doctrine "everything parseCurt accepts, the schema accepts." Since `parseCurt` must accept malformed `extensions` (unknown field, never a validation input), the schema must stay unconstrained on it too — the property exists in the schema for documentation and editor discoverability only. Writer-side strictness (array of non-empty strings) is normative in SPEC.md, not machine-enforced here.

- [ ] **Step 1: Write the failing test**

Append inside the existing `describe('JSON schema agrees with parseCurt')` in `tests/schema.test.ts` (the file already has `validate`, `base`, `msg` in scope):

```ts
	it('accepts the extensions declaration in every shape readers must tolerate', () => {
		const good = [
			['images-inline'],
			['images-inline', 'usage-metadata'],
			'images-inline', // malformed — parseCurt accepts it, so the schema must too
			null, // malformed
		];
		for (const extensions of good) {
			const body = {
				curt: 'curtis-conversation',
				version: 1,
				extensions,
				conversation: { ...base, messages: [msg] },
			};
			expect(validate(body), JSON.stringify(extensions)).toBe(true);
		}
	});
```

- [ ] **Step 2: Run to verify failure**

Run: `npx vitest run tests/schema.test.ts`
Expected: PASS trivially — the schema has no `extensions` property and `additionalProperties` is unrestricted, so every shape already validates. The test is a guard: it documents the agreement contract and will catch anyone who later tightens the schema against the doctrine. (If you prefer a red-green cycle, temporarily add `"type": "array"` to the schema first, watch this test fail, then revert.)

- [ ] **Step 3: Add the documented property to the schema**

In `schema/curt-v1.schema.json`, inside `properties` (after the `generator` entry):

```json
		"extensions": {
			"description": "Optional declaration of registry extensions the writer emits (see EXTENSIONS.md). Writers SHOULD emit an array of non-empty strings (normative in SPEC.md). Readers that do not implement extensions must ignore this field entirely, whatever its shape — it is an unknown field, never a validation input, so this schema deliberately does not constrain it."
		},
```

- [ ] **Step 4: Run to verify pass, then full suite**

Run: `npx vitest run tests/schema.test.ts && npm test`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add schema/curt-v1.schema.json tests/schema.test.ts
git commit -m "feat: schema models the extensions declaration"
```

---

### Task 4: SPEC.md — frozen core + Extensions section + versioning policy

**Files:**
- Modify: `SPEC.md` (no code; normative text)

- [ ] **Step 1: Add the Extensions section**

Insert after the "Unknown fields" section and before "Validation rules":

```markdown
## Extensions

Writers may declare named extensions they use via an optional top-level
`extensions` array:

```json
{
	"curt": "curtis-conversation",
	"version": 1,
	"extensions": ["images-inline"],
	"conversation": { "..." : "..." }
}
```

1. When present, the array holds non-empty strings naming entries in
   [`EXTENSIONS.md`](EXTENSIONS.md) — the registry.
2. A reader that does not implement an extension ignores its name, and
   ignores the `extensions` field entirely whatever its shape. It is an
   unknown field like any other: never a validation input, never a reason
   to reject.
3. Extension behavior lives in the fields an extension reads and writes
   inside `conversation` and its messages; the registry entry documents
   those fields. An extension must not change how the core validates.
4. The registry is additive: new entries never change how existing v1
   files parse. Extensions cannot conflict with core field names.
```

- [ ] **Step 2: Codify the versioning policy**

Replace the existing `## Versioning` section with:

```markdown
## Versioning

Format versions change rarely. Within a version:

- **Additions** ship as new `EXTENSIONS.md` registry entries or as
  clarifications. `version` stays the same and existing files remain valid.
- **Breaking changes** — anything that would make a conforming v1 reader
  reject or misparse a file it previously accepted — get a new version
  number. A future version 2 bumps `version` and keeps version-1 files
  readable forever. Breaking changes are never a silent redefinition of 1.

The validation rules of a version are frozen at its release; the registry is
the only forward-motion mechanism inside version 1.
```

- [ ] **Step 3: Link the registry + conformance from the intro**

In the intro paragraph after the JSON Schema sentence, append:

```markdown
Optional capabilities grow through the [extension registry](EXTENSIONS.md);
implementations are graded against executable vectors in
[`conformance/`](conformance/README.md).
```

- [ ] **Step 4: Verify the spec page still renders + commit**

Run: `grep -c "EXTENSIONS.md" SPEC.md`
Expected: `2` or more.

```bash
git add SPEC.md
git commit -m "spec: frozen core + extensions registry, versioning policy codified"
```

---

### Task 5: EXTENSIONS.md — the registry

**Files:**
- Create: `EXTENSIONS.md`

- [ ] **Step 1: Write the registry**

```markdown
# .curt Extension Registry

Extensions are named, optional capability sets a writer declares in the
top-level `extensions` array (see SPEC.md, "Extensions"). Core v1 parsing is
never affected: a reader that doesn't know an extension ignores it.

## Adding an entry

Open a PR adding a section below. Each entry: `name` (lowercase, hyphenated,
unique), `status` (`draft` → `stable`; `deprecated` retires it), purpose, the
exact fields it reads/writes and where, and any conformance vectors
(`conformance/vectors/extensions.json`). Status moves `draft` → `stable` when
at least two independent implementations round-trip it.

## Registry

| Name | Status | Emitted by | Purpose |
|---|---|---|---|
| `images-inline` | stable | curtis plugin, curtis-web, porter | Image payloads ride inside `content` |
| `usage-metadata` | stable | curtis-web | Per-message cost/token/provider fields |
| `tool-linkage` | draft | porter | Tool-call requests and their results |
| `agent-context` | draft | porter, curtis-cloud | Agent/swarm provenance on conversations and messages |

---

### `images-inline` — stable

Images are not a separate field: a message whose content is a data URI
(`data:image/...;base64,...`) or raw base64 carries an image inline. Readers
never decode or transform `content`; writers never emit a BOM-wrapped or
otherwise altered payload.

- Fields: none beyond core (`content` carries the payload; `kind: "image"`
  is a common optional marker).

### `usage-metadata` — stable

Optional extra fields recording economics and provenance:

- Message-level: `tokens` (object, e.g. `{ "input": 12, "output": 340 }`),
  `cost` (number, writer's currency), `provider` (string).
- Readers must preserve these verbatim on round-trip; they never affect
  validation.

### `tool-linkage` — draft

Links assistant tool calls to their `tool`-role results:

- Assistant message: `toolCalls` (array of objects with `id` (string),
  `name` (string), `arguments` (writer's JSON value)).
- Tool message: `toolCallId` (string) referencing the `toolCalls[].id`.
- Round-trip is verbatim; readers must not reorder or drop entries.

### `agent-context` — draft

Multi-agent provenance:

- Conversation-level: `agentId` (string), `skillIds` (array of strings),
  `swarmRole` (string), `leaderId` (string).
- Semantics are writer-defined; the extension guarantees only preservation.
```

- [ ] **Step 2: Commit**

```bash
git add EXTENSIONS.md
git commit -m "docs: extension registry — four seed entries"
```

---

### Task 6: conformance/README.md — levels + claim process

**Files:**
- Create: `conformance/README.md`

- [ ] **Step 1: Write the conformance guide**

```markdown
# .curt Conformance

An implementation claims a level by passing its vectors. Vectors are plain
JSON in [`vectors/`](vectors/); the reference implementation executes them in
CI (`tests/conformance.test.ts`) — if your parser accepts what those vectors
accept and rejects what they reject, you match the level.

| Level | Name | Requirement | Obligation |
|---|---|---|---|
| L1 | CORE | Parse/serialize v1: magic + `version` exact-match; whole-file rejection; single leading UTF-8 BOM tolerated; unknown fields preserved on round-trip; any JSON-number timestamps accepted | MUST for "conforming" |
| L2 | NAMED | `curtFilename` implements the `<date> <slug> <suffix>.curt` algorithm exactly | SHOULD |
| L3 | BULK | Zip-of-`.curt` convention; entry names from `curtFilename`; readers never depend on names; corrupted entries skipped, valid ones imported | MAY |
| L4+ | Extension | Each extension's vectors in `vectors/extensions.json` | MAY |

## Vectors

- `vectors/core.json` — L1. `vectors[].body` is a raw file body string;
  `expect` is `"accept"` or `"reject"`.
- `vectors/named.json` — L2. `vectors[].conversation` is the input;
  `expect` is the exact filename.
- `vectors/bulk.json` — L3. Rules plus a canonical example; zip-level
  behavior is asserted by rule, not binary fixture.
- `vectors/extensions.json` — extensions. All cases are `accept`: extension
  presence (or malformation) must never cause rejection.

## Claiming conformance

1. Run your implementation against the vectors.
2. Update your row in [`../capabilities.json`](../capabilities.json):
   `conformanceLevel` (e.g. `"L1"`, `"L1+L2"`), `extensions` (names you
   emit/accept), `lastAudited`.
3. Link the run (CI job or script) in your repo — claims are self-reported
   but must be reproducible from the vectors.
```

- [ ] **Step 2: Commit**

```bash
git add conformance/README.md
git commit -m "docs: conformance levels and claim process"
```

---

### Task 7: L1 CORE vectors + executable test

**Files:**
- Create: `conformance/vectors/core.json`
- Create: `conformance/vectors/named.json`
- Create: `conformance/vectors/bulk.json`
- Create: `conformance/vectors/extensions.json`
- Create: `tests/conformance.test.ts`

- [ ] **Step 1: Write core.json**

```json
{
	"level": "L1",
	"name": "CORE",
	"vectors": [
		{
			"name": "accept-basic",
			"expect": "accept",
			"body": "{\n\t\"curt\": \"curtis-conversation\",\n\t\"version\": 1,\n\t\"generator\": \"vectors@1\",\n\t\"conversation\": {\n\t\t\"id\": \"conv_001\",\n\t\t\"title\": \"Fixture conversation\",\n\t\t\"createdAt\": 1760000000000,\n\t\t\"updatedAt\": 1760000100000,\n\t\t\"messages\": [\n\t\t\t{\n\t\t\t\t\"id\": \"m1\",\n\t\t\t\t\"role\": \"user\",\n\t\t\t\t\"content\": \"hello\",\n\t\t\t\t\"timestamp\": 1760000000000\n\t\t\t}\n\t\t]\n\t}\n}"
		},
		{
			"name": "accept-utf8-bom",
			"expect": "accept",
			"body": "﻿{\n\t\"curt\": \"curtis-conversation\",\n\t\"version\": 1,\n\t\"conversation\": {\n\t\t\"id\": \"c\",\n\t\t\"title\": \"\",\n\t\t\"createdAt\": 0,\n\t\t\"updatedAt\": 0,\n\t\t\"messages\": []\n\t}\n}"
		},
		{
			"name": "accept-unknown-fields-everywhere",
			"expect": "accept",
			"body": "{\n\t\"curt\": \"curtis-conversation\",\n\t\"version\": 1,\n\t\"extraTop\": { \"deep\": [1, 2] },\n\t\"conversation\": {\n\t\t\"id\": \"c\",\n\t\t\"title\": \"\",\n\t\t\"createdAt\": 0,\n\t\t\"updatedAt\": 0,\n\t\t\"swarmRole\": \"leader\",\n\t\t\"messages\": [\n\t\t\t{\n\t\t\t\t\"id\": \"m1\",\n\t\t\t\t\"role\": \"assistant\",\n\t\t\t\t\"content\": \"data:image/png;base64,AAAA\",\n\t\t\t\t\"timestamp\": 1760000000.5,\n\t\t\t\t\"tokens\": { \"input\": 1, \"output\": 2 }\n\t\t\t}\n\t\t]\n\t}\n}"
		},
		{
			"name": "accept-all-roles-and-empty-messages",
			"expect": "accept",
			"body": "{\n\t\"curt\": \"curtis-conversation\",\n\t\"version\": 1,\n\t\"conversation\": {\n\t\t\"id\": \"c\",\n\t\t\"title\": \"\",\n\t\t\"createdAt\": -5,\n\t\t\"updatedAt\": 0.25,\n\t\t\"messages\": [\n\t\t\t{ \"id\": \"a\", \"role\": \"user\", \"content\": \"\", \"timestamp\": 0 },\n\t\t\t{ \"id\": \"b\", \"role\": \"assistant\", \"content\": \"\", \"timestamp\": 0 },\n\t\t\t{ \"id\": \"d\", \"role\": \"system\", \"content\": \"\", \"timestamp\": 0 },\n\t\t\t{ \"id\": \"e\", \"role\": \"tool\", \"content\": \"\", \"timestamp\": 0 }\n\t\t]\n\t}\n}"
		},
		{
			"name": "reject-wrong-magic",
			"expect": "reject",
			"body": "{\n\t\"curt\": \"curt-conversation\",\n\t\"version\": 1,\n\t\"conversation\": { \"id\": \"c\", \"title\": \"\", \"createdAt\": 0, \"updatedAt\": 0, \"messages\": [] }\n}"
		},
		{
			"name": "reject-version-as-string",
			"expect": "reject",
			"body": "{\n\t\"curt\": \"curtis-conversation\",\n\t\"version\": \"1\",\n\t\"conversation\": { \"id\": \"c\", \"title\": \"\", \"createdAt\": 0, \"updatedAt\": 0, \"messages\": [] }\n}"
		},
		{
			"name": "reject-version-2",
			"expect": "reject",
			"body": "{\n\t\"curt\": \"curtis-conversation\",\n\t\"version\": 2,\n\t\"conversation\": { \"id\": \"c\", \"title\": \"\", \"createdAt\": 0, \"updatedAt\": 0, \"messages\": [] }\n}"
		},
		{
			"name": "reject-missing-title",
			"expect": "reject",
			"body": "{\n\t\"curt\": \"curtis-conversation\",\n\t\"version\": 1,\n\t\"conversation\": { \"id\": \"c\", \"createdAt\": 0, \"updatedAt\": 0, \"messages\": [] }\n}"
		},
		{
			"name": "reject-bad-role",
			"expect": "reject",
			"body": "{\n\t\"curt\": \"curtis-conversation\",\n\t\"version\": 1,\n\t\"conversation\": {\n\t\t\"id\": \"c\",\n\t\t\"title\": \"\",\n\t\t\"createdAt\": 0,\n\t\t\"updatedAt\": 0,\n\t\t\"messages\": [{ \"id\": \"m\", \"role\": \"user2\", \"content\": \"\", \"timestamp\": 0 }]\n\t}\n}"
		},
		{
			"name": "reject-message-missing-timestamp",
			"expect": "reject",
			"body": "{\n\t\"curt\": \"curtis-conversation\",\n\t\"version\": 1,\n\t\"conversation\": {\n\t\t\"id\": \"c\",\n\t\t\"title\": \"\",\n\t\t\"createdAt\": 0,\n\t\t\"updatedAt\": 0,\n\t\t\"messages\": [{ \"id\": \"m\", \"role\": \"user\", \"content\": \"\" }]\n\t}\n}"
		},
		{
			"name": "reject-truncated-json",
			"expect": "reject",
			"body": "{\n\t\"curt\": \"curtis-conversation\",\n\t\"version\": 1,\n\t\"conv"
		},
		{
			"name": "reject-conversation-not-object",
			"expect": "reject",
			"body": "{\n\t\"curt\": \"curtis-conversation\",\n\t\"version\": 1,\n\t\"conversation\": \"nope\"\n}"
		},
		{
			"name": "reject-messages-not-array",
			"expect": "reject",
			"body": "{\n\t\"curt\": \"curtis-conversation\",\n\t\"version\": 1,\n\t\"conversation\": { \"id\": \"c\", \"title\": \"\", \"createdAt\": 0, \"updatedAt\": 0, \"messages\": {} }\n}"
		}
	]
}
```

Note: the `accept-utf8-bom` body must begin with a literal U+FEFF character before the `{` — the `"﻿"` shown above is that character. When writing the file, verify with `node -e "const v=require('./conformance/vectors/core.json'); console.log(v.vectors[1].body.charCodeAt(0).toString(16))"` → expect `feff`.

- [ ] **Step 2: Write named.json**

```json
{
	"level": "L2",
	"name": "NAMED",
	"vectors": [
		{
			"name": "basic",
			"conversation": { "id": "conv_001", "title": "Fixture conversation", "createdAt": 1760000000000, "updatedAt": 1760000100000, "messages": [] },
			"expect": "2025-10-09 fixture-conversation 001.curt"
		},
		{
			"name": "suffix-after-last-underscore",
			"conversation": { "id": "chat_abc123_xyz", "title": "T", "createdAt": 1760000000000, "updatedAt": 0, "messages": [] },
			"expect": "2025-10-09 t xyz.curt"
		},
		{
			"name": "no-underscore-uses-last-8",
			"conversation": { "id": "abcdef123456", "title": "T", "createdAt": 1760000000000, "updatedAt": 0, "messages": [] },
			"expect": "2025-10-09 t ef123456.curt"
		},
		{
			"name": "short-id-uses-whole-id",
			"conversation": { "id": "x", "title": "", "createdAt": 1760000000000, "updatedAt": 0, "messages": [] },
			"expect": "2025-10-09 untitled x.curt"
		},
		{
			"name": "non-finite-date-falls-back-to-1970",
			"conversation": { "id": "x", "title": "T", "createdAt": "not-a-number", "updatedAt": 0, "messages": [] },
			"expect": "1970-01-01 t x.curt"
		},
		{
			"name": "unicode-slug-keeps-letters",
			"conversation": { "id": "x", "title": "Héllo Wörld 你好", "createdAt": 1760000000000, "updatedAt": 0, "messages": [] },
			"expect": "2025-10-09 héllo-wörld-你好 x.curt"
		},
		{
			"name": "slug-capped-at-50-trailing-hyphens-trimmed",
			"conversation": { "id": "x", "title": "a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a", "createdAt": 1760000000000, "updatedAt": 0, "messages": [] },
			"expect": "2025-10-09 a-a-a-a-a-a-a-a-a-a-a-a-a-a-a-a-a-a-a-a-a-a-a-a-a x.curt"
		}
	]
}
```

Verify the cap case against the algorithm: 30 a's joined = 59 chars (`a-` × 29 + `a`), sliced to 50 ends in `-`, trimmed to 49 chars = `a-` × 24 + `a`. The `expect` above is exactly that string — count it when writing.

- [ ] **Step 3: Write bulk.json**

```json
{
	"level": "L3",
	"name": "BULK",
	"rules": [
		"A bulk export is a zip whose entries are .curt files; the zip contains no manifest requirement.",
		"Entry names SHOULD come from curtFilename; readers MUST NOT depend on names for parsing or ordering.",
		"A reader MUST import valid entries and report (not silently drop) corrupted ones.",
		"Directory entries, if present, MUST be ignored."
	],
	"example": {
		"conversation": { "id": "conv_001", "title": "Fixture conversation", "createdAt": 1760000000000, "updatedAt": 1760000100000, "messages": [] },
		"entries": ["2025-10-09 fixture-conversation 001.curt"]
	}
}
```

- [ ] **Step 4: Write extensions.json**

```json
{
	"level": "L4",
	"name": "EXTENSIONS",
	"note": "All cases are accept: extension presence — even malformation — must never cause rejection.",
	"vectors": [
		{
			"name": "images-inline",
			"expect": "accept",
			"body": "{\n\t\"curt\": \"curtis-conversation\",\n\t\"version\": 1,\n\t\"extensions\": [\"images-inline\"],\n\t\"conversation\": {\n\t\t\"id\": \"c\",\n\t\t\"title\": \"\",\n\t\t\"createdAt\": 0,\n\t\t\"updatedAt\": 0,\n\t\t\"messages\": [{ \"id\": \"m\", \"role\": \"user\", \"content\": \"data:image/png;base64,iVBORw0KGgoAAAANSUhEUg==\", \"timestamp\": 0, \"kind\": \"image\" }]\n\t}\n}"
		},
		{
			"name": "usage-metadata",
			"expect": "accept",
			"body": "{\n\t\"curt\": \"curtis-conversation\",\n\t\"version\": 1,\n\t\"extensions\": [\"usage-metadata\"],\n\t\"conversation\": {\n\t\t\"id\": \"c\",\n\t\t\"title\": \"\",\n\t\t\"createdAt\": 0,\n\t\t\"updatedAt\": 0,\n\t\t\"messages\": [{ \"id\": \"m\", \"role\": \"assistant\", \"content\": \"hi\", \"timestamp\": 0, \"provider\": \"zai\", \"tokens\": { \"input\": 10, \"output\": 3 }, \"cost\": 0.0002 }]\n\t}\n}"
		},
		{
			"name": "tool-linkage",
			"expect": "accept",
			"body": "{\n\t\"curt\": \"curtis-conversation\",\n\t\"version\": 1,\n\t\"extensions\": [\"tool-linkage\"],\n\t\"conversation\": {\n\t\t\"id\": \"c\",\n\t\t\"title\": \"\",\n\t\t\"createdAt\": 0,\n\t\t\"updatedAt\": 0,\n\t\t\"messages\": [\n\t\t\t{ \"id\": \"m1\", \"role\": \"assistant\", \"content\": \"\", \"timestamp\": 0, \"toolCalls\": [{ \"id\": \"t1\", \"name\": \"search\", \"arguments\": { \"q\": \"x\" } }] },\n\t\t\t{ \"id\": \"m2\", \"role\": \"tool\", \"content\": \"{\\\"result\\\":1}\", \"timestamp\": 0, \"toolCallId\": \"t1\" }\n\t\t]\n\t}\n}"
		},
		{
			"name": "agent-context",
			"expect": "accept",
			"body": "{\n\t\"curt\": \"curtis-conversation\",\n\t\"version\": 1,\n\t\"extensions\": [\"agent-context\"],\n\t\"conversation\": {\n\t\t\"id\": \"c\",\n\t\t\"title\": \"\",\n\t\t\"createdAt\": 0,\n\t\t\"updatedAt\": 0,\n\t\t\"agentId\": \"peggy\",\n\t\t\"skillIds\": [\"calendar\", \"mail\"],\n\t\t\"swarmRole\": \"leader\",\n\t\t\"leaderId\": \"peggy\",\n\t\t\"messages\": []\n\t}\n}"
		},
		{
			"name": "unknown-extension-ignored",
			"expect": "accept",
			"body": "{\n\t\"curt\": \"curtis-conversation\",\n\t\"version\": 1,\n\t\"extensions\": [\"branching-v2\", \"not-in-registry\"],\n\t\"conversation\": { \"id\": \"c\", \"title\": \"\", \"createdAt\": 0, \"updatedAt\": 0, \"messages\": [] }\n}"
		},
		{
			"name": "malformed-extensions-still-accepted",
			"expect": "accept",
			"body": "{\n\t\"curt\": \"curtis-conversation\",\n\t\"version\": 1,\n\t\"extensions\": \"images-inline\",\n\t\"conversation\": { \"id\": \"c\", \"title\": \"\", \"createdAt\": 0, \"updatedAt\": 0, \"messages\": [] }\n}"
		}
	]
}
```

- [ ] **Step 5: Write the executable test**

Create `tests/conformance.test.ts`:

```ts
// Executes the conformance vectors against the reference implementation.
// Third parties: these files ARE the conformance bar — see conformance/README.md.

import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseCurt, curtFilename, type CurtConversation } from '../src/index';

const vec = (name: string) =>
	JSON.parse(readFileSync(join(__dirname, '..', 'conformance', 'vectors', name), 'utf8'));

describe('L1 CORE', () => {
	const { vectors } = vec('core.json');
	for (const v of vectors) {
		it(`${v.expect}: ${v.name}`, () => {
			if (v.expect === 'accept') expect(parseCurt(v.body)).not.toBeNull();
			else expect(parseCurt(v.body)).toBeNull();
		});
	}
});

describe('L2 NAMED', () => {
	const { vectors } = vec('named.json');
	for (const v of vectors) {
		it(v.name, () => {
			expect(curtFilename(v.conversation as CurtConversation)).toBe(v.expect);
		});
	}
});

describe('L3 BULK', () => {
	const { example } = vec('bulk.json');
	it('canonical entry name matches curtFilename', () => {
		expect(curtFilename(example.conversation as CurtConversation)).toBe(example.entries[0]);
	});
});

describe('L4 EXTENSIONS', () => {
	const { vectors } = vec('extensions.json');
	for (const v of vectors) {
		it(`accept: ${v.name}`, () => {
			expect(parseCurt(v.body)).not.toBeNull();
		});
	}
});
```

- [ ] **Step 6: Run**

Run: `npm test`
Expected: all PASS. If `non-finite-date-falls-back-to-1970` fails, check `curtFilename`'s `new Date(...)` catch path — `new Date("not-a-number")` yields Invalid Date whose `toISOString()` throws, hitting the `catch`. If the unicode case fails, verify the regex uses `/[\p{L}\p{N}]+/gu`.

- [ ] **Step 7: Commit**

```bash
git add conformance/vectors tests/conformance.test.ts
git commit -m "feat: executable conformance vectors — L1 CORE, L2 NAMED, L3 BULK, L4 extensions"
```

---

### Task 8: capabilities.json conformance fields + docs lockstep

**Files:**
- Modify: `capabilities.json` (per-consumer `conformanceLevel`, `extensions`)
- Modify: `CAPABILITIES.md` (render the new fields)
- Modify: `README.md` (Conformance section)
- Modify: `CHANGELOG.md` (Unreleased)

- [ ] **Step 1: Extend capabilities.json**

Add to each consumer object (and to a new `reference` field at top level, after `specRevision`):

```json
"reference": {
	"conformanceLevel": "L1+L2+L3+L4",
	"note": "this repo's implementation; vectors executed in CI"
}
```

Per consumer, add (values from the 2026-10-14 audit — honest, not aspirational):

```json
// curtis plugin:
"conformanceLevel": null,
"conformanceNotes": "Fails L1 by the letter: parseCurt has no BOM tolerance. Naming divergent (L2 fail).",
"extensions": { "emits": ["images-inline", "agent-context"], "accepts": ["images-inline", "usage-metadata", "tool-linkage", "agent-context"] },

// curtis-ai-chat-porter:
"conformanceLevel": null,
"conformanceNotes": "L1 pass-in-practice but fails by the letter (BOM stripped incidentally by TextDecoder, not parseCurt). L2 fail (own sanitizer).",
"extensions": { "emits": ["images-inline", "usage-metadata", "tool-linkage", "agent-context"], "accepts": ["images-inline", "usage-metadata", "tool-linkage", "agent-context"] },

// curtis-web:
"conformanceLevel": null,
"conformanceNotes": "No reader exists; L1 untestable. Write-side conforms (verbatim envelope, generator stamped). L2 fail (title-only filenames).",
"extensions": { "emits": ["usage-metadata", "images-inline"], "accepts": [] },

// curtis-cloud:
"conformanceLevel": null,
"conformanceNotes": "Fails L1: no BOM tolerance, drops top-level envelope extras.",
"extensions": { "emits": ["agent-context", "images-inline"], "accepts": ["agent-context", "images-inline", "usage-metadata", "tool-linkage"] },

// curtis-ai-tech:
"conformanceLevel": null,
"conformanceNotes": "L1 pass-in-practice via porter-derived path; fails by the letter. L2 fail.",
"extensions": { "emits": ["images-inline", "usage-metadata", "tool-linkage", "agent-context"], "accepts": ["images-inline", "usage-metadata", "tool-linkage", "agent-context"] }
```

- [ ] **Step 2: Render in CAPABILITIES.md**

Add a column `Conformance` to the matrix (values: `ref=L1–L4 ✅`, others `❌ / partial` per the JSON) and a sentence under Findings:

```markdown
Conformance claims live per consumer in `capabilities.json`
(`conformanceLevel` / `extensions`); the bar they are measured against is
[`conformance/README.md`](conformance/README.md).
```

- [ ] **Step 3: README Conformance section**

After the "Implementations" section, add:

```markdown
## Conformance

Implementations are graded against executable vectors in
[conformance/](conformance/) — L1 CORE (must), L2 NAMED, L3 BULK, L4
per-extension. The registry of optional capabilities is
[EXTENSIONS.md](EXTENSIONS.md). Ecosystem status:
[capabilities.json](capabilities.json).
```

- [ ] **Step 4: CHANGELOG entry**

Under `## Unreleased`:

```markdown
- Conformance: `conformance/` — levels L1 CORE / L2 NAMED / L3 BULK / L4
  extensions, executable vectors (`conformance/vectors/`), claim process.
  `capabilities.json` gains `conformanceLevel` / `extensions` per consumer
  (first grading 2026-10-14: only the reference implementation passes L1).
```

- [ ] **Step 5: Validate + full suite + build**

Run: `node -e "JSON.parse(require('fs').readFileSync('capabilities.json','utf8')); console.log('ok')" && npm test && npm run build`
Expected: `ok`, all tests PASS, tsc clean.

- [ ] **Step 6: Commit**

```bash
git add capabilities.json CAPABILITIES.md README.md CHANGELOG.md
git commit -m "docs: conformance grading in the ecosystem tracker"
```

---

### Task 9: Final verification

- [ ] **Step 1: Clean tree, all green**

Run: `git status --porcelain && npm test && npm run build`
Expected: empty status, all PASS, build clean.

- [ ] **Step 2: Spec-to-ship sweep**

Run: `grep -l "EXTENSIONS.md\|conformance" SPEC.md README.md EXTENSIONS.md conformance/README.md capabilities.json | wc -l`
Expected: `5` (every framework doc cross-links).

- [ ] **Step 3: Report**

Do not push — hand back to Jordan with the commit list.
