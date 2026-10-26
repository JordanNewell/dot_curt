# Email draft — Daniel Gines, PAM (Portable AI Memory) maintainer

- Re: PAM v1.0, treated in the .curt paper as the most serious peer effort
- Body: about 160 words

**Subject:** a conversations-first counterpart to PAM — cross-link or interop note?

---

Hello Daniel,

I maintain .curt, a single-file format for AI chat conversations. A paper I wrote ({{ARXIV_URL}}) treats PAM as the most serious peer effort, and means it: a named maintainer, published governance and semver policy, Ed25519 signatures, W3C DIDs, RFC 8785 canonicalization, and shipped importers for OpenAI, Anthropic, and xAI exports. That combination does not exist elsewhere in the landscape we surveyed.

The distinction the paper draws is orientation. PAM is memory-first: conversations appear as an index plus companion files in service of a memory graph. .curt is conversations-first: one self-sufficient file per conversation, a frozen core, and 27 executable conformance vectors (L1 through L4) that make "conforming" a graded, testable claim rather than prose. Different questions, adjacent answers.

Would you be open to a cross-link between the projects, or a short interop note — for instance, what a PAM memory graph looks like when its source transcripts are .curt files?

Jordan Newell
.curt maintainer
https://dotcurt.org
