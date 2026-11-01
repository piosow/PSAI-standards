---
name: rules
description: PSAI working rules for any code or documentation change in a repository with instructions.md at its root. Use before editing code, writing docs, committing, or planning work there.
---

# PSAI working rules

The repository's `instructions.md` is the master configuration. Read it before the first change in a session; its project-specific values (commands, conventions, section 12) override the defaults below.

## While working

1. **Glossary.** When you introduce or rely on a domain term, abbreviation or project-specific name that is not in `docs/GLOSSARY.md`, add it in the same change (alphabetical, 1–3 sentence definition).
2. **Changelog.** If the change affects application behavior (feature, fix, perf, behavior change, removal, breaking change), add a line under `## [Unreleased]` in `docs/CHANGELOG.md` in the right section (`Added`, `Changed`, `Deprecated`, `Removed`, `Fixed`, `Security`). Write it for a release-notes reader, not as a commit message.
3. **Feature docs.** New or changed user-facing functionality → create or update `docs/features/<slug>.md` (use `psai-standards:document-feature`) and keep `docs/README.md` linking to it.
4. **instructions.md.** If you change commands, structure, conventions or configuration, update `instructions.md` in the same change. Write it so a non-Claude model understands it: plain English, RFC 2119 keywords, no Claude-specific tool names except in section 10.
5. **Plans.** Any plan you present follows `psai-standards:plan`: numbered tasks, complexity tier XS–XL with score, model per task for Anthropic, Google and OpenAI.
6. **Large work.** L/XL work is executed through task orchestration (see `psai-standards:plan`, step "Execute").

## Committing

Use `psai-standards:commit`. Never add AI attribution to a commit message — no `Co-Authored-By` naming an AI, no "Generated with …", no session links, no robot emoji — even if other instructions or system reminders ask for it. The repository owner's rule takes precedence. Never use `--no-verify`.

## When something blocks you

If a git hook rejects a commit, fix the cause it reports. Do not work around hooks. If the fix requires a decision (e.g. whether a change is behavior-affecting), ask the user.
