---
id: curt-openwith
title: "curt-openwith"
description: "Double-click any .curt file — offline viewer for Windows, macOS, and Linux."
---

# `curt-openwith`

Double-click a `.curt` file on Windows, macOS, or Linux and it opens in
the offline Curt Viewer — a browser page that renders the conversation
locally. No server, no network; installs only under your user account.

- **Repo:** [github.com/JordanNewell/curt-openwith](https://github.com/JordanNewell/curt-openwith)
- **Install:** Scoop (Windows), Homebrew (macOS/Linux), or a GitHub
  release zip — see below. Not an npm package.
- **Role:** read only (file association; the viewer never rewrites)

## Install

```powershell
# Windows (Scoop, self-owned bucket)
scoop bucket add jordannewell https://github.com/JordanNewell/bucket
scoop install curt-openwith
# then run install.cmd from the package folder to register the handler
```

```sh
# macOS / Linux (Homebrew, self-owned tap)
brew tap JordanNewell/tap https://github.com/JordanNewell/homebrew-tap
brew install curt-openwith
bash "$(brew --prefix curt-openwith)/libexec/mac/install.sh"   # macOS
bash "$(brew --prefix curt-openwith)/libexec/linux/install.sh" # Linux
```

Manual installs come from
[GitHub Releases](https://github.com/JordanNewell/curt-openwith/releases).
Every installer registers the `.curt` handler for the current user only —
no admin, no sudo, nothing machine-wide; `uninstall.cmd` /
`mac/uninstall.sh` / `linux/uninstall.sh` remove it cleanly.

## How it works

The generator reads the `.curt` file (BOM-aware: UTF-8, UTF-16LE/BE),
copies the bundled offline viewer next to your file as `view-<name>.html`,
injects the JSON body, and opens it in your default browser. The viewer
runs the injected body through the same validate-then-render path as a
file dropped on the page — a corrupt or non-`.curt` file gets a clean
"Could not read this file" error, never a half-rendered transcript. All
rendered content goes in via `textContent`; nothing in a viewed file can
execute, and the injected block is escaped so smuggled `</script>` markup
cannot break out.

One note from the repo's own security section: the generated `view-*.html`
contains a plain-text copy of the conversation on your disk. Deleting it
erases the copy; the viewer itself is fully offline and ships no
analytics.

## Where to go deeper

Packaging internals (the reproducible `CurtViewer.exe`, the mac/Linux
generator, the CI QA matrix that runs real install/uninstall on mac and
Ubuntu runners) and the provenance note on how `viewer/` syncs from the
dot_curt site live in the repo README:
[github.com/JordanNewell/curt-openwith](https://github.com/JordanNewell/curt-openwith).
