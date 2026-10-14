# The .curt format

`.curt` is a single-file conversation format for AI chats: one file, one
conversation, full fidelity. It is designed so a portable file is byte-robust —
no escaping edge cases, base64 images and tool calls survive verbatim — and so
a reader can validate strictly: a corrupted file is rejected whole, never
half-imported.

Reference implementation: [`src/index.ts`](src/index.ts) (TypeScript, zero
dependencies, MIT). Third-party writers are welcome; the `generator` field
exists so your app can sign what it wrote. A non-normative
[JSON Schema](schema/curt-v1.schema.json) is provided for tooling.
Optional capabilities grow through the [extension registry](EXTENSIONS.md);
implementations are graded against executable vectors in
[`conformance/`](conformance/README.md).

## File shape

A `.curt` file is UTF-8 JSON (tab-indented by convention) with this shape.
Readers must ignore at most one leading UTF-8 byte-order mark (`EF BB BF`) —
it is not part of the JSON body, and writers must not emit it:

```json
{
	"curt": "curtis-conversation",
	"version": 1,
	"generator": "your-app@1.2.3",
	"conversation": { ... }
}
```

### Top-level fields

| Field | Required | Meaning |
|---|---|---|
| `curt` | yes | Magic field. Must be exactly `"curtis-conversation"`. |
| `version` | yes | Format version. This spec is `1`. |
| `generator` | no | Provenance: `"writer-name@version"`. **Readers must ignore it** — presence, absence, or value never affects parsing. |
| `conversation` | yes | The conversation object (below). |

### The `conversation` object

| Field | Required | Meaning |
|---|---|---|
| `id` | yes | Stable conversation identifier (string). Writer's choice of scheme. |
| `title` | yes | Human-readable title (string, may be empty). |
| `createdAt` | yes | Epoch milliseconds (number). |
| `updatedAt` | yes | Epoch milliseconds (number). |
| `messages` | yes | Array of message objects (below). Must be non-empty to be meaningful, but readers may accept empty arrays. |

### Each message in `messages`

| Field | Required | Meaning |
|---|---|---|
| `id` | yes | Stable message identifier (string). |
| `role` | yes | One of `"user"`, `"assistant"`, `"system"`, `"tool"`. |
| `content` | yes | Message text (string). Binary payloads ride inside `content` as base64/data URIs, verbatim. |
| `timestamp` | yes | Epoch milliseconds (number). |
| `model` | no | Provider model id, typically on assistant messages. |

Timestamps are epoch milliseconds. Writers should emit integers; version-1
validators accept any JSON number and must not reject a file over fractional
or negative values.

### Unknown fields

Writers may attach extra fields to the top level, the conversation, and
messages (tokens, images, tool-call linkage, …). Readers must preserve them on
round-trip where possible and must not fail on them.

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

## Validation rules (version 1)

A reader accepts a file as `.curt` v1 when, and only when:

1. The body parses as JSON (after ignoring at most one leading UTF-8 BOM).
2. `curt` is exactly `"curtis-conversation"` and `version` is exactly the
   number `1` — a string `"1"` is a rejection.
3. `conversation` has `id`/`title` as strings, `createdAt`/`updatedAt` as
   numbers, and `messages` as an array in which **every** entry passes message
   validation.

Anything else is a rejection (whole-file), not a best-effort parse. The
reference `parseCurt` is the canonical behavior; `isCurtMessage` and
`isCurtConversation` expose its component predicates for reuse.

## Conformance

A **conforming writer** emits files that pass the validation rules above,
keeps `version` at `1`, signs `generator` as `"writer-name@version"`, and
never writes a BOM.

A **conforming reader** rejects whole-file on any validation failure,
ignores `generator` entirely, and preserves unknown fields on round-trip
where possible. Readers that re-serialize must produce a body their own
parser accepts.

## JSON Schema

[`schema/curt-v1.schema.json`](schema/curt-v1.schema.json) is a non-normative
draft-07 rendering of the validation rules, for editors, linters, and
third-party tooling. The normative rules are this document; when in doubt,
`parseCurt` decides.

## Bulk convention

Multiple conversations travel as a zip of `.curt` files. There is no required
naming scheme; readers must not depend on file names. Readers import the valid
entries and report (not silently drop) corrupted ones; directory entries, if
present, are ignored. The Curtis convention is
`"<YYYY-MM-DD> <slug> <suffix>.curt"` for chronological, collision-safe
ordering, defined so the name depends only on immutable fields (`createdAt`,
`id`) and therefore survives title edits and later updates:

- `<date>` — `createdAt` as a UTC `YYYY-MM-DD`; `1970-01-01` when `createdAt`
  is not a finite timestamp.
- `<slug>` — `title` lowercased, each run of letters or digits joined with
  `-`, capped at 50 characters with trailing hyphens trimmed; `untitled` when
  nothing remains.
- `<suffix>` — the part of `id` after the last `_`; if there is no `_`, or
  nothing follows it, the last 8 characters of `id`.

Example: `2025-10-09 fixture-conversation 001.curt`. The reference
implementation exposes this as `curtFilename`.

## Implementation notes

Treat `.curt` files as untrusted input. Images ride inline as base64 inside
`content`, so a small conversation can be a very large file — bound parsing
by input size before validation. Unknown fields are data, never code: do not
interpret, dereference, or execute anything found in them.

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
