# Planning and model matrix

| Key | Value |
|---|---|
| Status | Released |
| Introduced in | Unreleased (1.0.0) |
| Owner | Piotr Sowiak |
| Related | [Project structure](project-structure.md) |

## Summary

Every plan states the complexity of each task so the right model can be chosen from any provider. Large plans are executed as orchestrated subtasks with an independent review.

## Behavior

1. Each task is scored 0–2 on five factors: scope, ambiguity, reasoning depth, risk, verification. Sum 0–10 maps to XS (0–1), S (2–3), M (4–5), L (6–7), XL (8–10). Security, money, data migrations and public contracts are at least L.
2. The plan table lists tier, score and one suggested model each from Anthropic, Google and OpenAI.
3. XS–M plans run in one session. L/XL plans are saved to `docs/plans/`, linked from `docs/README.md`, and executed via the `task-orchestrator` skill (tiers mapped to `haiku`/`sonnet`/`opus`), or manually with subagents plus a fresh top-tier reviewer when that skill is not available.

## Technical design

- `plugins/psai-standards/skills/plan/SKILL.md` — procedure and output format.
- `plugins/psai-standards/references/model-matrix.md` — the matrix, with "Last verified" date and links to the providers' model pages.
- `psai-standards:init` copies the matrix into each project's `instructions.md` section 9; `psai-standards:audit` flags outdated copies and a matrix older than 90 days.

## Configuration

Project-level override: edit the matrix in the project's `instructions.md` section 9.

## Usage

```
/psai-standards:plan migrate reservations to the new pricing engine
```

## Limitations and known issues

- Model names change several times a year; the matrix needs manual re-verification. OpenAI names were not confirmed against OpenAI's official page when 1.0.0 was written.
- "Automatic" orchestration is instruction-driven (the plan skill chooses it for L/XL); it is not a hard hook.

## Changelog references

- [Unreleased] Added — model matrix and planning skill.
