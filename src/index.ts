// .curt reference implementation — the format contract from SPEC.md as code.
//
// Zero dependencies, no platform APIs: this file runs anywhere TypeScript
// does. It is extracted verbatim from curtis-ai-chat, which keeps the spec
// and the plugin honest about each other.

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

const CURT_MAGIC = 'curtis-conversation';
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

function isMessage(v: unknown): v is CurtMessage {
	if (!v || typeof v !== 'object') return false;
	const m = v as Record<string, unknown>;
	return (
		typeof m.id === 'string' &&
		(m.role === 'user' || m.role === 'assistant' || m.role === 'system' || m.role === 'tool') &&
		typeof m.content === 'string' &&
		typeof m.timestamp === 'number'
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
 * preserved for round-tripping.
 */
export function parseCurt(raw: string): CurtConversation | null {
	let data: unknown;
	try {
		data = JSON.parse(raw);
	} catch {
		return null;
	}
	const f = data as { curt?: string; version?: number; conversation?: Partial<CurtConversation> };
	if (f?.curt !== CURT_MAGIC || f?.version !== CURT_VERSION) return null;
	const c = f.conversation;
	if (
		!c ||
		typeof c.id !== 'string' ||
		typeof c.title !== 'string' ||
		typeof c.createdAt !== 'number' ||
		typeof c.updatedAt !== 'number' ||
		!Array.isArray(c.messages) ||
		!c.messages.every(isMessage)
	) {
		return null;
	}
	return c as CurtConversation;
}
