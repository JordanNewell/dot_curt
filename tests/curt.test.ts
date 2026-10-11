// Round-trip and validation tests. The fixtures double as test vectors for
// third-party implementers: if your parser accepts these and rejects the
// invalid cases below, you match the spec.

import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { serializeCurt, parseCurt, CURT_VERSION } from '../src/index';

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
});
