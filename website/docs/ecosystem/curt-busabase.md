---
id: curt-busabase
title: "curt-busabase"
description: "Busabase record review trails -> .curt — npm curt-busabase."
---

# `curt-busabase`

Converts **Busabase** record review trails — agent change requests, human
reviews, comments — into **.curt** single-file conversation files.

- **Repo:** [github.com/JordanNewell/curt-busabase](https://github.com/JordanNewell/curt-busabase)
- **npm:** [`curt-busabase@1.0.1`](https://www.npmjs.com/package/curt-busabase) (MIT)
- **Depends on:** [`curt-format`](https://www.npmjs.com/package/curt-format)
  — parsing and validation come from the reference; every converted file
  is round-trip checked before it is written.

## What it does

[Busabase](https://busabase.com) is an open-source (MIT) review database for
AI-agent content — the "system of record" category's fastest mover (#1
Product of the Day, Oct 2026). Agents submit change requests; humans review,
approve, and merge; both sides comment. That trail **is** a conversation, so
the converter preserves it as one instead of leaving it in the vendor's
schema.

Input is a directory of plain JSON from the REST API
(`busabase.com/api/v1/openapi.json`) — records, change requests, reviews,
comments. The CLI is offline and read-only: it never calls the API and never
reads credentials.

## Mapping

| Busabase | .curt |
|---|---|
| Record | conversation (`busabase_record_<hash>`; title from the head commit's primary field value) |
| Agent change request (`sourceAttribution.agent`) | assistant turn (agent client name as `model`) |
| Human-submitted change request | user turn |
| Review | user turn (`<reviewer> <verdict> the change request`) |
| Comment by human | user turn |
| Comment by agent | assistant turn |

Change requests link to records through explicit ids **and**
`mergeSummary.recordIds` (the bulk-create shape). Records pulled without
their CR list still convert from the head commit (message + field payload as
one fallback turn). Base id, record status, and trail counts ride on the
conversation's `busabase` extra.

## Position

A workspace is a schema you migrate out of later; a format is the exit.
This converter makes Busabase's own pitch — "agent work shouldn't be locked
in chat logs" — true for people who leave.

Part of the .curt converter suite — see the
[status page](/docs/status) for the registry entry.
