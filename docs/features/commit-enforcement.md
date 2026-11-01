# Commit enforcement

| Key | Value |
|---|---|
| Status | Released |
| Introduced in | Unreleased (1.0.0) |
| Owner | Piotr Sowiak |
| Related | [Claude Code hooks](claude-code-hooks.md), [Project structure](project-structure.md) |

## Summary

Git hooks committed to each project in `.githooks/` enforce commit rules for every contributor — humans and any AI assistant — without depending on Claude Code. A CI check runs the same logic on pull requests, because local hooks can be skipped.

## Behavior

`commit-msg`:

1. **AI attribution** lines are removed from the message automatically, with a note on stderr. In CI mode they fail the check instead.
2. **Format:** header must match `<type>(<scope>)!: <description>`, types `feat fix perf refactor docs test build ci chore style revert`. Merge, `fixup!`, `squash!`, `amend!` commits and git's `Revert "..."` headers are accepted.
3. **Descriptive subject:** description ≥ 10 characters, header ≤ 100 characters, generic descriptions (`fix`, `update`, `wip`, `zmiany`, …) rejected.
4. **Body:** required for behavior-affecting commits (`feat`, `fix`, `perf`, `revert`, `!`, `BREAKING CHANGE:`). Controlled by `git config psai.requireBody auto|always|never` (default `auto`). Trailer-only bodies (`Refs: #1`) do not count.
5. **Changelog:** behavior-affecting commits must stage `docs/CHANGELOG.md`. On `--amend`, a changelog change already present in the amended commit with the same header is accepted. A human may add the trailer `Changelog: skip` to bypass; the Claude Code guard blocks agents from adding it.

`pre-commit` (checks the index, i.e. what will actually be committed):

1. `instructions.md`, `docs/README.md`, `docs/CHANGELOG.md`, `docs/GLOSSARY.md` exist.
2. `docs/CHANGELOG.md` contains `## [Unreleased]`.
3. Every `docs/features/*.md` (except `_`-prefixed templates) is linked from `docs/README.md`.

`ci-check.sh <base> [<head>]` runs `commit-msg` on every non-merge commit in `base..head` (with `PSAI_COMMIT` set) and `pre-commit` on the tree of `head` (with `PSAI_REF` set).

## Technical design

- `plugins/psai-standards/templates/githooks/` — sources copied into projects by `psai-standards:init`.
- POSIX sh, only `git`, `grep -E`, `sed`, `awk` — works in Git for Windows without Node or Python.
- Activation: `git config core.hooksPath .githooks`, automated by `Directory.Build.targets` (.NET) or `prepare` script (Node).
- `.gitattributes` forces LF for hooks.

## Configuration

| Setting | Values | Default |
|---|---|---|
| `git config psai.requireBody` | `auto`, `always`, `never` | `auto` |

## Usage

```bash
git config core.hooksPath .githooks          # once per clone
sh .githooks/ci-check.sh origin/main HEAD    # same check as CI
```

## Limitations and known issues

- Local hooks can be bypassed with `--no-verify` by humans; the CI check is the real gate. Protect `main` with a required status check.
- Body detection treats any `Word: text` line as a trailer.
- Attribution detection is pattern-based; a novel tool name in a `Co-Authored-By` line may pass until added to both pattern lists.

## Changelog references

- [Unreleased] Added — tool-agnostic git hooks and CI check.
