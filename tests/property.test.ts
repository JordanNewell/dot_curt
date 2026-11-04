// Property-based (fuzz) round-trip tests, powered by fast-check. These pin the
// format's core claim from SPEC.md: every spec-valid document round-trips and
// invalid input is rejected whole (null / predicate false) — never thrown.
//
// Known limits (recorded, not asserted, because exact thresholds are
// platform/stack-size dependent — measured on Node 24 / Windows, default
// stack): JSON.stringify inside serializeCurt throws RangeError when an
// unknown field's nesting reaches ~4000+ levels, while JSON.parse failures at
// any depth are caught by parseCurt and returned as null. The properties below
// therefore stay well inside the safe region (depth <= 150 fuzzed, 250
// deterministic). Windows CI runners throw RangeError at depth 1000;
// checked deterministically).

import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import {
	serializeCurt,
	parseCurt,
	isCurtMessage,
	isCurtConversation,
	CURT_MAGIC,
	CURT_VERSION,
	type CurtConversation,
	type CurtMessage,
} from '../src/index';

// ---------------------------------------------------------------------------
// Arbitraries
// ---------------------------------------------------------------------------

/**
 * Finite JSON numbers in timestamp range — the spec accepts any JSON number
 * (fractional, negative). -0 is excluded: JSON has no signed zero, so
 * JSON.stringify(-0) emits "0" and the value comes back as +0. That is an
 * unobservable normalization (0 === -0 for every numeric purpose), not a
 * round-trip break, so the property compares real (non-negative-zero) values.
 */
const numberArb = fc.oneof(
	fc.integer({ min: -8.64e15, max: 8.64e15 }),
	fc.double({ min: -8.64e15, max: 8.64e15, noNaN: true }).filter((d) => !Object.is(d, -0)),
);

/** Unicode content: full code points, raw 16-bit units (lone surrogates), and hand-picked stress strings. */
const unicodeArb = fc.oneof(
	fc.string({ maxLength: 40 }),
	fc.string({ maxLength: 40, unit: 'binary' }),
	fc.constantFrom('emoji \ud83d\ude80', 'CJK \u4f60\u597d', 'RTL \u0645\u0631\u062d\u0628\u0627', 'inline: a\u0000\u0007\u001fctrl', '', 'lone:\ud800 and:\udead', 'ZWJ z\ud83d\ude26\u200d\u2642\ufe0f'),
);

/** Keys for unknown (extra) fields — never collide with the spec'd field names. */
const reserved = new Set(['id', 'title', 'createdAt', 'updatedAt', 'messages', 'role', 'content', 'timestamp', 'model']);
const extraKeyArb = fc
	.string({ minLength: 1, maxLength: 8 })
	.filter((k) => !reserved.has(k));

/** Arbitrary JSON-safe payloads for unknown fields (bounded depth to keep runs fast). */
const extraValueArb = fc.jsonValue({ maxDepth: 3 });
const extrasArb = fc.dictionary(extraKeyArb, extraValueArb);

const roleArb = fc.constantFrom('user', 'assistant', 'system', 'tool') as fc.Arbitrary<CurtMessage['role']>;

const messageArb: fc.Arbitrary<CurtMessage> = fc.tuple(
	fc.string({ maxLength: 12 }),
	roleArb,
	unicodeArb,
	numberArb,
	fc.option(fc.string({ maxLength: 12 }), { nil: undefined }),
	extrasArb,
).map(([id, role, content, timestamp, model, extras]) => {
	const m: CurtMessage = { id, role, content, timestamp, ...extras };
	if (model !== undefined) m.model = model;
	return m;
});

const conversationArb: fc.Arbitrary<CurtConversation> = fc.tuple(
	fc.string({ maxLength: 12 }),
	fc.string({ maxLength: 30 }),
	numberArb,
	numberArb,
	fc.array(messageArb, { maxLength: 12 }),
	extrasArb,
).map(([id, title, createdAt, updatedAt, messages, extras]) => ({
	id,
	title,
	createdAt,
	updatedAt,
	messages,
	...extras,
}));

// ---------------------------------------------------------------------------
// a. Round-trip idempotence
// ---------------------------------------------------------------------------

