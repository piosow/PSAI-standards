---
name: psai-document-feature
description: Create or update the in-repo Markdown documentation for a feature in docs/features/, link it from the docs/README.md table of contents, and add new terms to docs/GLOSSARY.md. Use when a feature is added or changed, or the user asks to document functionality.
---
> `<plugin-root>` below is the directory of the psai-standards plugin: two levels above this file, the folder that contains `plugin.json`.

# Document a feature

1. **Find the code.** Locate the feature's entry points, models, configuration and tests. Read them; do not document from assumptions. If behavior is unclear from code, ask.
2. **Pick the file.** `docs/features/<kebab-case-slug>.md`. If a document for this feature exists, update it instead of creating another. Start new docs from `docs/features/_template.md` (fallback: `<plugin-root>/templates/docs/features/_template.md`).
3. **Write for a new team member.** Fill every template section with real content; delete a section only if it truly does not apply (say "None" for limitations rather than deleting). Link code paths relative to the repo root. Use glossary terms exactly as defined. English, plain Markdown, no HTML.
4. **Link it.** Add or update one line in the "Features" section of `docs/README.md`: `- [Feature name](features/<slug>.md) — one-sentence summary`. Keep the list alphabetical. The pre-commit hook rejects unlinked feature docs.
5. **Glossary.** Add every new domain term used in the doc to `docs/GLOSSARY.md`.
6. **Changelog cross-reference.** If the feature appears in `docs/CHANGELOG.md`, link the feature doc from that entry.
7. Commit with `psai-commit` (type `docs` if only documentation changed).
