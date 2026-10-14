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
| `images-inline` | stable | curtis plugin, porter, curtis-web, curtis-cloud, curtis-ai-tech | Image payloads ride inside `content` |
| `usage-metadata` | stable | porter, curtis-web, curtis-ai-tech | Per-message cost/token/provider fields |
| `tool-linkage` | draft | porter, curtis-ai-tech | Tool-call requests and their results |
| `agent-context` | draft | curtis plugin, porter, curtis-cloud, curtis-ai-tech | Agent/swarm provenance on conversations and messages |

Full per-consumer emit/accept data: [`capabilities.json`](capabilities.json).

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
