// round-trip.mts — the judge-proofing sample for dotcurt.org docs.
//
// A real TypeScript program that uses the published `curt-format` npm package
// exactly the way /docs/api teaches it: build a conversation, serialize,
// re-parse, and verify nothing was lost. Run by website/e2e/route-smoke.mjs
// via `node --experimental-strip-types` — if this stops compiling or stops
// round-tripping, the docs sample pipeline is broken and the deploy gate
// fails.
//
//   cd website && npm install curt-format
//   node --experimental-strip-types e2e/samples/round-trip.mts
import {
  parseCurt,
  serializeCurt,
  isCurtMessage,
  isCurtConversation,
  curtFilename,
  CURT_MAGIC,
  CURT_VERSION,
} from 'curt-format';
import type { CurtConversation, CurtMessage } from 'curt-format';

const messages: CurtMessage[] = [
  { id: 'm1', role: 'user', content: 'Hello, .curt!', timestamp: 1761900000000 },
  {
    id: 'm2',
    role: 'assistant',
    content: 'Kept whole — one file, one conversation.',
    timestamp: 1761900001000,
    model: 'sample-model/1',
  },
];

const conversation: CurtConversation = {
  id: 'sample_abc12345',
  title: 'Round-trip Sample',
  createdAt: 1761900000000,
  updatedAt: 1761900001000,
  messages,
  // Unknown fields must survive the round-trip verbatim.
  exportedBy: 'route-smoke',
};

// Serialize exactly as /docs/api documents (generator stamp + one extension).
const body: string = serializeCurt(conversation, 'dotcurt-e2e@1.0.0', ['usage-metadata']);

const back = parseCurt(body);
if (!back) throw new Error('parseCurt rejected a body serializeCurt just wrote');
if (!isCurtMessage(messages[0])) throw new Error('isCurtMessage rejected a spec-valid message');
if (!isCurtConversation(back)) throw new Error('isCurtConversation rejected the round-trip');

// Envelope: the magic string and version constants must be the live ones.
const envelope = JSON.parse(body) as { curt: string; version: number };
if (envelope.curt !== CURT_MAGIC || envelope.curt !== 'curtis-conversation') {
  throw new Error(`envelope magic drifted: ${envelope.curt}`);
}
if (envelope.version !== CURT_VERSION || envelope.version !== 1) {
  throw new Error(`envelope version drifted: ${envelope.version}`);
}

// Fidelity: content, unknown field, and extension declaration survive.
if (back.messages[1].content !== messages[1].content) {
  throw new Error('message content lost in round-trip');
}
if ((back as Record<string, unknown>).exportedBy !== 'route-smoke') {
  throw new Error('unknown field not preserved in round-trip');
}
const declared = (JSON.parse(body) as { extensions?: string[] }).extensions;
if (!Array.isArray(declared) || declared[0] !== 'usage-metadata') {
  throw new Error('extensions declaration not preserved');
}

// BOM tolerance: a single leading UTF-8 BOM parses fine (spec 1.1.0 rule).
if (!parseCurt('﻿' + body)) throw new Error('BOM-prefixed body failed to parse');

// Recommended file name derives from immutable fields only.
const name = curtFilename(back);
if (!name.endsWith('.curt')) throw new Error(`curtFilename produced ${name}`);
if (name !== '2025-10-31 round-trip-sample abc12345.curt') {
  throw new Error(`curtFilename drifted: ${name}`);
}

console.log(`sample OK: ${body.length} bytes -> "${name}"`);
