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
