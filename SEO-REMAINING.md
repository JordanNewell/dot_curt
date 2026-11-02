# SEO — remaining work for a human

Status after the 2026-11-02 agent pass: technical SEO (titles, meta
descriptions, canonicals, OG/Twitter cards, JSON-LD, llms.txt /
llms-full.txt, sitemaps, robots.txt) is done on **dotcurt.org** and
**docs.dotcurt.org**. What is left needs dashboard access or account
verification this repo's automation does not have.

## Human checklist (do once)

### 1. Google Search Console — both properties
- Add **two** properties: `https://dotcurt.org/` (Domain or URL-prefix)
  and `https://docs.dotcurt.org/` (URL-prefix — it is a separate host, a
  dotcurt.org property does NOT cover it).
- Verify each (DNS TXT via Cloudflare is easiest for the apex; docs
  subdomain needs its own verification — a CNAME/TXT on
  `docs.dotcurt.org`).
- Submit sitemaps: `https://dotcurt.org/sitemap.xml` and
  `https://docs.dotcurt.org/sitemap.xml` (both exist and are valid).
- Request indexing for the 10 key URLs after the www redirect lands (see
  §3): the 9 main-site URLs plus
  `https://docs.dotcurt.org/docs/guides/export-chats/`.

### 2. Bing Webmaster Tools
- Sign in **with the Google account** (imports GSC properties + sitemaps).
  Bing powers DuckDuckGo/Yahoo and feeds Copilot/ChatGPT browsing more
  than Google does — for AI-answer presence this is the higher-leverage
  half. Do both hosts.

### 3. Cloudflare dashboard — www → apex redirect (rulesets API token lacks scope)
Zone `dotcurt.org` → Rules → Redirect Rules → Create rule:

- **Rule name:** `www to apex`
- **When incoming requests match:** Custom filter expression
  ```
  (http.host eq "www.dotcurt.org")
  ```
- **Then:** Dynamic redirect
  - Expression: `concat("https://dotcurt.org", http.request.uri.path)`
  - Status code: **301**
  - ✓ Preserve query string (if the toggle is present)

This kills the duplicate-host problem at the edge; until then every page
already carries `<link rel="canonical">` pointing at the apex, so the
redirect is hygiene, not urgency. Same treatment for
`www.docs.dotcurt.org` is unnecessary (that host does not resolve).

### 4. Analytics decision (optional, blocking nothing)
- No analytics is installed today (deliberate, zero-JS static site).
- If wanted: Plausible (small script, privacy-safe, no consent banner)
  beats GA here given the site's privacy posture; add the one `<script
  defer>` line to the 9 main-site pages + Docusaurus `headTags` in
  `website/docusaurus.config.js`. Decide and move on — rankings do not
  depend on it.

## Agent-pass summary (2026-11-02)

Done and verified on prod after deploy:

- Unique `<title>` + `<meta name="description">` on all 9 main-site
  pages; canonical → apex on every page; full OG + Twitter card set.
- JSON-LD: `SoftwareApplication` + `WebSite` (index), `Article` +
  `AudioObject` PT34M29S (listen), `FAQPage` (12 Q&As, docs FAQ),
  `TechArticle` (docs spec + conformance), `BreadcrumbList` (all docs,
  Docusaurus-native).
- `https://dotcurt.org/llms.txt` and `/llms-full.txt` (llmstxt.org
  convention); docs host already had its own llms.txt, now updated with
  the guide.
- New guide: `https://docs.dotcurt.org/docs/guides/export-chats/` —
  in docs sidebar + landing grid + sitemap.
- FAQ expanded with query-language Q&As (export ChatGPT/Claude, export
  formats, provider switching, open format, GDPR portability).
- Docs generators fixed: GENERATED banner no longer precedes YAML
  frontmatter (was silently killing title/description on /docs/spec and
  /docs/status).
- IndexNow pinged (key file `site/ef4d0778a0ef7e4956c3479054ec32a1.txt`).

## 30-day re-check list (~2026-12-02)

1. GSC: coverage of the 9 main URLs + the guide (indexed? canonical
   chosen = apex, not www?). www redirect verified:
   `curl -sI https://www.dotcurt.org/` → 301 → apex.
2. Search `export ChatGPT conversations`, `export Claude conversations`,
   `AI chat history format`, `conversation archive format`,
   `GDPR AI chat portability` — is dotcurt.org or docs.dotcurt.org in
   the top 20? Any AI-assistant (Perplexity/Copilot/ChatGPT search)
   citations of dotcurt.org?
3. Rich results: run the guide/FAQ URLs through Google's Rich Results
   Test (FAQPage + TechArticle) — needs no account.
4. Bing: same query set; confirm sitemaps ingested.
5. Re-ping IndexNow after any content change
   (`https://api.indexnow.org/indexnow`, key file already hosted).
6. Backlinks: the preprint DOI (Zenodo) and arXiv mirror (when endorsed)
   are the only external signals — link them to
   https://dotcurt.org/ once arXiv lands.
7. Check `site:dotcurt.org` and `site:docs.dotcurt.org` in Bing/Google —
   all 9 + 26 pages known and none of www.* indexed as separate hosts.
