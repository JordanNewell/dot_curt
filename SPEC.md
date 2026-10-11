# The .curt format

`.curt` is a single-file conversation format for AI chats: one file, one
conversation, full fidelity. It is designed so a portable file is byte-robust —
no escaping edge cases, base64 images and tool calls survive verbatim — and so
a reader can validate strictly: a corrupted file is rejected whole, never
half-imported.

Reference implementation: [`src/index.ts`](src/index.ts) (TypeScript, zero
dependencies, BUSL-1.1). Third-party writers are welcome; the `generator` field
exists so your app can sign what it wrote.

## File shape

A `.curt` file is UTF-8 JSON (tab-indented by convention) with this shape:

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

### Unknown fields

Writers may attach extra fields to the top level, the conversation, and
messages (tokens, images, tool-call linkage, …). Readers must preserve them on
round-trip where possible and must not fail on them.

## Validation rules (version 1)

A reader accepts a file as `.curt` v1 when, and only when:

1. The body parses as JSON.
2. `curt` is exactly `"curtis-conversation"` and `version` is exactly `1`.
3. `conversation` has `id`/`title` as strings, `createdAt`/`updatedAt` as
   numbers, and `messages` as an array in which **every** entry passes message
   validation.

Anything else is a rejection (whole-file), not a best-effort parse. The
reference `parseCurt` is the canonical behavior.

## Bulk convention

Multiple conversations travel as a zip of `.curt` files. There is no required
naming scheme; the Curtis plugin's convention is
`"<YYYY-MM-DD> <slug> <id-suffix>.curt"` for chronological, collision-safe
ordering, but readers must not depend on file names.

## Versioning

Format versions change rarely and only additively within a version. A future
version 2 bumps `version` and keeps version-1 files readable forever. Breaking
changes get a new version number, never a silent redefinition of 1.
