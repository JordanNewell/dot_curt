# Security Policy

## Supported versions

Only the latest release of the `curt-format` package receives security
updates.

## Reporting a vulnerability

Email **security@jordannewell.com** with:

- A description of the issue and its impact
- Reproduction steps (a minimal example is ideal)
- Affected version — run `npm ls curt-format`

**Do not open a public GitHub issue** for security reports.

## Response timeline

- **Acknowledgment:** within 72 hours
- **Initial assessment:** within 5 business days
- **Fix or mitigation:** target 30 days for high-severity issues

Please refrain from public disclosure until a fix has been published, to
protect downstream users. Reporters will be credited in the release notes
unless they prefer otherwise.

## Scope

**In scope:**

- The reference implementation (`src/`)
- The JSON schema (`schema/`)
- The parser/serializer round-trip guarantees described in SPEC.md
- The npm package build and published artifacts

**Out of scope:**

- Third-party implementations of the .curt format — report upstream
- Vulnerabilities in development tooling that never ships to consumers
  (test runners, site build) unless they affect the published package
- Content of conversations encoded in .curt files
