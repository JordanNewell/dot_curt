# .curt Conformance

An implementation claims a level by passing its vectors. Vectors are plain
JSON in [`vectors/`](vectors/); the reference implementation executes them in
CI (`tests/conformance.test.ts`) — if your parser accepts what those vectors
accept and rejects what they reject, you match the level.

| Level | Name | Requirement | Obligation |
|---|---|---|---|
| L1 | CORE | Parse/serialize v1: magic + `version` exact-match; whole-file rejection; single leading UTF-8 BOM tolerated; unknown fields preserved on round-trip; any JSON-number timestamps accepted | MUST for "conforming" |
| L2 | NAMED | `curtFilename` implements the `<date> <slug> <suffix>.curt` algorithm exactly | SHOULD |
| L3 | BULK | Zip-of-`.curt` convention; entry names from `curtFilename`; readers never depend on names; corrupted entries reported (not silently dropped), valid ones imported | MAY |
| L4+ | Extension | Each extension's vectors in `vectors/extensions.json` | MAY |

## Vectors

- `vectors/core.json` — L1. `vectors[].body` is a raw file body string;
  `expect` is `"accept"` or `"reject"`.
- `vectors/named.json` — L2. `vectors[].conversation` is the input;
  `expect` is the exact filename.
- `vectors/bulk.json` — L3. Rules plus a canonical example; zip-level
  behavior is asserted by rule, not binary fixture.
- `vectors/extensions.json` — extensions. All cases are `accept`: extension
  presence (or malformation) must never cause rejection.

## Claiming conformance

1. Run your implementation against the vectors.
2. Update your row in [`../capabilities.json`](../capabilities.json):
   `conformanceLevel` (e.g. `"L1"`, `"L1+L2"`), `extensions` (names you
   emit/accept), `lastAudited`.
3. Link the run (CI job or script) in your repo — claims are self-reported
   but must be reproducible from the vectors.
