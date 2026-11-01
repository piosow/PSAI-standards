# Project structure

| Key | Value |
|---|---|
| Status | Released |
| Introduced in | Unreleased (1.0.0) |
| Owner | Piotr Sowiak |
| Related | [Commit enforcement](commit-enforcement.md), [Planning and model matrix](planning-and-model-matrix.md) |

## Summary

Every PSAI project has the same documentation skeleton with `instructions.md` as the single master configuration that any AI assistant or human can follow.

## Behavior

```
<repo>/
├── instructions.md          master configuration, rules, commands, model matrix
├── CLAUDE.md                pointer → instructions.md (imports it with @instructions.md)
├── AGENTS.md                pointer for OpenAI Codex and other AGENTS.md-aware tools
├── GEMINI.md                pointer for Gemini CLI
├── .gitattributes           LF for hooks
├── .githooks/               commit-msg, pre-commit, ci-check.sh
├── .github/workflows/psai-standards.yml
└── docs/
    ├── README.md            table of contents — every doc must be linked
    ├── CHANGELOG.md         Keep a Changelog, [Unreleased] on top
    ├── GLOSSARY.md          alphabetical terms
    ├── features/            one file per feature (+ _template.md)
    └── plans/               saved L/XL plans
```

`instructions.md` uses RFC 2119 keywords, numbered rules and tables, and names no Claude-specific tools outside section 10, so Gemini and GPT models follow it as reliably as Claude.

- `psai-standards:init` creates the skeleton, migrates existing `CHANGELOG.md`, `CLAUDE.md`, `AGENTS.md` content into it (with confirmation), installs hooks and CI, and leaves no `{{...}}` placeholders.
- `psai-standards:audit` checks compliance and proposes fixes.
- `psai-standards:document-feature` creates feature docs and keeps the index in sync.

## Technical design

Templates: `plugins/psai-standards/templates/`. Skills: `plugins/psai-standards/skills/init`, `audit`, `document-feature`, `rules`.

## Configuration

Project-specific values live in `instructions.md` section 12.

## Limitations and known issues

- `@instructions.md` import syntax in `CLAUDE.md`/`GEMINI.md` depends on the tool supporting imports; the pointer text works regardless.
- GitHub Copilot pointer is created only when `.github/` exists.

## Changelog references

- [Unreleased] Added — project templates, init and audit skills.
