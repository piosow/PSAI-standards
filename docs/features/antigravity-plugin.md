# Antigravity plugin

| Key | Value |
|---|---|
| Status | Released |
| Introduced in | Unreleased |
| Owner | Piotr Sowiak |
| Related | [Claude Code hooks](claude-code-hooks.md), [Commit enforcement](commit-enforcement.md), [Planning and model matrix](planning-and-model-matrix.md) |

## Summary

The same PSAI standards packaged as a Google Antigravity plugin in `plugins/psai-standards-antigravity/`. It is generated from the Claude Code plugin, so both tools always ship the same skills, templates, model matrix and commit policy.

## Behavior

| Claude Code | Antigravity |
|---|---|
| Skill `psai-standards:init` | Skill `psai-init` (invoke with `/psai-init`) |
| Skill `psai-standards:plan` | Skill `psai-plan` |
| Skill `psai-standards:commit` | Skill `psai-commit` |
| Skill `psai-standards:document-feature` | Skill `psai-document-feature` |
| Skill `psai-standards:audit` | Skill `psai-audit` |
| Skill `psai-standards:rules` | Rule `rules/psai-rules.md`, `trigger: model_decision` (loaded when the task matches its description) |
| L/XL via `task-orchestrator` skill | L/XL as separate agents (Agent Manager or subagents) with per-tier model choice and an independent review |
| SessionStart hook → `additionalContext` | SessionStart hook → `injectSteps[].systemMessage` |
| PreToolUse on `Bash` → `permissionDecision: deny` | PreToolUse on `run_command` → `decision: deny` (otherwise `decision: allow`) |

Antigravity also reads `AGENTS.md` and `GEMINI.md` from the workspace, so projects initialized with PSAI already point it to `instructions.md` without the plugin.

## Technical design

- **Generator:** `tools/build-antigravity.mjs` rebuilds the output directory from scratch:
  - copies skills, renaming them with the `psai-` prefix and keeping only `name` and `description` in the frontmatter,
  - turns skills listed in `RULE_SKILLS` into `model_decision` rules,
  - replaces `${CLAUDE_PLUGIN_ROOT}` with `<plugin-root>` plus a one-line explanation in the file,
  - replaces `psai-standards:<skill>` references with Antigravity names,
  - replaces `<!-- claude-only:start <id> --> … <!-- claude-only:end -->` blocks with `tools/antigravity/fragments/<id>.md`,
  - copies `templates/`, `references/` and `scripts/lib/` unchanged, and the Antigravity hook adapters and `hooks.json` from `tools/antigravity/`.
- **Safety checks:** the build fails if a Claude-only variable, skill reference or marker survives the transformation, or a fragment is missing.
- **Shared hook logic:** `plugins/psai-standards/scripts/lib/git-policy.mjs` and `session-report.mjs`. Adapters only translate input and output. Antigravity runs hook commands with the plugin root as working directory, so the session adapter takes the repository from `workspacePaths`.
- **Sync check:** `node tools/build-antigravity.mjs --check`, run by `tests/run.sh` and the `Plugin checks` workflow.

## Configuration

None. Antigravity-specific behavior lives in `tools/antigravity/`.

## Usage

Install globally (all workspaces):

```bash
git clone https://github.com/piosow/PSAI-standards.git
mkdir -p ~/.gemini/config/plugins
cp -R PSAI-standards/plugins/psai-standards-antigravity ~/.gemini/config/plugins/psai-standards
```

Or per project: copy the directory to `<project>/.agents/plugins/psai-standards/`. With the Antigravity CLI: `agy plugin install ./PSAI-standards/plugins/psai-standards-antigravity`, then `agy plugin validate --strict ./PSAI-standards/plugins/psai-standards-antigravity`.

Then, in a project: `/psai-init`.

## Limitations and known issues

- Reports from August 2026 say Antigravity IDE 2.x does not execute plugin hooks, while the `agy` CLI does. Google has not confirmed this. Until it works, the git hooks and the CI check are the enforcement in the IDE.
- Hook output follows the documented schema. The behavior of `decision: allow` was not verified on a running Antigravity: if it skips the user's terminal review policy, change the adapter to print nothing.
- `agy plugin validate --strict` has not been run on the generated plugin (no `agy` in the build environment).
- `agy plugin install https://github.com/...` may not find a plugin in a subdirectory; installing from a local path is the documented route.

## Changelog references

- [Unreleased] Added — Antigravity plugin generated from the Claude Code plugin.
