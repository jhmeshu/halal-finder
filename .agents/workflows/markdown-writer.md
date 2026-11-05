---
description: Format and validate Markdown files (.md, docs/) in Halal Finder using deterministic linting rules.
agent: build
---

Format and validate Markdown files.

Usage: `/markdown-writer <file-path>`

Example: `/markdown-writer docs/tickets/F01-london-launch-places.md`

Runs `node .agents/skills/markdown-writer/validate_md.cjs <file-path>`.
