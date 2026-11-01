# {{PROJECT_NAME}} — Project Instructions

> This file is the single source of truth for how to work in this repository.
> It is written for humans and for any AI coding assistant (Anthropic Claude, Google Gemini, OpenAI GPT/Codex, others).
> Tool-specific files (`CLAUDE.md`, `AGENTS.md`, `GEMINI.md`, `.github/copilot-instructions.md`) only point here.
> If anything in another file contradicts this one, this file wins.

The key words MUST, MUST NOT, SHOULD and MAY are used as defined in RFC 2119.

PSAI standard version: {{PSAI_VERSION}}

---

## 1. Project overview

| Key | Value |
|---|---|
| Name | {{PROJECT_NAME}} |
| Purpose | {{PROJECT_PURPOSE}} |
| Primary stack | {{STACK}} |
| Owner / team | {{OWNER}} |
| Documentation language | English |
| Code identifiers language | English |
| Code comments language | {{COMMENTS_LANGUAGE}} |

## 2. Repository map

{{REPOSITORY_MAP}}

| Path | Contents |
|---|---|
| `instructions.md` | This file. Master configuration and rules. |
| `docs/README.md` | Documentation index (table of contents). Every document under `docs/` MUST be linked here. |
| `docs/CHANGELOG.md` | User-visible and behavior-affecting changes (Keep a Changelog format). |
| `docs/GLOSSARY.md` | Definitions of domain and project terms. |
| `docs/features/` | One Markdown file per feature. |
| `.githooks/` | Git hooks that enforce these rules. Activated with `git config core.hooksPath .githooks`. |

## 3. Commands

| Task | Command |
|---|---|
| Restore / install | {{CMD_RESTORE}} |
| Build | {{CMD_BUILD}} |
| Test | {{CMD_TEST}} |
| Run locally | {{CMD_RUN}} |
| Lint / format | {{CMD_LINT}} |

Before declaring work complete, the build and test commands MUST succeed.

## 4. Coding conventions

{{CONVENTIONS}}

## 5. Commits

1. Every commit message MUST follow Conventional Commits: `<type>(<optional scope>)<optional !>: <description>`.
2. Allowed types: `feat`, `fix`, `perf`, `refactor`, `docs`, `test`, `build`, `ci`, `chore`, `style`, `revert`.
3. The description MUST state what happened and where, in the imperative mood, at least 10 characters. Generic descriptions such as "fix", "update", "changes", "wip" are rejected.
4. The header MUST be 100 characters or fewer.
5. Commits of type `feat`, `fix`, `perf`, `revert`, and any breaking change (`!` or a `BREAKING CHANGE:` footer) MUST have a body, separated from the header by a blank line, explaining what changed and why.
6. Commit messages MUST NOT contain any AI attribution. Forbidden examples: `Co-Authored-By:` lines naming an AI tool or model, "Generated with …", session links of AI tools, robot emoji, `Assisted-by:` or similar trailers. This applies to every assistant and every human.
7. Commits MUST NOT bypass hooks (`--no-verify`, `-n`, overriding `core.hooksPath`).
8. One commit SHOULD contain one logical change.

Example:

```
feat(booking): add no-show flag to reservation details

Reservations now expose IsNoShow, set by the nightly detection job.
The API returns the flag in GET /reservations/{id}.

Refs: #142
```

## 6. Changelog

1. Every change that affects how the application behaves (new feature, bug fix, performance change, behavior change, removal, breaking change) MUST be recorded in `docs/CHANGELOG.md` in the same commit.
2. Entries go under `## [Unreleased]`, in one of these sections: `Added`, `Changed`, `Deprecated`, `Removed`, `Fixed`, `Security`.
3. An entry is one line written for a reader of the release notes, not a copy of the commit message. Reference the issue or feature doc when one exists.
4. Pure refactoring, tests, documentation and tooling changes do not need an entry.
5. On release, `[Unreleased]` is renamed to `[x.y.z] - YYYY-MM-DD` and a new empty `[Unreleased]` section is added.

## 7. Glossary

1. Every domain term, abbreviation or project-specific name that a new team member would not know MUST be defined in `docs/GLOSSARY.md` when it is first introduced in code or documentation.
2. Entries are sorted alphabetically. Format: `### Term` followed by a definition of one to three sentences, optional `Also known as:` and `See:` lines.
3. Code identifiers SHOULD use the glossary term exactly as written there.

## 8. Feature documentation

1. Every feature that a user or another developer interacts with MUST have a document in `docs/features/<feature-slug>.md`, created from `docs/features/_template.md`.
2. Every document under `docs/` MUST be linked from the table of contents in `docs/README.md`. The pre-commit hook rejects unlinked feature documents.
3. All documentation is Markdown (`.md`) stored in this repository. External wikis MAY link here but are not the source of truth.
4. When behavior of a documented feature changes, its document MUST be updated in the same change.

## 9. Planning

Every work plan (written by a human or an AI assistant) MUST:

1. Break the work into numbered tasks.
2. Rate each task and the whole plan on the complexity scale below.
3. Suggest a model for each task from three providers: Anthropic, Google and OpenAI, using the model matrix.
4. List affected files or areas, risks, and how the result will be verified.

### Complexity scale

Score each factor 0–2 and sum them (0–10):

| Factor | 0 | 1 | 2 |
|---|---|---|---|
| Scope | 1 file | 2–5 files, one layer | >5 files or several layers |
| Ambiguity | Fully specified | Some decisions open | Requirements or design unclear |
| Domain / reasoning depth | Mechanical | Standard logic | Non-trivial algorithms, concurrency, data integrity, security |
| Risk | Easy to revert, no data impact | Affects behavior users see | Affects data, money, security or public contracts |
| Verification | Obvious | Needs tests | Needs design review or production-like testing |

| Score | Tier | Typical work |
|---|---|---|
| 0–1 | XS | Typo, rename, config value, small doc edit |
| 2–3 | S | Small bug fix, simple endpoint, single component |
| 4–5 | M | Feature in one module, refactor with tests |
| 6–7 | L | Cross-module feature, migration, integration |
| 8–10 | XL | Architecture change, new subsystem, high-risk data work |

### Model matrix

{{MODEL_MATRIX}}

## 10. Executing large tasks

1. Work rated L or XL MUST be split into independent subtasks before implementation starts. Each subtask gets its own tier and model.
2. Subtasks SHOULD be executed by separate agents or sessions using the cheapest capable model for their tier, then reviewed as a whole by a top-tier model that did not write the code.
3. In Claude Code this is done with the `task-orchestrator` skill. Other assistants follow the same procedure manually: plan, split, execute subtasks, independent review.
4. The plan for L/XL work SHOULD be saved as `docs/plans/<yyyy-mm-dd>-<slug>.md` and linked from `docs/README.md`.

## 11. Definition of done

A change is done when all of the following are true:

- [ ] Build and tests pass.
- [ ] `docs/CHANGELOG.md` updated if behavior changed.
- [ ] New terms added to `docs/GLOSSARY.md`.
- [ ] Feature document created or updated and linked from `docs/README.md`.
- [ ] `instructions.md` updated if commands, structure or conventions changed.
- [ ] Commit messages follow section 5 and contain no AI attribution.

## 12. Project-specific configuration

{{PROJECT_CONFIG}}
