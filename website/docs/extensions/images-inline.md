---
id: images-inline
title: "images-inline"
description: "Stable extension: image payloads ride inside message content as data URIs or base64."
---

# `images-inline` — stable

The convention this extension declares: images are not a separate field — a
message whose `content` is a data URI (`data:image/...;base64,...`) or raw
base64 carries an image inline. Declaring it tells other readers what to
expect; it adds no fields and changes no behavior.

- **Fields:** none beyond core — `content` carries the payload;
  `kind: "image"` is a common optional marker.
- Readers never decode or transform `content`, and files never carry a
  byte-order mark (see [SPEC](/docs/spec), "File shape").
- **Status: `stable`.** Emitted by the curtis plugin, porter, curtis-web,
  curtis-cloud, and curtis-ai-tech.

A practical consequence, stated in the spec's implementation notes: a small
conversation with images may legitimately be a large file. Treat `.curt`
files as untrusted input and bound parsing by size before validation.
