---
name: audit
description: Audit a repository against PSAI standards — required files, hooks active, unlinked or missing docs, changelog gaps, AI attribution in history, stale model matrix — and offer fixes. Use when the user asks to check, audit or verify project structure or standards compliance.
argument-hint: "[base-ref for history check, default: last 50 commits]"
---

# Audit PSAI compliance

Report findings as a table: `Check | Status (OK/WARN/FAIL) | Details | Fix`. Then offer to fix FAIL/WARN items; apply fixes only after the user agrees, and commit them with `psai-standards:commit`.

## Checks

1. **Required files:** `instructions.md`, `docs/README.md`, `docs/CHANGELOG.md` (with `## [Unreleased]`), `docs/GLOSSARY.md`, `docs/features/_template.md`. FAIL if missing.
2. **Leftover locations:** root `CHANGELOG.md` or `GLOSSARY.md` → WARN, suggest `git mv` into `docs/`.
3. **Pointer files:** `CLAUDE.md`, `AGENTS.md`, `GEMINI.md` exist and only point to `instructions.md`. WARN if they hold rules that are not in `instructions.md` (rules drift).
4. **Placeholders:** any `{{...}}` left in `instructions.md` or docs → FAIL.
5. **Hooks:** `.githooks/commit-msg`, `pre-commit`, `ci-check.sh` exist, are executable in git (`git ls-files -s .githooks` mode 100755), match the plugin templates in `${CLAUDE_PLUGIN_ROOT}/templates/githooks/` (WARN if outdated), and `git config core.hooksPath` is `.githooks` (FAIL if not).
6. **Docs index:** every `.md` under `docs/` (except `docs/README.md` and `_`-prefixed templates) is linked from `docs/README.md`; every link in `docs/README.md` resolves to an existing file.
7. **History:** run `sh .githooks/ci-check.sh <base>` (default base `HEAD~50`, or the root commit if the history is shorter). Report each failing commit. History is not rewritten unless the user explicitly asks — rewriting shared history needs their decision and a force push.
8. **Changelog coverage:** for `feat`/`fix`/`perf` commits since the last release heading, check that `[Unreleased]` has matching entries; list likely gaps.
9. **Glossary coverage:** scan domain models and feature docs for capitalized domain terms or abbreviations missing from `docs/GLOSSARY.md`; list candidates (do not add without the user's confirmation of definitions).
10. **Model matrix:** compare the matrix in `instructions.md` section 9 with `${CLAUDE_PLUGIN_ROOT}/references/model-matrix.md`. WARN if the project's copy is older; WARN if the reference's "Last verified" date is older than 90 days and offer to re-verify model names on the providers' official pages.
11. **CI:** `.github/workflows/psai-standards.yml` (or equivalent) present. WARN if missing.