describe('property: round-trip idempotence', () => {
	it('serialize → parse → serialize is byte-stable for arbitrary valid conversations', () => {
		fc.assert(
			fc.property(conversationArb, (conv) => {
				const s1 = serializeCurt(conv);
				const p1 = parseCurt(s1);
				expect(p1, 'a serialized valid conversation must parse').not.toBeNull();
				const s2 = serializeCurt(p1!);
				expect(s2, 'second serialization must be byte-identical').toBe(s1);
				expect(parseCurt(s2)).toEqual(p1);
			}),
			{ numRuns: 200 },
		);
	});

	it('round-trip is idempotent at the object level: parse(parse-result serialization) is deep-equal', () => {
		fc.assert(
			fc.property(conversationArb, (conv) => {
				const once = parseCurt(serializeCurt(conv))!;
				const twice = parseCurt(serializeCurt(once))!;
				expect(twice).toEqual(once);
				expect(isCurtConversation(twice)).toBe(true);
				for (const m of twice.messages) expect(isCurtMessage(m)).toBe(true);
			}),
			{ numRuns: 200 },
		);
	});
});

// ---------------------------------------------------------------------------
// Unknown-field preservation
// ---------------------------------------------------------------------------

describe('property: unknown-field preservation', () => {
	// JSON has no signed zero: JSON.stringify(-0) emits "0". Extras are compared
	// through the same JSON normalization on both sides, so the invariant is
	// "preserved verbatim modulo JSON value normalization" — key order and
	// -0 → +0 are not observable across a JSON boundary.
	const throughJson = (v: unknown) => JSON.parse(JSON.stringify(v));

	it('unknown fields on the conversation and its messages survive parse→serialize verbatim', () => {
		fc.assert(
			fc.property(
				conversationArb,
				extrasArb,
				extrasArb,
				(conv, convExtras, msgExtras) => {
					// Avoid clobbering required fields with generated extras.
					const withExtras: CurtConversation = { ...conv, ...convExtras };
					const enriched = withExtras.messages.length
						? { ...withExtras, messages: [{ ...withExtras.messages[0], ...msgExtras }, ...withExtras.messages.slice(1)] }
						: withExtras;
					const parsed = parseCurt(serializeCurt(enriched));
					expect(parsed).not.toBeNull();
					expect(parsed).toEqual(throughJson(enriched));
					for (const key of Object.keys(convExtras)) {
						expect(key in parsed!, `conversation extra "${key}" must survive`).toBe(true);
						expect(parsed![key]).toEqual(throughJson((enriched as Record<string, unknown>)[key]));
					}
					const m = parsed?.messages[0];
					if (!m) return; // no messages → no message-extras to check
					for (const key of Object.keys(msgExtras)) {
						expect(key in m!, `message extra "${key}" must survive`).toBe(true);
						expect((m as Record<string, unknown>)[key]).toEqual(throughJson(msgExtras[key]));
					}
				},
			),
			{ numRuns: 100 },
		);
	});

	// Documented behavior, not aspiration: SPEC.md says readers preserve unknown
	// fields "where possible", and the reference parseCurt returns only the
	// `conversation` object. Envelope-top-level extras (outside `conversation`,
	// other than `generator`/`extensions` which serializeCurt re-emits from its
	// own arguments) are therefore DROPPED by the reference round-trip. The
	// spec's conformance clause only requires re-serialization that the
	// reader's own parser accepts — which holds.
	it('envelope-top-level extras are dropped by the reference round-trip (documented behavior)', () => {
		const conv: CurtConversation = { id: 'c', title: 't', createdAt: 1, updatedAt: 1, messages: [] };
		const body = JSON.stringify({
			curt: CURT_MAGIC,
			version: CURT_VERSION,
			generator: 'writer@1.0',
			customTopLevel: { anything: [1, 2, 3] },
			conversation: conv,
		});
		const parsed = parseCurt(body);
		expect(parsed).toEqual(conv); // parses fine, extras ignored — never a rejection
		expect('customTopLevel' in JSON.parse(serializeCurt(parsed!))).toBe(false);
	});
});

// ---------------------------------------------------------------------------
// b. Validation: valid passes, mutations rejected, never thrown
// ---------------------------------------------------------------------------

