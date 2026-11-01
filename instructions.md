# PSAI Standards — Project Instructions

> This file is the single source of truth for how to work in this repository.
> It is written for humans and for any AI coding assistant (Anthropic Claude, Google Gemini, OpenAI GPT/Codex, others).
> `CLAUDE.md`, `AGENTS.md` and `GEMINI.md` only point here. If anything contradicts this file, this file wins.

The key words MUST, MUST NOT, SHOULD and MAY are used as defined in RFC 2119.

PSAI standard version: 1.0.0

---

## 1. Project overview

| Key | Value |
|---|---|
| Name | PSAI Standards |
| Purpose | A Claude Code plugin and a tool-agnostic set of templates and git hooks that keep software projects structured: master instructions file, clean commits, changelog, glossary, in-repo feature docs, complexity-rated plans. |
| Primary stack | Markdown, POSIX sh (git hooks), Node.js ESM (Claude Code hooks), JSON (plugin manifests) |
| Owner / team | Piotr Sowiak |
| Documentation language | English |
| Code identifiers language | English |
| Code comments language | Polish |

## 2. Repository map

| Path | Contents |
|---|---|
| `instructions.md` | This file. |
| `README.md` | Public overview and installation. |
| `.claude-plugin/marketplace.json` | Claude Code marketplace catalog (`psai`). |
| `plugins/psai-standards/` | The plugin. |
| `plugins/psai-standards/.claude-plugin/plugin.json` | Plugin manifest. `version` MUST be bumped on every release. |
| `plugins/psai-standards/skills/` | Skills: `rules`, `init`, `plan`, `commit`, `document-feature`, `audit`. |
| `plugins/psai-standards/hooks/hooks.json` | Claude Code hooks (SessionStart, PreToolUse on Bash). |
| `plugins/psai-standards/scripts/` | Node scripts run by Claude Code hooks. |
| `plugins/psai-standards/templates/` | Files copied into target projects (instructions, docs, git hooks, CI workflow, pointer files). |
| `plugins/psai-standards/references/model-matrix.md` | Model suggestions per complexity tier for Anthropic, Google, OpenAI. |
| `.githooks/` | This repository's own git hooks — MUST stay identical to `plugins/psai-standards/templates/githooks/`. |
| `docs/` | Documentation of this repository (index, changelog, glossary, features). |

## 3. Commands

| Task | Command |
|---|---|
| Activate git hooks | `git config core.hooksPath .githooks` |
| Validate plugin and marketplace | `claude plugin validate ./plugins/psai-standards && claude plugin validate .` |
| Load plugin locally for testing | `claude --plugin-dir ./plugins/psai-standards` |
| Run hook self-tests | `sh tests/run.sh` |
| Check commits and structure like CI | `sh .githooks/ci-check.sh <base-ref>` |

Before declaring work complete, `sh tests/run.sh` MUST pass.

## 4. Coding conventions

1. Git hooks MUST be POSIX `sh` (no bash-only syntax) and use only `git`, `grep -E`, `sed`, `awk`. They run on Linux, macOS and Git for Windows without Node or Python.
2. Claude Code hook scripts MUST be Node.js ESM (`.mjs`) with no npm dependencies. Node is always present where Claude Code runs.
3. AI attribution patterns exist in two places: `plugins/psai-standards/scripts/lib/attribution.mjs` and `plugins/psai-standards/templates/githooks/commit-msg`. They MUST be changed together, and a test case MUST be added to `tests/run.sh`.
4. Templates MUST NOT contain Claude-specific instructions except in `instructions.md` section 10 and `CLAUDE.md`. Everything else is written so any model understands it.
5. Shell scripts and `.githooks/*` MUST use LF line endings (enforced by `.gitattributes`).

## 5. Commits

1. Every commit message MUST follow Conventional Commits: `<type>(<optional scope>)<optional !>: <description>`.
2. Allowed types: `feat`, `fix`, `perf`, `refactor`, `docs`, `test`, `build`, `ci`, `chore`, `style`, `revert`.
3. The description MUST state what happened and where, in the imperative mood, at least 10 characters. Generic descriptions such as "fix", "update", "changes", "wip" are rejected.
4. The header MUST be 100 characters or fewer.
5. Commits of type `feat`, `fix`, `perf`, `revert`, and any breaking change MUST have a body explaining what changed and why.
6. Commit messages MUST NOT contain any AI attribution: no `Co-Authored-By:` naming an AI tool or model, no "Generated with …", no AI session links, no robot emoji, no `Assisted-by:` or similar trailers.
7. Commits MUST NOT bypass hooks (`--no-verify`, `-n`, overriding `core.hooksPath`).
8. Recommended scopes: `plugin`, `hooks`, `skills`, `templates`, `matrix`, `docs`, `ci`.

## 6. Changelog

1. Every change that affects how the plugin, hooks or templates behave MUST be recorded in `docs/CHANGELOG.md` in the same commit, under `## [Unreleased]` (`Added`, `Changed`, `Deprecated`, `Removed`, `Fixed`, `Security`).
2. On release: rename `[Unreleased]` to `[x.y.z] - YYYY-MM-DD`, set the same `version` in `plugin.json`, add a new empty `[Unreleased]`.

## 7. Glossary

New terms MUST be defined in `docs/GLOSSARY.md` when introduced, alphabetically, one to three sentences each.

## 8. Feature documentation

1. Each plugin capability has a document in `docs/features/<slug>.md`, linked from `docs/README.md`.
2. When behavior changes, the document MUST be updated in the same change.

## 9. Planning

Plans MUST rate each task with the complexity scale and suggest a model from Anthropic, Google and OpenAI using the matrix in `plugins/psai-standards/references/model-matrix.md`. The scale is defined in `plugins/psai-standards/templates/instructions.md`, section 9.

## 10. Executing large tasks

L/XL work MUST be split into subtasks, each with its own tier and model, and reviewed as a whole by a top-tier model that did not write it. In Claude Code use the `task-orchestrator` skill.

## 11. Definition of done

- [ ] `sh tests/run.sh` passes.
- [ ] `.githooks/` identical to `plugins/psai-standards/templates/githooks/`.
- [ ] `docs/CHANGELOG.md` updated if behavior changed.
- [ ] Feature docs and `README.md` updated.
- [ ] Commits follow section 5.

## 12. Project-specific configuration

| Key | Value |
|---|---|
| Marketplace name | `psai` |
| Plugin name | `psai-standards` |
| Install | `/plugin marketplace add piosow/PSAI-standards` then `/plugin install psai-standards@psai` |
| Model matrix review cadence | Every 90 days or when a provider ships a new model family |
