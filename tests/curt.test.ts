// Round-trip and validation tests. The fixtures double as test vectors for
// third-party implementers: if your parser accepts these and rejects the
// invalid cases below, you match the spec.

import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import {
	serializeCurt,
	parseCurt,
	isCurtMessage,
	isCurtConversation,
	curtFilename,
	CURT_MAGIC,
	CURT_VERSION,
} from '../src/index';

const fixturesDir = join(__dirname, 'fixtures');

const base = {
	id: 'conv_001',
	title: 'Fixture conversation',
	createdAt: 1760000000000,
	updatedAt: 1760000100000,
};

describe('fixtures', () => {
	it('every fixture parses and round-trips byte-identically', () => {
		const files = readdirSync(fixturesDir).filter((f) => f.endsWith('.curt'));
		expect(files.length).toBeGreaterThan(0);
		for (const name of files) {
			const raw = readFileSync(join(fixturesDir, name), 'utf8');
			const conv = parseCurt(raw);
			expect(conv, name).not.toBeNull();
			// Serialize without generator → must equal the fixture bodies, which
			// are written generator-less for exactly this check.
			expect(serializeCurt(conv!), name).toBe(raw);
		}
	});
});

describe('serializeCurt / parseCurt', () => {
	it('round-trips a conversation with a generator field', () => {
		const conv = { ...base, messages: [{ id: 'm1', role: 'user', content: 'hi', timestamp: 1760000000000 }] };
		const body = serializeCurt(conv, 'writer@1.0');
		const parsed = parseCurt(body);
		expect(parsed).toEqual(conv);
	});

	it('preserves unknown fields on conversations and messages', () => {
		const conv = {
			...base,
			tokens: { input: 10, output: 5 },
			messages: [
				{ id: 'm1', role: 'assistant', content: 'x', timestamp: 1, toolCalls: [{ id: 't1' }] },
			],
		};
		expect(parseCurt(serializeCurt(conv))).toEqual(conv);
	});

	it('rejects non-JSON', () => {
		expect(parseCurt('not json')).toBeNull();
	});

	it('rejects a wrong magic field', () => {
		const body = JSON.stringify({ curt: 'something-else', version: CURT_VERSION, conversation: base });
		expect(parseCurt(body)).toBeNull();
	});

	it('rejects a wrong version', () => {
		const body = JSON.stringify({ curt: 'curtis-conversation', version: 2, conversation: base });
		expect(parseCurt(body)).toBeNull();
	});

	it('rejects an invalid conversation shape', () => {
		const wrap = (conversation: unknown) =>
			parseCurt(JSON.stringify({ curt: 'curtis-conversation', version: 1, conversation }));
		expect(wrap(null)).toBeNull();
		expect(wrap({ ...base, id: 42 })).toBeNull();
		expect(wrap({ ...base, title: null })).toBeNull();
		expect(wrap({ ...base, createdAt: 'soon' })).toBeNull();
		expect(wrap({ ...base, messages: 'none' })).toBeNull();
	});

	it('rejects a conversation with any invalid message', () => {
		const bad = [
			{ ...base, messages: [{ id: 'm1', role: 'narrator', content: 'x', timestamp: 1 }] },
			{ ...base, messages: [{ id: 'm1', role: 'user', content: 3, timestamp: 1 }] },
			{ ...base, messages: [{ id: 'm1', role: 'user', content: 'x', timestamp: 'now' }] },
			{ ...base, messages: [{ role: 'user', content: 'x', timestamp: 1 }] },
			{ ...base, messages: [{ id: 'm1', role: 'user', content: 'x', timestamp: 1 }, { id: 'm2', role: 'user', timestamp: 2 }] },
		];
		for (const conv of bad) {
			const body = JSON.stringify({ curt: 'curtis-conversation', version: 1, conversation: conv });
			expect(parseCurt(body), JSON.stringify(conv)).toBeNull();
		}
	});

	it('ignores the generator field entirely', () => {
		const conv = { ...base, messages: [{ id: 'm1', role: 'user', content: 'hi', timestamp: 1 }] };
		for (const generator of ['curtis-ai-chat@2.0.0', '', 'anything-else@9']) {
			const body = JSON.stringify({ curt: 'curtis-conversation', version: 1, generator, conversation: conv });
			expect(parseCurt(body)).toEqual(conv);
		}
	});

	it('accepts an empty messages array', () => {
		const conv = { ...base, messages: [] };
		expect(parseCurt(serializeCurt(conv))).toEqual(conv);
	});

	it('rejects JSON bodies that are not objects', () => {
		for (const body of ['null', '5', '"x"', 'true', '[]']) {
			expect(parseCurt(body), body).toBeNull();
		}
	});

	it('rejects a string version or a non-string magic field', () => {
		const wrap = (top: Record<string, unknown>) => parseCurt(JSON.stringify(top));
		const conv = { ...base, messages: [] };
		expect(wrap({ curt: CURT_MAGIC, version: '1', conversation: conv })).toBeNull();
		expect(wrap({ curt: 1, version: CURT_VERSION, conversation: conv })).toBeNull();
		expect(wrap({ curt: CURT_MAGIC, version: 1.5, conversation: conv })).toBeNull();
	});

	it('omits the generator field when none is given, including an empty string', () => {
		const conv = { ...base, messages: [] };
		expect('generator' in JSON.parse(serializeCurt(conv))).toBe(false);
		expect('generator' in JSON.parse(serializeCurt(conv, ''))).toBe(false);
	});
});

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

