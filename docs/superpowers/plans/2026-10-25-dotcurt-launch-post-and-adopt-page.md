# dotcurt.org Launch Post + Adopt Page — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a launch post (`/posts/2026-10-25-one-file/`) and an adopt-the-standard product page (`/adopt/`) to the static site at `site/`, sharing the existing design language.

**Architecture:** Zero-build Cloudflare Workers static-assets site. Extract the shared stylesheet from `index.html` into `site/style.css`, add two self-contained HTML pages that link it, extend the index nav. Relative links only. Spec: `docs/superpowers/specs/2026-10-25-dotcurt-launch-post-and-adopt-page-design.md` (binding).

**Tech Stack:** Plain HTML + CSS (no framework, no build). Deploy via existing wrangler-action CI. Verification = local `http.server` + curl assertions + headless-Chrome screenshots (no unit tests exist for site content; TDD does not apply to prose pages).

**Working directory:** `E:\dev\projects\dot_curt` (solo repo, house pattern = commit straight to `main`, conventional commits, hooks run gitleaks).

**Design vocabulary in use (from `site/index.html` — reuse, don't invent):** `.wrap`, `.site-head`, `.wordmark` (`.dot`), `.site-nav`, `.hero`, `.kicker`, `.lede`, `.cta-row`, `.cta`, `.cta-quiet`, `.section`, `.label`, `.muted.small`, `.rules` (ol), `.records` (table, `.req` td), `.table-wrap`, `pre.dark`, code spans `.k .s .n .c`, `.install` (`.ps`), `.folder` (`.folder-tab`, `.folder-body`, `.f-head`, `.f-sub`, `.f-row` `.k`/`.v`/`.f-ok`), `.stamp`.

---

### Task 1: Extract shared stylesheet to `site/style.css`

**Files:**
- Create: `site/style.css`
- Modify: `site/index.html:1-20` (style block is lines 18–479)

- [ ] **Step 1: Move the CSS**

```bash
cd /e/dev/projects/dot_curt
# lines 18..479 are <style>...</style>; strip the tags, keep the CSS
sed -n '19,478p' site/index.html > site/style.css
```

- [ ] **Step 2: Replace the inline block with a link**

In `site/index.html`, delete lines 18–479 (the `<style>` … `</style>` block) and insert in its place:

```html
	<link rel="stylesheet" href="style.css">
```

- [ ] **Step 3: Verify no regressions locally**

```bash
python -m http.server 8123 --directory site &
sleep 1
curl -s http://localhost:8123/ | grep -c 'stylesheet'
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8123/style.css
```

Expected: `1` and `200`. Also confirm `site/index.html` still contains `</html>` and the hero copy (`grep -c "kept whole" site/index.html` → `1`).

- [ ] **Step 4: Commit**

```bash
git add site/style.css site/index.html
git commit -m "site: extract shared stylesheet to style.css"
```

---

### Task 2: Launch post page

**Files:**
- Create: `site/posts/2026-10-25-one-file/index.html`

- [ ] **Step 1: Create the page**

Scaffolding: copy `<header class="site-head">…</header>` and the `<footer>` from `site/index.html` verbatim (single source of truth for the chrome). Copy the `<head>` shape from index but with the title/description below and `<link rel="stylesheet" href="../../style.css">`. Add only the page-specific CSS shown.

Full page content (copy is binding — approved voice):

```html
<!doctype html>
<html lang="en">
<head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<meta name="color-scheme" content="light">
	<title>One file, one conversation, kept whole — the .curt launch</title>
	<meta name="description" content="The .curt launch post: an open, MIT-licensed single-file format for AI conversations. Spec v1 frozen, curt-format@1.2.0 on npm, 27 conformance vectors in CI.">
	<link rel="stylesheet" href="../../style.css">
	<style>
		.post-body { max-width: 62ch; }
		.post-body p { line-height: 1.65; }
		.post-meta { letter-spacing: .08em; text-transform: uppercase; }
	</style>
</head>
<body>
<header class="site-head">
	<!-- COPY the site-head block from site/index.html verbatim, then add: -->
	<!-- <a href="../../posts/">post</a> and <a href="../../adopt/">adopt</a> to .site-nav (Task 4 keeps pages consistent until then add both now) -->
</header>

<main class="wrap" id="top">
	<div class="hero">
		<p class="kicker post-meta">The launch post · 2026-10-25 · spec v1 · MIT</p>
		<h1>One file, one conversation, kept whole.</h1>
	</div>

	<section class="section post-body">
		<p>Every chat you've had with an AI lives in someone else's database, in a format you'll never see, behind an export button that flattens it. That never sat right with me. So I built the thing I wanted to exist: <strong>.curt</strong> — one UTF-8 file, one conversation, everything intact. Images, tool calls, the weird stuff — verbatim.</p>

		<p>Spec v1 is frozen. <code>curt-format@1.2.0</code> is on npm, MIT. Twenty-seven conformance vectors run in CI so &ldquo;compatible&rdquo; means something.</p>

		<p>Full disclosure: I built this in a vacuum. No consumers yet — that's not a humblebrag, it's the current score. If you build software where conversations matter, the format is free and the door's open.</p>

		<h2>What a .curt file is</h2>
		<p>A UTF-8 JSON envelope. Magic string, version, who wrote it, which extensions it uses, and the conversation: id, title, timestamps, messages — each with a role, content, and a time. Anything an app adds that the spec doesn't know about rides along untouched on re-save. That last part is a promise, not a courtesy.</p>

		<pre class="dark" aria-label="A minimal .curt envelope"><code>{
  <span class="k">"curt"</span>: <span class="s">"curtis-conversation"</span>,
  <span class="k">"version"</span>: <span class="n">1</span>,
  <span class="k">"generator"</span>: <span class="s">"your-app@1.2.3"</span>,
  <span class="k">"extensions"</span>: [<span class="s">"images-inline"</span>],
  <span class="k">"conversation"</span>: { <span class="k">"id"</span>: <span class="s">"conv_001"</span>, <span class="k">"messages"</span>: [ … ] }
}</code></pre>

		<h2>What shipped</h2>
		<ul class="rules">
			<li>The spec — frozen core, v1. New capability never means editing it; it means a registry entry.</li>
			<li><code>curt-format@1.2.0</code> — reference implementation on npm. MIT: spec, code, schema, fixtures.</li>
			<li>Twenty-seven conformance vectors — L1 CORE through L4 per-extension — executed in CI. Claiming support is testable.</li>
			<li>Five extensions: <code>images-inline</code> and <code>usage-metadata</code> stable; <code>tool-linkage</code>, <code>agent-context</code>, <code>consensus-receipt</code> draft.</li>
		</ul>

		<h2>The rules</h2>
		<p>The core doesn't move. If something's missing, it becomes a named extension — versioned, optional, and rejected cleanly by readers that don't know it. An extension goes draft → stable only when two independent implementations round-trip it. One author stamping their own work “stable” is how formats rot; I'm not doing that.</p>

		<h2>Where you come in</h2>
		<p>If you write software where conversations matter — a chat app, an agent runtime, an archive tool — make it speak .curt. It's an afternoon, the library handles the envelope, and the conformance vectors tell you when you're done. <a href="../../adopt/">The path is on the adopt page.</a> When you ship, you go in the registry — <code>capabilities.json</code>, public, checkable.</p>

		<p class="lede">The format is free. The file is yours.</p>
	</section>
</main>

<!-- COPY the footer from site/index.html verbatim -->
</body>
</html>
```

Note: nav links inside the copied header must use correct relative paths from this page's location (`../../adopt/`, `../../`, etc.) — fix them as part of the copy, don't leave anchors pointing at the index page.

- [ ] **Step 2: Verify locally**

```bash
curl -s http://localhost:8123/posts/2026-10-25-one-file/ | grep -c "vacuum"
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8123/posts/2026-10-25-one-file/
curl -s http://localhost:8123/posts/2026-10-25-one-file/ | grep -c 'stylesheet'
```

Expected: `1`, `200`, `1`.

- [ ] **Step 3: Commit**

```bash
git add site/posts/2026-10-25-one-file/index.html
git commit -m "site: launch post — one file, one conversation, kept whole"
```

---

### Task 3: Adopt page

**Files:**
- Create: `site/adopt/index.html`

- [ ] **Step 1: Create the page**

Same scaffolding rules as Task 2 (header/footer copied verbatim from `site/index.html`, relative nav paths fixed, `../../style.css`).

Full page content (facts from `capabilities.json` lastAudited 2026-10-17 and `EXTENSIONS.md` — re-read both files at build time; if they've changed since, update the tables):

```html
<!doctype html>
<html lang="en">
<head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<meta name="color-scheme" content="light">
	<title>Adopt .curt — make your app speak the format</title>
	<meta name="description" content="The four-step path to implementing .curt in your app: install curt-format, round-trip files, pass the conformance vectors, get listed in capabilities.json.">
	<link rel="stylesheet" href="../../style.css">
	<style>
		.path { counter-reset: step; }
		.path li { list-style: none; }
		.path .num::before { counter-increment: step; content: counter(step, decimal-leading-zero); }
	</style>
</head>
<body>
<header class="site-head">
	<!-- COPY from site/index.html verbatim, nav relative paths fixed -->
</header>

<main class="wrap" id="top">
	<div class="hero">
		<p class="kicker">Adopt the format — <b>curt-format@1.2.0 · MIT · 27 vectors in CI</b></p>
		<h1>Make your app speak .curt.</h1>
		<p class="lede">
			The format is free — the move is yours. One afternoon of work buys your
			users a conversation file that never loses anything and never goes stale.
		</p>
	</div>

	<section class="section" id="why">
		<h2>Why implement it</h2>
		<ul class="rules">
			<li>Full fidelity — base64 images and tool calls ride in content, verbatim. No flattening, no "best effort".</li>
			<li>Unknown fields survive a re-save. Your app's extras aren't a liability.</li>
			<li>One diffable UTF-8 file per conversation. Archives, version control, and grep all just work.</li>
			<li>MIT across the board — spec, reference code, schema, fixtures. (Curtis applications themselves are BUSL; the format never is.)</li>
		</ul>
	</section>

	<section class="section" id="path">
		<h2>The path</h2>
		<p class="muted small">Four steps. Conformance is testable at every one.</p>
		<ol class="path rules">
			<li><span class="num"></span> <b>Install.</b> <code>npm i curt-format</code> — <code>serializeCurt</code>, <code>parseCurt</code>, <code>curtFilename</code>.</li>
			<li><span class="num"></span> <b>Round-trip.</b> Serialize a conversation, parse it back, confirm unknown fields survive. That's the L1 bar.</li>
			<li><span class="num"></span> <b>Prove it.</b> Run the conformance vectors — L1 CORE, L2 NAMED, L3 BULK, L4 per-extension. 27 vectors, plain fixtures, CI-runnable.</li>
			<li><span class="num"></span> <b>Get listed.</b> PR against <code>capabilities.json</code> + <code>CAPABILITIES.md</code>: who you are, what you read/write, which extensions, conformance level. Public and checkable.</li>
		</ol>
		<div class="cta-row">
			<a class="cta" href="https://github.com/JordanNewell/dot_curt/tree/main/conformance">Conformance vectors</a>
			<a class="cta-quiet" href="https://www.npmjs.com/package/curt-format">curt-format on npm</a>
		</div>
	</section>

	<section class="section" id="registry">
		<h2>Registry status</h2>
		<p class="muted small">Consumers, from capabilities.json (lastAudited 2026-10-17):</p>
		<div class="table-wrap">
			<table class="records">
				<tr><th>id</th><th>role</th><th>read</th><th>write</th><th>conformance</th></tr>
				<tr><td>curtis</td><td>Obsidian plugin — import, export, full-backup zip</td><td>yes</td><td>yes</td><td class="req">none</td></tr>
				<tr><td>curtis-ai-chat-porter</td><td>Converter (CLI + Obsidian plugin + web)</td><td>yes</td><td>yes</td><td class="req">none</td></tr>
				<tr><td>curtis-web</td><td>Chat app — export single .curt + bulk zip</td><td>no</td><td>yes</td><td class="req">none</td></tr>
				<tr><td>curtis-cloud</td><td>Shared library — import/export serialization</td><td>yes</td><td>yes</td><td class="req">none</td></tr>
				<tr><td>curtis-ai-tech</td><td>Docs/marketing + Porter web app with inline preview</td><td>yes</td><td>yes</td><td class="req">none</td></tr>
				<tr><td>tractum</td><td>Python SDK + MCP server — signed consensus decisions</td><td>yes</td><td>yes</td><td class="req">none</td></tr>
			</table>
		</div>
		<p class="muted small">Six entries, one author. That's the honest score — the launch post doesn't pretend otherwise. First outside consumer sets the tone.</p>

		<p class="muted small">Extensions:</p>
		<div class="table-wrap">
			<table class="records">
				<tr><th>extension</th><th>status</th><th>what it carries</th></tr>
				<tr><td>images-inline</td><td>stable</td><td>base64 images in content, verbatim</td></tr>
				<tr><td>usage-metadata</td><td>stable</td><td>tokens / usage per message</td></tr>
				<tr><td>tool-linkage</td><td class="req">draft</td><td>tool calls linked to their results</td></tr>
				<tr><td>agent-context</td><td class="req">draft</td><td>agent/system context alongside the thread</td></tr>
				<tr><td>consensus-receipt</td><td class="req">draft</td><td>signed consensus decisions (tractum, sole impl)</td></tr>
			</table>
		</div>
		<p class="muted small">Draft → stable requires two independent implementations. consensus-receipt needs one more.</p>
	</section>

	<section class="section" id="faq">
		<h2>Questions, answered</h2>
		<ul class="rules">
			<li><b>Will the spec change under me?</b> No. Core is frozen at v1. Evolution is registry-only.</li>
			<li><b>Who decides?</b> One maintainer, BDFL. Deliberately — a format with six committees has no direction.</li>
			<li><b>What does draft mean for me?</b> Emit it if you want; readers must reject unknown extensions cleanly, so nothing breaks.</li>
			<li><b>License?</b> MIT — spec, implementation, schema, fixtures. Build a business on it if you like.</li>
		</ul>
	</section>
</main>

<!-- COPY the footer from site/index.html verbatim -->
</body>
</html>
```

- [ ] **Step 2: Verify facts against source at build time**

```bash
python -c "import json; d=json.load(open('capabilities.json')); print(d['lastAudited'], len(d['consumers']))"
grep -c '^### ' EXTENSIONS.md
```

Expected: `2026-10-17 6` and `5`. If either differs, update the tables before shipping.

- [ ] **Step 3: Verify locally**

```bash
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8123/adopt/
curl -s http://localhost:8123/adopt/ | grep -c "capabilities.json"
```

Expected: `200`, `2`.

- [ ] **Step 4: Commit**

```bash
git add site/adopt/index.html
git commit -m "site: adopt page — the path, registry status, FAQ"
```

---

### Task 4: Index nav + cross-links

**Files:**
- Modify: `site/index.html` (`.site-nav` block, ~lines 466–470)

- [ ] **Step 1: Add nav links**

In the `.site-nav` block, insert before the github link:

```html
			<a href="adopt/">adopt</a>
			<a href="posts/2026-10-25-one-file/">post</a>
```

- [ ] **Step 2: Verify**

```bash
curl -s http://localhost:8123/ | grep -c 'href="adopt/"'
curl -s http://localhost:8123/ | grep -c 'href="posts/2026-10-25-one-file/"'
```

Expected: `1`, `1`.

- [ ] **Step 3: Commit**

```bash
git add site/index.html
git commit -m "site: nav — adopt + launch post links"
```

---

### Task 5: Local QA — screenshots + link check

**Files:** none (verification only)

- [ ] **Step 1: Link check across all three pages**

```bash
for p in "" "adopt/" "posts/2026-10-25-one-file/"; do
  curl -s "http://localhost:8123/$p" | grep -oE 'href="[^"#]+"' | sort -u
done
```

Manually resolve every internal href to a 200 (relative-path mistakes are the likely failure: pages live one and two levels deep).

- [ ] **Step 2: Screenshot QC (desktop + mobile)**

Use the house headless-Chrome probe (AEON gotcha: min render width ~469px — use width-override for mobile). Capture at 1280×800 and 400×800:
- `site/index.html` (nav regression)
- `site/adopt/index.html`
- `site/posts/2026-10-25-one-file/index.html`

Check: stylesheet loads on all three (page is not unstyled), tables readable at 400px (`.table-wrap` scrolls, not overflows), code blocks don't overflow the post column.

- [ ] **Step 3: Kill the local server**

```bash
kill %1 2>/dev/null || true
```

---

### Task 6: Push + deploy + live verify

**Files:** none

- [ ] **Step 1: Push**

```bash
git push origin main
```

(Hooks will run gitleaks; expect pass — no credentials in site content.)

- [ ] **Step 2: Wait for CI, verify live**

```bash
curl -s -o /dev/null -w "%{http_code}\n" https://dotcurt.org/adopt/
curl -s -o /dev/null -w "%{http_code}\n" https://dotcurt.org/posts/2026-10-25-one-file/
curl -s https://dotcurt.org/ | grep -c 'href="adopt/"'
```

Expected: `200`, `200`, `1`.

- [ ] **Step 3: Mobile-width live spot check**

Screenshot `https://dotcurt.org/adopt/` at 400px wide; confirm the consumers table scrolls inside `.table-wrap` and doesn't blow out the layout.

---

## Self-review notes

- Spec coverage: Task 1 = architecture/style.css; Task 2 = post (voice sample verbatim from spec); Task 3 = adopt page (all 5 spec sections: why, path, registry, license line, FAQ); Task 4 = nav; Task 5 = QA incl. mobile probe; Task 6 = deploy + live verify. Facts section of spec = Task 3 Step 2 guard.
- No placeholders: full copy included for both pages; header/footer are exact-copy instructions from an existing file (mechanical, not vague).
- Type consistency: class names reused from the vocabulary list; relative link depths (`adopt/` from index root, `../../` from nested pages) consistent.