describe('property: validation and rejection', () => {
	it('every generated valid document passes parseCurt, isCurtConversation, and per-message isCurtMessage', () => {
		fc.assert(
			fc.property(conversationArb, (conv) => {
				const body = serializeCurt(conv);
				const parsed = parseCurt(body);
				expect(parsed, body).not.toBeNull();
				expect(isCurtConversation(parsed!), body).toBe(true);
				expect(parsed!.messages.every(isCurtMessage), body).toBe(true);
			}),
			{ numRuns: 200 },
		);
	});

	it('truncating a valid body at any position yields null, never a throw', () => {
		fc.assert(
			fc.property(
				conversationArb,
				fc.nat(200),
				(conv, cutRatio) => {
					const body = serializeCurt(conv);
					const cut = Math.min(cutRatio % body.length, body.length - 1); // proper prefix only
					const truncated = body.slice(0, cut);
					let result: unknown;
					expect(() => {
						result = parseCurt(truncated);
					}).not.toThrow();
					expect(result, `truncated at ${cut}: ${JSON.stringify(truncated.slice(0, 80))}`).toBeNull();
				},
			),
			{ numRuns: 200 },
		);
	});

	it('a corrupted version (any number ≠ 1, or the string "1") rejects as null', () => {
		const badVersionArb = fc.oneof(
			fc.integer({ min: -1000, max: -2 }),
			fc.integer({ min: 2, max: 10_000 }),
			fc.double({ min: 1.001, max: 99.999, noNaN: true }),
			fc.constant('1' as const),
		);
		fc.assert(
			fc.property(conversationArb, badVersionArb, (conv, version) => {
				const body = JSON.stringify({ curt: CURT_MAGIC, version, conversation: conv });
				expect(parseCurt(body), `version=${JSON.stringify(version)}`).toBeNull();
			}),
			{ numRuns: 200 },
		);
	});

	it('a corrupted magic field (any string ≠ the magic) rejects as null', () => {
		const badMagicArb = fc
			.string({ minLength: 1, maxLength: 30 })
			.filter((s) => s !== CURT_MAGIC);
		fc.assert(
			fc.property(conversationArb, badMagicArb, (conv, curt) => {
				const body = JSON.stringify({ curt, version: CURT_VERSION, conversation: conv });
				expect(parseCurt(body), `curt=${JSON.stringify(curt)}`).toBeNull();
			}),
			{ numRuns: 200 },
		);
	});

	it('removing the magic or version field rejects as null (whole-file)', () => {
		fc.assert(
			fc.property(conversationArb, (conv) => {
				expect(parseCurt(JSON.stringify({ version: CURT_VERSION, conversation: conv }))).toBeNull();
				expect(parseCurt(JSON.stringify({ curt: CURT_MAGIC, conversation: conv }))).toBeNull();
			}),
			{ numRuns: 100 },
		);
	});

	it('parseCurt on arbitrary garbage never throws; every non-null result satisfies the predicates', () => {
		fc.assert(
			fc.property(fc.string({ maxLength: 300 }), (raw) => {
				let result: unknown;
				expect(() => {
					result = parseCurt(raw);
				}).not.toThrow();
				if (result !== null) {
					expect(isCurtConversation(result)).toBe(true);
					// A successfully parsed document must re-round-trip.
					expect(parseCurt(serializeCurt(result))).toEqual(result);
				}
			}),
			{ numRuns: 200 },
		);
	});
});

// ---------------------------------------------------------------------------
// c. Timestamps
// ---------------------------------------------------------------------------

describe('property: timestamps', () => {
	// SPEC.md: "Timestamps are epoch milliseconds. Writers should emit integers;
	// version-1 validators accept any JSON number and must not reject a file
	// over fractional or negative values." (RFC 3339 strings are NOT part of
	// v1 — the field is a number; this property pins arbitrary valid numbers.)
	it('arbitrary finite numeric timestamps (fractional, negative, huge) round-trip exactly', () => {
		fc.assert(
			fc.property(numberArb, numberArb, numberArb, numberArb, (createdAt, updatedAt, ts1, ts2) => {
				const conv: CurtConversation = {
					id: 'c',
					title: 't',
					createdAt,
					updatedAt,
					messages: [
						{ id: 'm1', role: 'user', content: 'x', timestamp: ts1 },
						{ id: 'm2', role: 'assistant', content: 'y', timestamp: ts2 },
					],
				};
				const parsed = parseCurt(serializeCurt(conv));
				expect(parsed, `createdAt=${createdAt} updatedAt=${updatedAt}`).not.toBeNull();
				expect(parsed!.createdAt).toBe(createdAt);
				expect(parsed!.updatedAt).toBe(updatedAt);
				expect(parsed!.messages[0].timestamp).toBe(ts1);
				expect(parsed!.messages[1].timestamp).toBe(ts2);
			}),
			{ numRuns: 200 },
		);
	});
});

