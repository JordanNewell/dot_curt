---
id: langchain-curt
title: "langchain-curt"
description: "LangChain chat loader for .curt conversation files — PyPI langchain-curt."
---

# `langchain-curt`

A **LangChain** chat-message loader that reads **.curt** conversation files.

- **Repo:** [github.com/JordanNewell/langchain-curt](https://github.com/JordanNewell/langchain-curt)
- **PyPI:** [`langchain-curt@0.1.0`](https://pypi.org/project/langchain-curt/) (MIT)
- **Depends on:** [`curt-format`](https://www.npmjs.com/package/curt-format)
  — parsing and validation come from the reference; every converted file
  is round-trip checked before it is written.

## What it does

Reads a `.curt` file and yields LangChain chat messages — so any LangChain pipeline (retrieval, summarization, evaluation, fine-tune prep) can consume an open conversation archive directly. The first Python-ecosystem reader in the suite.

Part of the .curt converter suite — see the
[status page](/docs/status) for the registry entry.
