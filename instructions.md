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
| Purpose | A plugin for Claude Code and Google Antigravity, plus a tool-agnostic set of templates and git hooks, that keep software projects structured: master instructions file, clean commits, changelog, glossary, in-repo feature docs, complexity-rated plans. |
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
| `plugins/psai-standards/` | The plugin for Claude Code. **Source of truth for both targets.** |
| `plugins/psai-standards/.claude-plugin/plugin.json` | Plugin manifest. `version` MUST be bumped on every release. |
| `plugins/psai-standards/skills/` | Skills: `rules`, `init`, `plan`, `commit`, `document-feature`, `audit`. |
| `plugins/psai-standards/hooks/hooks.json` | Claude Code hooks (SessionStart, PreToolUse on Bash). |
| `plugins/psai-standards/scripts/` | Claude Code hook adapters (`*.mjs`) and tool-agnostic hook logic shared with Antigravity (`lib/`). |
| `plugins/psai-standards/templates/` | Files copied into target projects (instructions, docs, git hooks, CI workflow, pointer files). |
| `plugins/psai-standards/references/model-matrix.md` | Model suggestions per complexity tier for Anthropic, Google, OpenAI. |
| `plugins/psai-standards-antigravity/` | The plugin for Google Antigravity. **Generated — MUST NOT be edited by hand.** |
| `tools/build-antigravity.mjs` | Generator of the Antigravity plugin; `--check` verifies it is up to date. |
| `tools/antigravity/` | Antigravity-only sources: hook adapters (`scripts/`), `hooks.json`, replacements for claude-only blocks (`fragments/<id>.md`). |
| `tests/run.sh` | Tests of git hooks, hook adapters for both tools and the Antigravity sync check. |
| `.githooks/` | This repository's own git hooks — MUST stay identical to `plugins/psai-standards/templates/githooks/`. |
| `docs/` | Documentation of this repository (index, changelog, glossary, features). |

## 3. Commands

| Task | Command |
|---|---|
| Activate git hooks | `git config core.hooksPath .githooks` |
| Validate plugin and marketplace | `claude plugin validate ./plugins/psai-standards && claude plugin validate .` |
| Load plugin locally for testing | `claude --plugin-dir ./plugins/psai-standards` |
| Regenerate the Antigravity plugin | `node tools/build-antigravity.mjs` |
| Check the Antigravity plugin is up to date | `node tools/build-antigravity.mjs --check` |
| Validate the Antigravity plugin (needs `agy`) | `agy plugin validate --strict ./plugins/psai-standards-antigravity` |
| Run all self-tests (both targets) | `sh tests/run.sh` |
| Check commits and structure like CI | `sh .githooks/ci-check.sh <base-ref>` |

Before declaring work complete, `sh tests/run.sh` MUST pass.

## 4. Coding conventions

1. Git hooks MUST be POSIX `sh` (no bash-only syntax) and use only `git`, `grep -E`, `sed`, `awk`. They run on Linux, macOS and Git for Windows without Node or Python.
2. Claude Code hook scripts MUST be Node.js ESM (`.mjs`) with no npm dependencies. Node is always present where Claude Code runs.
3. AI attribution patterns exist in two places: `plugins/psai-standards/scripts/lib/attribution.mjs` and `plugins/psai-standards/templates/githooks/commit-msg`. They MUST be changed together, and a test case MUST be added to `tests/run.sh`.
4. Templates MUST NOT contain Claude-specific instructions except in `instructions.md` section 10 and `CLAUDE.md`. Everything else is written so any model understands it.
5. Shell scripts and `.githooks/*` MUST use LF line endings (enforced by `.gitattributes`).

### 4.1 Dual-target rule: every change ships for Claude Code and Antigravity

Every change to the plugin is a dual-target change. It MUST take effect in both Claude Code (`plugins/psai-standards/`) and Google Antigravity (`plugins/psai-standards-antigravity/`) in the same commit. A change that works in only one tool is incomplete and MUST NOT be committed.

