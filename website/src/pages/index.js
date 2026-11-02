import React from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import InstallCommand from '../components/InstallCommand';

const SECTIONS = [
  {
    num: '01',
    title: 'Spec',
    to: '/docs/spec',
    body: 'The normative v1 spec: the envelope, validation rules, and what every conforming reader owes you.',
  },
  {
    num: '02',
    title: 'Extensions',
    to: '/docs/extensions',
    body: 'The named-capability registry — grows by extension, not by version. Five entries, draft to stable.',
  },
  {
    num: '03',
    title: 'Conformance',
    to: '/docs/conformance',
    body: 'The L1–L4 ladder: executable vectors, self-reported claims, reproducible grades. 27 vectors.',
  },
  {
    num: '04',
    title: 'API',
    to: '/docs/api',
    body: 'The reference implementation: parseCurt, serializeCurt, curtFilename, the predicates, the constants.',
  },
  {
    num: '05',
    title: 'Ecosystem',
    to: '/docs/ecosystem',
    body: 'Who reads and writes .curt today — the capability matrix and the eleven implementations behind it.',
  },
  {
    num: '06',
    title: 'Guides',
    to: '/docs/guides/export-chats',
    body: 'Exporting AI conversations: what ChatGPT, Claude, and Gemini exports contain, what breaks, and how .curt fits.',
  },
  {
    num: '07',
    title: 'FAQ',
    to: '/docs/faq',
    body: 'Exporting your chats, the magic string, the BOM, zip bulk, why not vCon, and the license split — stated plainly.',
  },
];

function SectionCards() {
  return (
    <section className="lp-sections container">
      <h2>Start here.</h2>
      <div className="lp-grid">
        {SECTIONS.map((s) => (
          <Link key={s.to} to={s.to} className="lp-card">
            <h3>
              <span className="lp-card-num">{s.num}</span>
              {s.title}
            </h3>
            <p>{s.body}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}

function NotYet() {
  return (
    <div className="container">
      <aside className="lp-not-yet">
        <span className="ny-label">Not yet — stated plainly</span>
        <p>
          The five original application readers still vendor or hand-roll the
          rules instead of depending on the <code>curt-format</code> package,
          so a spec revision still lands in five places by hand.
        </p>
        <p>
          The 1.1.0 BOM tolerance is unimplemented in the five original
          application readers, and their filename conventions compete with the
          spec's <code>curtFilename</code>.
        </p>
        <p>
          Bindings beyond TypeScript. The predicates are small — Rust, Python,
          Go, Swift: pick one and keep it in lockstep with SPEC.md. PRs to{' '}
          <a href="https://github.com/JordanNewell/dot_curt">dot_curt</a> are
          welcome.
        </p>
      </aside>
    </div>
  );
}

export default function Home() {
  return (
    <Layout
      title="the open file format for AI conversations"
      description=".curt is an open, MIT-licensed format for AI chat conversations: one UTF-8 JSON file per conversation, full fidelity, strict whole-file validation. Spec, extensions, conformance vectors, and converters."
    >
      <main>
        <header className="lp-hero container">
          <p className="lp-kicker">
            An open format for AI conversations —{' '}
            <b>spec v1 · curt-format@1.2.0 · MIT</b>
          </p>
          <h1>One file, one conversation, kept whole.</h1>
          <p className="lp-lede">
            A <code>.curt</code> file is UTF-8 JSON — the whole thread in one
            file. Images and tool calls ride verbatim, unknown fields survive
            foreign readers, and a corrupted file is rejected whole, never
            half-imported. Born in Curtis AI Chat, owned by no one.
          </p>

          <div className="lp-cta-row">
            <a className="button button--primary button--lg" href="https://dotcurt.org/try/">
              Try it — drop an export
            </a>
            <Link className="button button--secondary button--lg" to="/docs/spec">
              Read the spec
            </Link>
            <a
              className="button button--secondary button--lg"
              href="https://www.npmjs.com/package/curt-format"
              target="_blank"
              rel="noopener noreferrer"
            >
              curt-format on npm
            </a>
          </div>

          <InstallCommand />
        </header>

        <div className="container">
          <ul className="lp-vitals" aria-label="The checkable claims">
            <li>
              <span className="k">CI</span>
              <a
                href="https://github.com/JordanNewell/dot_curt/actions/workflows/ci.yml"
                aria-label="Conformance CI status on GitHub Actions"
              >
                <img
                  src="https://img.shields.io/github/actions/workflow/status/JordanNewell/dot_curt/ci.yml?branch=main&label=conformance&logo=github"
                  alt="CI status"
                  height="20"
                />
              </a>
            </li>
            <li>
              <span className="k">npm</span>
              <a
                href="https://www.npmjs.com/package/curt-format"
                aria-label="curt-format on npm"
              >
                <img
                  src="https://img.shields.io/npm/v/curt-format?logo=npm&color=b8900a"
                  alt="curt-format npm version"
                  height="20"
                />
              </a>
            </li>
            <li>
              <span className="k">conformance</span>
              <a href="/docs/conformance">27 vectors · MIT</a>
            </li>
            <li>
              <span className="k">x</span>
              <a
                href="https://x.com/curtformat"
                target="_blank"
                rel="noopener noreferrer"
              >
                x/@curtformat
              </a>
            </li>
          </ul>
        </div>

        <SectionCards />
        <NotYet />
      </main>
    </Layout>
  );
}
