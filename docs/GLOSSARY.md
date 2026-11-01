# Glossary

Definitions of domain and project terms used in code and documentation.
Entries are sorted alphabetically. Add a term when it first appears in the project.

---

### AI attribution
Any text in a commit message that credits an AI tool or model: `Co-Authored-By` trailers naming one, "Generated with …" footers, AI session links, robot emoji, `Assisted-by`-style trailers. Forbidden by the PSAI standard. Mentioning a product as the subject of a change is not attribution.

### Antigravity
Google's agentic development environment (IDE, desktop app and `agy` CLI). This repository ships a generated plugin for it.
Also known as: agy
See: [Antigravity plugin](features/antigravity-plugin.md)

### Behavior-affecting change
A change that alters what the application does: commit types `feat`, `fix`, `perf`, `revert`, or any breaking change. Requires a commit body and a `docs/CHANGELOG.md` entry.

### Changelog
The file `docs/CHANGELOG.md` in Keep a Changelog format, recording every behavior-affecting change.
See: [CHANGELOG](CHANGELOG.md)

### Claude-only block
A section of a skill wrapped in `<!-- claude-only:start <id> -->` and `<!-- claude-only:end -->`. The Antigravity generator replaces it with `tools/antigravity/fragments/<id>.md`.

### Complexity tier
Rating of a task from XS to XL derived from a 0–10 score over five factors (scope, ambiguity, reasoning depth, risk, verification). Drives model choice and whether work is orchestrated.
See: [Planning and model matrix](features/planning-and-model-matrix.md)

### Dual-target change
Any change to the plugin that must take effect in both Claude Code and Antigravity. Made in the Claude Code source, then propagated by regenerating the Antigravity plugin.
See: [instructions.md, section 4](../instructions.md#4-coding-conventions)

### Generated plugin
`plugins/psai-standards-antigravity/`, produced by `tools/build-antigravity.mjs`. Never edited by hand.

### Marketplace
A catalog file (`.claude-plugin/marketplace.json`) from which Claude Code installs plugins. This repository is the marketplace `psai`.

### Model matrix
Table mapping each complexity tier to a suggested model from Anthropic, Google and OpenAI, plus the orchestrator label (`haiku`, `sonnet`, `opus`).
See: [model-matrix.md](../plugins/psai-standards/references/model-matrix.md)

### Pointer file
A tool-specific instructions file (`CLAUDE.md`, `AGENTS.md`, `GEMINI.md`, `.github/copilot-instructions.md`) whose only content is a reference to `instructions.md`.

### PSAI
Name of this set of engineering standards and of the plugin that enforces them.

### Task orchestration
Executing L/XL work as independent subtasks, each run by the cheapest capable model, followed by a review from a top-tier model that did not write the code. In Claude Code done by the `task-orchestrator` skill.
