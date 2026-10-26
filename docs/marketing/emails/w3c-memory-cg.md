# Note draft — W3C AI Agent Memory Interoperability Community Group

- To: the CG's public mailing list
- Re: chartered June 2026; the paper notes the group has produced no file format
- Body: about 120 words

**Subject:** a conformance-first file format for the conversation-archive slot

---

To the AI Agent Memory Interoperability Community Group,

A note from outside. The conversation-archive slot your charter (June 2026) touches — durable, portable records of agent conversations — has no file format in the group's output or, as far as the survey behind a paper I wrote could find, anywhere else.

I maintain .curt: an MIT single-file format for AI conversations, spec v1 frozen core, 27 executable conformance vectors (L1 CORE must through L4 per-extension) run in CI, so "conforming" is a testable claim rather than an assertion. Site: https://dotcurt.org. Code: https://github.com/JordanNewell/dot_curt.

I would value the group's critique of the tiered-vector approach in particular — grading implementation claims by executable level instead of prose. The paper is at {{ARXIV_URL}}.

Jordan Newell
.curt maintainer
https://dotcurt.org
