---
name: init
description: Initialize or retrofit the PSAI project structure in a repository — instructions.md, docs/README.md, docs/CHANGELOG.md, docs/GLOSSARY.md, docs/features/, pointer files for Claude/Codex/Gemini/Copilot, git hooks and CI check. Use when the user asks to set up PSAI standards, or a repository lacks instructions.md.
argument-hint: "[--no-ci] [--no-pointers]"
---

# Initialize PSAI structure

Templates live in `${CLAUDE_PLUGIN_ROOT}/templates/`. The model matrix is `${CLAUDE_PLUGIN_ROOT}/references/model-matrix.md`.

## 1. Inspect before writing

1. Confirm you are at the git repository root (`git rev-parse --show-toplevel`). If it is not a git repository, ask whether to `git init`.
2. List what already exists: `instructions.md`, `docs/`, `CHANGELOG.md` (root), `GLOSSARY.md`, `README.md`, `CLAUDE.md`, `AGENTS.md`, `GEMINI.md`, `.github/copilot-instructions.md`, `.githooks/`, `.husky/`, current `core.hooksPath`.
3. Detect the stack from files: `*.sln`/`*.csproj` (.NET), `package.json` (Node/Vue/React), `pyproject.toml`, `go.mod`, etc. Derive build/test/run/lint commands from them.
4. Read existing `README.md`, `CLAUDE.md`, `AGENTS.md`, `GEMINI.md`, `.editorconfig` for content to migrate into `instructions.md`.

## 2. Ask only what you cannot infer

Use one round of questions (max 4) for: project purpose (one sentence), owner/team, code comments language, and anything about existing files that would be overwritten. Do not ask for commands you detected — show them in the summary instead.

## 3. Create or migrate files

Never overwrite existing content silently. For each file:

| Target | If missing | If present |
|---|---|---|
| `instructions.md` | From template; fill every `{{...}}` with real values (detected or answered). Section 9 `{{MODEL_MATRIX}}` = the table and selection rules from the model matrix reference, with its "Last verified" date. `{{PSAI_VERSION}}` = plugin version from `${CLAUDE_PLUGIN_ROOT}/.claude-plugin/plugin.json`. | Merge: keep project content, add missing PSAI sections. Show the diff to the user before writing. |
| `docs/README.md` | From template, link every existing `.md` under `docs/`. | Add missing TOC sections and links. |
| `docs/CHANGELOG.md` | From template. | — |
| root `CHANGELOG.md` | — | Move to `docs/CHANGELOG.md` with `git mv`, convert to Keep a Changelog if needed, ensure `## [Unreleased]`. |
| `docs/GLOSSARY.md` | From template; add terms you found in the codebase that are clearly domain-specific (ask the user to confirm definitions you are unsure of). | Move from root with `git mv` if there. |
| `docs/features/_template.md` | From template. | — |
| `CLAUDE.md`, `AGENTS.md`, `GEMINI.md` | From `templates/pointers/`. | Move unique content into `instructions.md`, then replace the file with the pointer. Confirm with the user first. |
| `.github/copilot-instructions.md` | Only if `.github/` exists: copy `templates/pointers/AGENTS.md` content. | Same as above. |

Leave no `{{...}}` placeholder in any generated file. If a value is genuinely unknown, write `Not defined yet — ask the project owner.` and list it in the final summary.

## 4. Install enforcement

0. Append the lines of `templates/gitattributes` to `.gitattributes` (create if missing). Hooks with CRLF line endings fail on Windows with `core.autocrlf=true`.
1. Copy `templates/githooks/commit-msg`, `pre-commit`, `ci-check.sh` into `.githooks/` and make them executable (`chmod +x`, plus `git update-index --chmod=+x` after staging so the bit is committed for teammates on Windows).
2. If `.githooks/` or another hooks setup (Husky, pre-commit framework, Husky.Net) already exists, do not overwrite: show the user how to chain PSAI hooks into it and ask.
3. Run `git config core.hooksPath .githooks`.
4. Make activation automatic for teammates (each clone needs it once):
   - .NET: add to `Directory.Build.targets` at the repo root (create if missing):
     ```xml
     <Project>
       <Target Name="PsaiGitHooks" BeforeTargets="Restore;Build" Condition="'$(CI)' != 'true' And Exists('$(MSBuildThisFileDirectory).githooks')">
         <Exec Command="git config core.hooksPath .githooks" WorkingDirectory="$(MSBuildThisFileDirectory)" ContinueOnError="true" StandardOutputImportance="low" />
       </Target>
     </Project>
     ```
   - Node: add `"prepare": "git config core.hooksPath .githooks"` to the root `package.json` scripts (merge with an existing `prepare`).
5. Unless `--no-ci`: if `.github/` exists or the remote is GitHub, copy `templates/github/psai-standards.yml` to `.github/workflows/psai-standards.yml`. For other CI systems, show the user the one command to add: `sh .githooks/ci-check.sh <base> <head>`.

## 5. Verify and commit

1. Run `sh .githooks/pre-commit` after staging — it must pass.
2. Commit with `psai-standards:commit`. Suggested message:
   ```
   chore(repo): adopt PSAI project standards

   Add instructions.md as the master configuration, documentation index,
   changelog, glossary, feature doc template and git hooks enforcing
   commit and documentation rules.
   ```
3. Summarize: files created/migrated, detected commands, values left undefined, and the one-time step for teammates if automatic activation was not possible.
