// Sidebar — mirrors the route contract exactly:
// spec, extensions (+5 children), conformance, api, ecosystem (+5 tool
// children), governance, comparison, faq, schema, changelog, spec-terms.

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  docs: [
    'spec',
    {
      type: 'category',
      label: 'Extensions',
      link: { type: 'doc', id: 'extensions/extensions' },
      collapsed: false,
      items: [
        'extensions/images-inline',
        'extensions/usage-metadata',
        'extensions/tool-linkage',
        'extensions/agent-context',
        'extensions/consensus-receipt',
      ],
    },
    'conformance',
    'api',
    {
      type: 'category',
      label: 'Ecosystem',
      link: { type: 'doc', id: 'ecosystem/ecosystem' },
      collapsed: false,
      items: [
        'ecosystem/curt-vcon',
        'ecosystem/curt-convert',
        'ecosystem/curt-wildchat',
        'ecosystem/curt-openwith',
        'ecosystem/curt-openwebui',
      ],
    },
    'governance',
    'comparison',
    'faq',
    'schema',
    'changelog',
    'spec-terms',
  ],
};

module.exports = sidebars;
