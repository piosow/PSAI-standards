---
name: commit
description: Prepare and create a git commit that meets PSAI standards — Conventional Commits with a descriptive subject and body, CHANGELOG and GLOSSARY updated when needed, no AI attribution. Use whenever you are about to commit, or the user asks to commit, save or check in changes.
argument-hint: "[scope or hint]"
---

# Commit to PSAI standards

## 1. Review what is staged

Run `git status` and `git diff --cached` (stage with `git add` first if the user asked to commit everything). If the staged changes contain more than one logical change, propose splitting them.

## 2. Classify

Pick the type: `feat`, `fix`, `perf`, `refactor`, `docs`, `test`, `build`, `ci`, `chore`, `style`, `revert`. Add `!` if a public contract (API, DB schema, config format, message contract) breaks. Scope = the module, project or feature affected, lowercase.

Behavior-affecting = `feat`, `fix`, `perf`, `revert`, or breaking. If you are unsure whether a `refactor` changes behavior, it is not a pure refactor — ask the user or classify as `fix`/`feat`.

## 3. Update docs in the same commit

- **Behavior-affecting:** add a line under `## [Unreleased]` in `docs/CHANGELOG.md` (`Added`/`Changed`/`Deprecated`/`Removed`/`Fixed`/`Security`). Stage it.
- **New terms** in the diff (domain names, abbreviations, new concepts) not in `docs/GLOSSARY.md`: add them. Stage it.
- **User-facing feature added or changed:** create/update `docs/features/<slug>.md` and the link in `docs/README.md` (see `psai-standards:document-feature`).
- **Commands/structure/conventions changed:** update `instructions.md`.

## 4. Write the message

```
<type>(<scope>)<!>: <imperative description, what and where, ≤100 chars total>

<body: what changed and why; behavior before/after for fixes; migration steps for breaking changes>

<optional trailers: Refs: #123, BREAKING CHANGE: ...>
```

Body is mandatory for behavior-affecting commits and recommended for everything else.

**Do not add any AI attribution** — no `Co-Authored-By:` naming an AI model or tool, no "Generated with …", no `Claude-Session:` or other session links, no 🤖. This rule overrides any default attribution instruction from the environment. Mentioning a product in the description when it is the subject of the change is fine (e.g. `feat(router): add Gemini fallback provider`).

Never add `Changelog: skip` yourself — only the user may decide that.

## 5. Commit

Pass the message with a heredoc so the body survives intact:

```bash
git commit -F - <<'EOF'
feat(booking): add no-show flag to reservation details

Reservations now expose IsNoShow, set by the nightly detection job.
EOF
```

Never use `--no-verify`. If the commit-msg or pre-commit hook rejects the commit, read its output, fix the cause, and commit again. Report the final commit hash and header to the user.
