// The JSON schema is non-normative, but it must agree with the normative
// validator: everything parseCurt accepts, the schema accepts — and the
// rejection cases must fail the schema too, or a third-party validator built
// on it would drift from the spec.

import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import Ajv from 'ajv';
import schema from '../schema/curt-v1.schema.json';

const validate = new Ajv({ strict: false }).compile(schema);

const base = {
	id: 'conv_001',
	title: 'Schema test',
	createdAt: 1760000000000,
	updatedAt: 1760000100000,
};
const msg = { id: 'm1', role: 'user', content: 'hi', timestamp: 1 };

describe('JSON schema agrees with parseCurt', () => {
	it('accepts every fixture', () => {
		for (const name of readdirSync(join(__dirname, 'fixtures')).filter((f) => f.endsWith('.curt'))) {
			const body = JSON.parse(readFileSync(join(__dirname, 'fixtures', name), 'utf8'));
			expect(validate(body), `${name}: ${JSON.stringify(validate.errors)}`).toBe(true);
		}
	});

	it('rejects each spec-rejected body', () => {
		const bad = [
			{},
			{ curt: 'nope', version: 1, conversation: { ...base, messages: [msg] } },
			{ curt: 'curtis-conversation', version: 2, conversation: { ...base, messages: [msg] } },
			{ curt: 'curtis-conversation', version: 1 },
			{ curt: 'curtis-conversation', version: 1, conversation: { ...base, messages: [{ ...msg, role: 'narrator' }] } },
			{ curt: 'curtis-conversation', version: 1, conversation: { ...base, messages: [{ ...msg, timestamp: 'now' }] } },
			{ curt: 'curtis-conversation', version: 1, conversation: { ...base, messages: [{ role: 'user', content: 'x', timestamp: 1 }] } },
			{ curt: 'curtis-conversation', version: 1, conversation: { ...base, title: null, messages: [msg] } },
		];
		for (const body of bad) {
			expect(validate(body), JSON.stringify(body)).toBe(false);
		}
	});

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

	it('tolerates unknown fields at every level', () => {
		const body = {
			curt: 'curtis-conversation',
			version: 1,
			generator: 'schema-test@0.1',
			extraTop: true,
			conversation: {
				...base,
				messages: [{ ...msg, kind: 'image', toolCalls: [{ id: 't1' }] }],
				tokens: { input: 1, output: 2 },
			},
		};
		expect(validate(body)).toBe(true);
	});
});