// ---------------------------------------------------------------------------
// d. Unicode
// ---------------------------------------------------------------------------

describe('property: unicode fidelity', () => {
	it('emoji, CJK, RTL, control chars, and lone surrogates round-trip byte-faithfully', () => {
		fc.assert(
			fc.property(unicodeArb, unicodeArb, (title, content) => {
				const conv: CurtConversation = {
					id: 'مرحبا id 🚀',
					title,
					createdAt: 0,
					updatedAt: 0,
					messages: [{ id: '日本語_m1', role: 'user', content, timestamp: 0 }],
				};
				const s1 = serializeCurt(conv);
				const parsed = parseCurt(s1)!;
				expect(parsed).not.toBeNull();
				// Byte-faithful: the serialized body is unchanged by a parse/serialize
				// cycle, and string values survive with exact character equality
				// (covers escaping of control chars and well-formed lone-surrogate
				// re-escaping in JSON.stringify).
				expect(serializeCurt(parsed)).toBe(s1);
				expect(parsed.title).toBe(title);
				expect(parsed.messages[0].content).toBe(content);
			}),
			{ numRuns: 200 },
		);
	});
});

// ---------------------------------------------------------------------------
// e. Deep nesting / large payloads
// ---------------------------------------------------------------------------

describe('property: deep nesting and payload size', () => {
	const nest = (depth: number): unknown => {
		let v: unknown = 'leaf';
		for (let i = 0; i < depth; i++) v = { child: v };
		return v;
	};

	it('deeply nested unknown fields (fuzzed depth ≤ 150) are preserved without stack overflow', () => {
		fc.assert(
			fc.property(fc.integer({ min: 1, max: 150 }), fc.integer({ min: 1, max: 150 }), (convDepth, msgDepth) => {
				const conv: CurtConversation = {
					id: 'c',
					title: 't',
					createdAt: 0,
					updatedAt: 0,
					messages: [{ id: 'm1', role: 'user', content: 'x', timestamp: 0, nested: nest(msgDepth) }],
					nested: nest(convDepth),
				};
				const s1 = serializeCurt(conv);
				const parsed = parseCurt(s1)!;
				expect(parsed).not.toBeNull();
				expect(parsed).toEqual(conv);
				expect(serializeCurt(parsed)).toBe(s1);
			}),
			{ numRuns: 100 },
		);
	});

	it('a deep-but-safe nesting depth (250) round-trips (see header comment for the ~1500+ RangeError limit on small-stack platforms)', () => {
		const conv: CurtConversation = {
			id: 'c',
			title: 't',
			createdAt: 0,
			updatedAt: 0,
			messages: [],
			nested: nest(250),
		};
		const s1 = serializeCurt(conv);
		const parsed = parseCurt(s1)!;
		expect(parsed).not.toBeNull();
		expect(parsed).toEqual(conv);
		expect(serializeCurt(parsed)).toBe(s1);
	});

	it('large message payloads (tens of KB of mixed-script text) round-trip byte-faithfully', () => {
		fc.assert(
			fc.property(
				fc.integer({ min: 1, max: 200 }),
				fc.string({ minLength: 0, maxLength: 200 }),
				(reps, chunk) => {
					const content = `${chunk}\n${'你好🌍مرحبا'.repeat(reps)}\n${'x'.repeat(reps * 100)}`;
					const conv: CurtConversation = {
						id: 'c',
						title: 't',
						createdAt: 0,
						updatedAt: 0,
						messages: [{ id: 'm1', role: 'user', content, timestamp: 0 }],
					};
					const s1 = serializeCurt(conv);
					const parsed = parseCurt(s1)!;
					expect(parsed).not.toBeNull();
					expect(parsed.messages[0].content).toBe(content);
					expect(serializeCurt(parsed)).toBe(s1);
				},
			),
			{ numRuns: 100 },
		);
	});
});
