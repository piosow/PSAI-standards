---
name: plan
description: Create a work plan with complexity tiers (XS–XL) and model suggestions for Anthropic, Google and OpenAI for every task, then execute L/XL work through task orchestration. Use whenever the user asks for a plan, estimate, breakdown or approach for non-trivial work, or before starting any change that touches more than a few files.
argument-hint: "<what to plan>"
---

# Plan work

Read the project's `instructions.md` sections 9–10. If it has a model matrix, use it; otherwise use `${CLAUDE_PLUGIN_ROOT}/references/model-matrix.md`. If the matrix's "Last verified" date is older than 90 days, say so once in the plan.

## 1. Understand

Read the relevant code before planning. Identify affected projects/layers, contracts (API, DB schema, messages), and tests. Ask questions only when an answer changes the plan; otherwise state assumptions explicitly.

## 2. Score

For each task score the five factors 0–2 (scope, ambiguity, reasoning depth, risk, verification), sum to 0–10, map to a tier: 0–1 XS, 2–3 S, 4–5 M, 6–7 L, 8–10 XL. Anything touching security, money, data migrations or public contracts is at least L. The plan's overall tier is the tier of its total effort and its riskiest task, whichever is higher.

## 3. Write the plan

Use exactly this structure so it reads the same for any model or person:

```markdown
## Plan: <title>

**Overall complexity:** <tier> (score <n>/10) — <one-line justification>
**Recommended execution:** <single session | orchestrated subtasks>

| # | Task | Tier | Score | Anthropic | Google | OpenAI | Depends on |
|---|------|------|-------|-----------|--------|--------|------------|
| 1 | ... | S | 3 | Claude Haiku 5.5 | Gemini 3.8 Flash | GPT-6 Luna | — |

### Task details
1. **<task>** — files/areas, approach, done when <verifiable condition>.

### Risks and open questions
### Verification
### Documentation impact
- CHANGELOG: <entry or "none — no behavior change">
- GLOSSARY: <new terms or "none">
- Feature docs: <create/update docs/features/x.md or "none">
- instructions.md: <changes or "none">
```

Model names come from the matrix row for the tier. Keep the score visible: it is what lets a teammate pick a different provider's model with the same reasoning.

For L/XL plans, also save the plan to `docs/plans/<yyyy-mm-dd>-<slug>.md` and link it from the "Plans" section of `docs/README.md`.

## 4. Get approval

Present the plan and wait for approval before changing code, unless the user already asked you to proceed.

## 5. Execute

- **XS–M overall:** execute in the current session, task by task.
<!-- claude-only:start plan-execute-lxl -->
- **L/XL overall:** use the `task-orchestrator` skill (it may appear as `anthropic-skills:task-orchestrator` or `task-orchestrator`). Pass it the approved plan with each task's tier mapped to its orchestrator label (`haiku`, `sonnet`, `opus`) from the matrix, plus the PSAI requirements each subtask must meet (changelog, glossary, feature docs, no AI attribution in commits).
  - If no task-orchestrator skill is available, do the same manually: run each independent subtask in a subagent with the model from its tier, run dependent tasks in order, then have a fresh top-tier subagent that did not write the code review the combined result against the plan before you commit.
<!-- claude-only:end -->
- Commit per logical task with `psai-standards:commit`, not one commit for the whole plan.