describe('BOM tolerance', () => {
	it('parses a body with a single leading UTF-8 BOM', () => {
		const conv = { ...base, messages: [{ id: 'm1', role: 'user', content: 'hi', timestamp: 1 }] };
		expect(parseCurt('\uFEFF' + serializeCurt(conv))).toEqual(conv);
	});

	it('still rejects invalid bodies that carry a BOM', () => {
		expect(parseCurt('\uFEFFnot json')).toBeNull();
	});
});

describe('isCurtMessage / isCurtConversation', () => {
	it('accepts every spec-valid shape the parser accepts', () => {
		for (const name of readdirSync(fixturesDir).filter((f) => f.endsWith('.curt'))) {
			const conv = parseCurt(readFileSync(join(fixturesDir, name), 'utf8'))!;
			expect(isCurtConversation(conv), name).toBe(true);
			for (const m of conv.messages) expect(isCurtMessage(m), name).toBe(true);
		}
	});

	it('rejects non-objects and invalid shapes', () => {
		for (const v of [null, undefined, 5, 'x', []]) {
			expect(isCurtMessage(v)).toBe(false);
			expect(isCurtConversation(v)).toBe(false);
		}
		expect(isCurtMessage({ id: 'm1', role: 'narrator', content: 'x', timestamp: 1 })).toBe(false);
		expect(isCurtConversation({ ...base, messages: [{ id: 'm1', role: 'user', content: 'x', timestamp: 1 }, {}] })).toBe(false);
	});
});

describe('curtFilename', () => {
	// base.createdAt = 1760000000000 → 2025-10-09T08:53:20Z; base.id = 'conv_001'.
	it('builds "<date> <slug> <suffix>.curt" from the immutable fields', () => {
		expect(curtFilename({ ...base, messages: [] })).toBe('2025-10-09 fixture-conversation 001.curt');
	});

	it('derives the date from createdAt, not updatedAt', () => {
		expect(curtFilename({ ...base, updatedAt: 1893456000000, messages: [] })).toBe(
			'2025-10-09 fixture-conversation 001.curt',
		);
	});

	it('falls back to "untitled" when the title has no letters or digits', () => {
		for (const title of ['', '   ', '!!! ???', '—']) {
			expect(curtFilename({ ...base, title, messages: [] })).toBe('2025-10-09 untitled 001.curt');
		}
	});

	it('keeps non-ASCII words in the slug', () => {
		expect(curtFilename({ ...base, title: 'Grâce — déjà vu', messages: [] })).toBe(
			'2025-10-09 grâce-déjà-vu 001.curt',
		);
	});

	it('caps the slug at 50 characters without splitting a trailing word', () => {
		const name = curtFilename({ ...base, title: 'a'.repeat(60), messages: [] });
		expect(name).toBe(`2025-10-09 ${'a'.repeat(50)} 001.curt`);
		expect(curtFilename({ ...base, title: 'word '.repeat(20), messages: [] })).toBe(
			`2025-10-09 ${('word-'.repeat(10)).replace(/-+$/, '')} 001.curt`,
		);
	});

	it('uses the last 8 id characters when no underscore suffix exists', () => {
		expect(curtFilename({ ...base, id: 'a1b2c3d4e5f6', messages: [] })).toBe(
			'2025-10-09 fixture-conversation c3d4e5f6.curt',
		);
	});

	it('uses 1970-01-01 for a non-finite createdAt', () => {
		expect(curtFilename({ ...base, createdAt: Number.NaN, messages: [] })).toBe(
			'1970-01-01 fixture-conversation 001.curt',
		);
	});
});
