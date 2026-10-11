// .curt reference implementation — the format contract from SPEC.md as code.
//
// Zero dependencies, no platform APIs: this file runs anywhere TypeScript
// does. curtis-ai-chat vendors it; when it changes here, port the change
// there so the spec and the app stay honest about each other.

/** A single turn in a conversation. */
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

/** One conversation. Unknown fields are preserved by readers that round-trip. */
export interface CurtConversation {
	id: string;
	title: string;
	/** Epoch milliseconds. */
	createdAt: number;
	/** Epoch milliseconds. */
	updatedAt: number;
	messages: CurtMessage[];
	/** Original provider/model as display metadata. */
	provider?: string;
	model?: string;
	[key: string]: unknown;
}

export const CURT_MAGIC = 'curtis-conversation';
export const CURT_VERSION = 1;

interface CurtFile {
	curt: typeof CURT_MAGIC;
	version: number;
	/**
	 * Provenance: which app and version produced the file, e.g.
	 * "some-writer@1.2.3". Optional. Readers must ignore it — its presence,
	 * absence, or value never affects parsing.
	 */
	generator?: string;
	conversation: CurtConversation;
}

/** Type guard for a spec-valid message ("Each message in `messages`"). */
export function isCurtMessage(v: unknown): v is CurtMessage {
	if (!v || typeof v !== 'object') return false;
	const m = v as Record<string, unknown>;
	return (
		typeof m.id === 'string' &&
		(m.role === 'user' || m.role === 'assistant' || m.role === 'system' || m.role === 'tool') &&
		typeof m.content === 'string' &&
		typeof m.timestamp === 'number'
	);
}

/**
 * Type guard for a spec-valid conversation ("Validation rules"). This is the
 * exact predicate `parseCurt` applies to the `conversation` field.
 */
export function isCurtConversation(v: unknown): v is CurtConversation {
	if (!v || typeof v !== 'object') return false;
	const c = v as Record<string, unknown>;
	return (
		typeof c.id === 'string' &&
		typeof c.title === 'string' &&
		typeof c.createdAt === 'number' &&
		typeof c.updatedAt === 'number' &&
		Array.isArray(c.messages) &&
		(c.messages as unknown[]).every(isCurtMessage)
	);
}

/** Serialize a conversation as a .curt file body (tab-indented JSON). */
export function serializeCurt(conversation: CurtConversation, generator?: string): string {
	const file: CurtFile = {
		curt: CURT_MAGIC,
		version: CURT_VERSION,
		conversation,
	};
	if (generator) file.generator = generator;
	return JSON.stringify(file, null, '\t');
}

/**
 * Parse a .curt body. Returns null when the magic field, version, or
 * conversation shape fails validation — a corrupted file is reported, never
 * half-parsed. Unknown fields on the conversation and its messages are
 * preserved for round-tripping. A single leading UTF-8 BOM is ignored.
 */
export function parseCurt(raw: string): CurtConversation | null {
	// A UTF-8 BOM is not JSON, but Windows editors prepend one anyway.
	if (raw.charCodeAt(0) === 0xfeff) raw = raw.slice(1);
	let data: unknown;
	try {
		data = JSON.parse(raw);
	} catch {
		return null;
	}
	const f = data as { curt?: string; version?: number; conversation?: unknown };
	if (f?.curt !== CURT_MAGIC || f?.version !== CURT_VERSION) return null;
	return isCurtConversation(f.conversation) ? f.conversation : null;
}

/**
 * The recommended file name for a conversation, following the Curtis
 * convention `"<YYYY-MM-DD> <slug> <suffix>.curt"` (see SPEC.md, "Bulk
 * convention"). It derives only from the immutable fields `createdAt` and
 * `id`, so the name stays stable across title edits and later updates.
 *
 * - `<date>`: `createdAt` as a UTC `YYYY-MM-DD` (`1970-01-01` if not a
 *   finite timestamp).
 * - `<slug>`: `title` lowercased, each run of letters/digits joined with `-`,
 *   capped at 50 characters, `untitled` when nothing remains.
 * - `<suffix>`: the part of `id` after the last `_`; if there is no `_` or
 *   nothing follows it, the last 8 characters of `id`.
 */
export function curtFilename(conversation: CurtConversation): string {
	let date: string;
	try {
		date = new Date(conversation.createdAt).toISOString().slice(0, 10);
	} catch {
		date = '1970-01-01';
	}
	const words = conversation.title.toLowerCase().match(/[\p{L}\p{N}]+/gu) ?? [];
	const slug =
		Array.from(words.join('-'))
			.slice(0, 50)
			.join('')
			.replace(/-+$/, '') || 'untitled';
	const id = conversation.id;
	const suffix = (id.includes('_') ? id.slice(id.lastIndexOf('_') + 1) : '') || id.slice(-8);
	return `${date} ${slug} ${suffix}.curt`;
}
