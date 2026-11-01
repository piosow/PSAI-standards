# Claude Code hooks

| Key | Value |
|---|---|
| Status | Released |
| Introduced in | Unreleased (1.0.0) |
| Owner | Piotr Sowiak |
| Related | [Commit enforcement](commit-enforcement.md) |

## Summary

Two hooks in the plugin make Claude Code follow the standard before git hooks ever run: one gives the agent facts about the repository at session start, the other blocks non-compliant git commands.

## Behavior

**SessionStart** (`startup`, `resume`, `clear`, `compact`): inside a git repository, reports whether the PSAI structure exists, which required files are missing, whether `core.hooksPath` is active, and summarizes the rules. Outside a repository it does nothing.

**PreToolUse on Bash** denies a command, with a reason the agent sees, when it:

- overrides or unsets `core.hooksPath`,
- runs `git commit` with `--no-verify` or `-n`,
- contains AI attribution in the commit message (same patterns as `commit-msg`),
- contains the `Changelog: skip` trailer (reserved for humans),
- runs `git commit` without an explicit message (would open an editor).

Flags are checked on the command with quoted strings and heredocs removed, so message text such as "fix -n flag" does not trigger false positives.

## Technical design

- `plugins/psai-standards/hooks/hooks.json` — hook registration.
- `plugins/psai-standards/scripts/session-context.mjs`, `guard-git.mjs` — thin adapters for the Claude Code hook format. Node ESM, no dependencies.
- `plugins/psai-standards/scripts/lib/git-policy.mjs`, `session-report.mjs` — tool-agnostic logic, shared with the [Antigravity plugin](antigravity-plugin.md).
- `plugins/psai-standards/scripts/lib/attribution.mjs` — attribution patterns used by the guard.
- Deny is returned as `hookSpecificOutput.permissionDecision: "deny"` with exit code 0.

## Configuration

None.

## Limitations and known issues

- Applies only inside Claude Code. Other assistants rely on `instructions.md` and git hooks.
- Commands built indirectly (scripts that call `git commit` internally) are not inspected; git hooks still catch them.

## Changelog references

- [Unreleased] Added — Claude Code hooks.
