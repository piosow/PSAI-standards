# PSAI Standards

Engineering standards that keep projects structured — for humans and for any AI coding assistant.

- **`instructions.md`** as the single master configuration, written so Claude, Gemini and GPT models all follow it.
- **Clean commits:** Conventional Commits, descriptive subjects, no AI attribution.
- **`docs/CHANGELOG.md`** updated with every behavior-affecting change.
- **`docs/GLOSSARY.md`** for domain terms.
- **Feature docs in the repo** (`docs/features/`), all linked from `docs/README.md`.
- **Complexity-rated plans** (XS–XL) with model suggestions for Anthropic, Google and OpenAI; large work runs as orchestrated subtasks.

Enforcement is layered: Claude Code plugin hooks → git hooks in the repo (any tool, any person) → CI check on pull requests.

## Install the Claude Code plugin

```
/plugin marketplace add piosow/PSAI-standards
/plugin install psai-standards@psai
```

Then, in a project:

```
/psai-standards:init
```

## Skills

| Skill | Purpose |
|---|---|
| `psai-standards:init` | Create or retrofit the structure, install git hooks and CI check |
| `psai-standards:plan` | Plan with complexity tiers and models for 3 providers; orchestrate L/XL |
| `psai-standards:commit` | Compose a compliant commit and update changelog/glossary/docs |
| `psai-standards:document-feature` | Write `docs/features/<slug>.md` and link it |
| `psai-standards:audit` | Check a repository against the standard |
| `psai-standards:rules` | Working rules loaded automatically during changes |

## Without Claude Code

Copy `plugins/psai-standards/templates/` into your project (see [Project structure](docs/features/project-structure.md)), then:

```bash
git config core.hooksPath .githooks
```

Gemini CLI reads `GEMINI.md`, Codex and other agents read `AGENTS.md`; both point to `instructions.md`.

## Documentation

See [docs/README.md](docs/README.md) and [instructions.md](instructions.md).

## License

MIT
