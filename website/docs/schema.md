---
id: schema
slug: schema
title: JSON Schema
description: "The non-normative draft-07 schema for .curt v1 — for editors, linters, and third-party tooling."
---

# JSON Schema

[`schema/curt-v1.schema.json`](https://github.com/JordanNewell/dot_curt/blob/main/schema/curt-v1.schema.json)
is a **non-normative** draft-07 rendering of the version-1 validation rules,
for editors, linters, and third-party tooling.

Its non-normativity is deliberate and stated: SPEC.md is the norm, and the
reference implementation (`parseCurt`) is the arbiter when prose and schema
disagree. A schema alone cannot express whole-file rejection semantics or
round-trip obligations. Unknown fields are intentionally unconstrained —
readers must not fail on them.

The schema ships inside the npm package and is tested to agree with
`parseCurt`:

```
curt-format/schema/curt-v1.schema.json
```

## Validate your file

The schema is draft-07; any compliant validator works. With `ajv` (the
validator the reference repo itself tests against):

```ts
import Ajv from 'ajv';
import schema from 'curt-format/schema/curt-v1.schema.json';

const ajv = new Ajv();
const validate = ajv.compile(schema);

const file = JSON.parse(fs.readFileSync('convo.curt', 'utf8'));
if (!validate(file)) {
	// invalid — reject the whole file, never half-import
	console.error(validate.errors);
}
```

Passing the schema is a convenience check, not a conformance claim. The
normative bar is the [validation rules](/docs/spec) applied by `parseCurt`,
and the testable bar is the
[conformance vectors](/docs/conformance) — L1 CORE is what "supports
.curt" means.