1. **Edit the source, never the output.** Make the change in `plugins/psai-standards/` (or `tools/antigravity/` for Antigravity-only parts). Files in `plugins/psai-standards-antigravity/` MUST NOT be edited by hand: they are overwritten on every build.
2. **Regenerate after every change.** Run `node tools/build-antigravity.mjs` and commit the regenerated files together with the source change.
3. **Skills.** Write skill content tool-agnostic. Use `${CLAUDE_PLUGIN_ROOT}` for paths and `psai-standards:<skill>` for skill references — the generator converts both. Content that only makes sense in Claude Code MUST be wrapped in `<!-- claude-only:start <id> -->` … `<!-- claude-only:end -->` with an Antigravity equivalent in `tools/antigravity/fragments/<id>.md`. If the content has no Antigravity equivalent, the fragment MUST exist and say how to achieve the same result manually.
4. **New skill.** Add it under `plugins/psai-standards/skills/<name>/`. It becomes `psai-<name>` in Antigravity. Skills that should act as always-relevant guidance are listed in `RULE_SKILLS` in the generator and become `model_decision` rules.
5. **Hooks.** Hook logic MUST live in `plugins/psai-standards/scripts/lib/`. Each hook needs an adapter for both tools: `plugins/psai-standards/scripts/<hook>.mjs` + `plugins/psai-standards/hooks/hooks.json` for Claude Code, and `tools/antigravity/scripts/<hook>.mjs` + `tools/antigravity/hooks.json` for Antigravity. Adapters only translate input and output; they MUST NOT contain policy.
6. **Tests.** A new or changed hook behavior MUST have test cases in `tests/run.sh` that run against both adapters (the `expect_guard` helper does this for the commit guard).
7. **Versions.** The Antigravity `version` is taken from `plugins/psai-standards/.claude-plugin/plugin.json`; bump it there only.
8. **Tool features.** When one tool gains a capability the other lacks (for example the Claude Code task-orchestrator skill), the plugin MUST provide the closest equivalent in the other tool and document the difference in `docs/features/antigravity-plugin.md`.
9. **Verification.** `sh tests/run.sh` fails when the Antigravity plugin is out of date, and the `Plugin checks` workflow runs it on every push and pull request. When `agy` is available, `agy plugin validate --strict ./plugins/psai-standards-antigravity` SHOULD pass before a release.

## 5. Commits

1. Every commit message MUST follow Conventional Commits: `<type>(<optional scope>)<optional !>: <description>`.
2. Allowed types: `feat`, `fix`, `perf`, `refactor`, `docs`, `test`, `build`, `ci`, `chore`, `style`, `revert`.
3. The description MUST state what happened and where, in the imperative mood, at least 10 characters. Generic descriptions such as "fix", "update", "changes", "wip" are rejected.
4. The header MUST be 100 characters or fewer.
5. Commits of type `feat`, `fix`, `perf`, `revert`, and any breaking change MUST have a body explaining what changed and why.
6. Commit messages MUST NOT contain any AI attribution: no `Co-Authored-By:` naming an AI tool or model, no "Generated with …", no AI session links, no robot emoji, no `Assisted-by:` or similar trailers.
7. Commits MUST NOT bypass hooks (`--no-verify`, `-n`, overriding `core.hooksPath`).
8. Recommended scopes: `plugin`, `hooks`, `skills`, `templates`, `matrix`, `antigravity`, `docs`, `ci`.

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

L/XL work MUST be split into subtasks, each with its own tier and model, and reviewed as a whole by a top-tier model that did not write it. In Claude Code use the `task-orchestrator` skill. In Antigravity run subtasks as separate agents, as described in the `psai-plan` skill.

## 11. Definition of done

- [ ] Change made for both Claude Code and Antigravity (section 4.1).
- [ ] `node tools/build-antigravity.mjs` run and regenerated files included in the commit.
- [ ] `sh tests/run.sh` passes (includes the Antigravity sync check).
- [ ] `.githooks/` identical to `plugins/psai-standards/templates/githooks/`.
- [ ] `docs/CHANGELOG.md` updated if behavior changed.
- [ ] Feature docs and `README.md` updated.
- [ ] Commits follow section 5.

## 12. Project-specific configuration

| Key | Value |
|---|---|
| Marketplace name | `psai` |
| Plugin name | `psai-standards` |
| Install (Claude Code) | `/plugin marketplace add piosow/PSAI-standards` then `/plugin install psai-standards@psai` |
| Install (Antigravity) | Copy `plugins/psai-standards-antigravity/` to `~/.gemini/config/plugins/psai-standards/` (global) or `<project>/.agents/plugins/psai-standards/` |
| Antigravity skill names | `psai-init`, `psai-plan`, `psai-commit`, `psai-document-feature`, `psai-audit`; rule `psai-rules` |
| Model matrix review cadence | Every 90 days or when a provider ships a new model family |
