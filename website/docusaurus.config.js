// @ts-check
// dotcurt.org — docs environment config. Route map is the contract in
// docs/superpowers/specs/2026-11-01-dotcurt-docs-env-design.md.

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: '.curt — the conversation format',
  tagline: 'One file, one conversation, kept whole.',
  url: 'https://dotcurt.org',
  baseUrl: '/',
  // 'warn' (not 'throw'): /adopt /try /viewer /posts /paper /listen are
  // carried static HTML pages under static/ — the broken-link checker only
  // knows Docusaurus routes, so it would false-throw on them. External link
  // validation for those is e2e's job (website/e2e).
  onBrokenLinks: 'warn',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/favicon.svg',
  organizationName: 'JordanNewell',
  projectName: 'dot_curt',
  trailingSlash: true,

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          routeBasePath: 'docs',
          includeCurrentVersion: true,
          sidebarPath: require.resolve('./sidebars.js'),
          editUrl: 'https://github.com/JordanNewell/dot_curt/edit/main/website/',
        },
        blog: false,
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      }),
    ],
  ],

  themes: [
    [
      require.resolve('@easyops-cn/docusaurus-search-local'),
      /** @type {import('@easyops-cn/docusaurus-search-local').Options} */
      ({
        hashed: true,
        indexDocs: true,
        indexBlog: false,
        indexPages: false,
        docsRouteBasePath: '/docs',
        language: ['en'],
        highlightSearchTermsOnTargetPage: true,
      }),
    ],
  ],

  headTags: [
    {
      tagName: 'meta',
      attributes: {
        name: 'theme-color',
        content: '#0A0A0A',
      },
    },
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      colorMode: {
        defaultMode: 'dark',
        disableSwitch: false,
        respectPrefersColorScheme: true,
      },
      metadata: [
        {
          name: 'description',
          content:
            '.curt is an open, MIT-licensed format for AI chat conversations: one UTF-8 JSON file per conversation, full fidelity, strict whole-file validation.',
        },
        { property: 'og:site_name', content: '.curt' },
        { property: 'og:type', content: 'website' },
        { name: 'twitter:card', content: 'summary' },
      ],
      navbar: {
        title: '.curt',
        hideOnScroll: false,
        items: [
          { to: '/docs/spec', label: 'Docs', position: 'left' },
          { to: '/docs/ecosystem', label: 'Ecosystem', position: 'left' },
          { to: '/docs/conformance', label: 'Conformance', position: 'left' },
          { to: '/adopt/', label: 'Adopt', position: 'left' },
          { to: '/try/', label: 'Try', position: 'left' },
          { to: '/viewer/', label: 'Viewer', position: 'left' },
          {
            href: 'https://github.com/JordanNewell/dot_curt',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        copyright: `.curt — the conversation format · MIT · v1`,
        links: [
          {
            label: 'spec',
            to: '/docs/spec',
          },
          {
            label: 'registry',
            to: '/docs/extensions',
          },
          {
            label: 'npm',
            href: 'https://www.npmjs.com/package/curt-format',
          },
          {
            label: 'github',
            href: 'https://github.com/JordanNewell/dot_curt',
          },
          {
            label: 'x/@curtformat',
            href: 'https://x.com/curtformat',
          },
          {
            html: `born in <a href="https://github.com/JordanNewell/curtis-ai-chat" target="_blank" rel="noopener noreferrer">Curtis AI Chat</a> · <a href="https://www.curtisai.tech/curt/" target="_blank" rel="noopener noreferrer">curtisai.tech/curt</a>`,
          },
        ],
      },
      prism: {
        additionalLanguages: ['json', 'bash', 'typescript'],
      },
    }),
};

module.exports = config;
