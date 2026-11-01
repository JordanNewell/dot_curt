---
id: curt-vcon
title: "curt-vcon"
description: "Bidirectional .curt ⇄ vCon (IETF) bridge — library and CLI, npm curt-vcon."
---

# `curt-vcon`

A bridge converter between two conversation containers: **.curt** (the
open single-file AI-conversation format) and **vCon** (the IETF
Virtualized Conversation container, draft-ietf-vcon-vcon-core-05).

- **Repo:** [github.com/JordanNewell/curt-vcon](https://github.com/JordanNewell/curt-vcon)
- **npm:** [`curt-vcon@1.0.1`](https://www.npmjs.com/package/curt-vcon) (MIT)
- **Role:** read + write (bridge)
- **Depends on:** [`curt-format`](https://www.npmjs.com/package/curt-format)
  — parsing and serialization come from the reference; nothing is
  reimplemented.

## What it is

A bridge, not a unification. vCon targets real-time conversations between
people — call recordings, transcriptions, call-center sessions, signaling
metadata. .curt targets AI conversations — user/assistant/system/tool
turns with model provenance. The converter maps the overlapping text
subset (timestamped text turns attributable to an originator) and is
lossy everywhere else; its fidelity matrix states exactly what is
preserved, degraded, or dropped. It makes no normative claims about
either format.

## Install

```sh
npm install curt-vcon        # library
npm install -g curt-vcon     # CLI
```

## CLI

```sh
curt-vcon to-vcon in.curt > out.vcon.json
curt-vcon to-curt in.vcon.json > out.curt
```

Exit code 1 with a stderr message on invalid input; exit 2 on usage
errors. Output goes to stdout only.

## Library

```ts
import { parseCurt, serializeCurt } from 'curt-format';
import { curtToVcon, vconToCurt, type Vcon } from 'curt-vcon';

const curt = parseCurt(curtFileText)!;
const vcon: Vcon = curtToVcon(curt);

const back = vconToCurt(vcon); // CurtConversation | null
```

Notable mapping behaviors: the .curt conversation id becomes a
deterministic UUIDv5 (one-way — vCon core has no free-form top-level
metadata field to carry it back); message `model` and envelope extras are
dropped; vCon recording/incomplete/external dialogs are skipped in the
vCon→.curt direction. Field names were verified against draft
-05; the draft is pre-RFC and evolving, so the mapping tracks it.

## Where to go deeper

The repo README carries the full field-mapping tables in both directions,
the fidelity matrix, the documented spec-level mismatches, and open
questions for the vCon working group:
[github.com/JordanNewell/curt-vcon](https://github.com/JordanNewell/curt-vcon).
