# Model matrix

Single place to update model suggestions. Copied into each project's `instructions.md` (section 9) by `psai-standards:init`; refresh with `psai-standards:audit`.

**Last verified:** 2026-11-01. Model lineups change every few months — re-verify against the official pages before relying on exact names:
[Anthropic models](https://docs.claude.com/en/docs/about-claude/models/overview) ·
[Google Gemini models](https://ai.google.dev/gemini-api/docs/models) ·
[OpenAI models](https://platform.openai.com/docs/models)

| Tier | Anthropic | Google | OpenAI | Orchestrator label |
|---|---|---|---|---|
| XS | Claude Haiku 5.5 | Gemini 3.5 Flash-Lite | GPT-6 Luna | haiku |
| S | Claude Haiku 5.5 | Gemini 3.8 Flash | GPT-6 Luna | haiku |
| M | Claude Sonnet 5.5 | Gemini 3.8 Flash (or 3.1 Pro for heavier reasoning) | GPT-6.1 Sol | sonnet |
| L | Claude Opus 5.5 | Gemini 3.1 Pro | GPT-6 Astra | opus |
| XL | Claude Opus 5.5 (Claude Fable 5.1 for the hardest design work) | Gemini 3.1 Pro | GPT-6 Astra | opus |

Review of any L/XL result: top-tier model from a provider that did not write the code, when available.

## Selection rules

1. Pick by tier first, then adjust: long context (whole-repo analysis) → prefer the provider's largest-context model of that tier; strict cost limits → drop one tier and add review.
2. Planning and architecture for L/XL is always done with the L/XL model, even if subtasks run on cheaper tiers.
3. Never use XS/S models for changes touching security, money, data migrations or public API contracts — treat those as at least L regardless of size.

## Confidence notes

- Anthropic lineup: from Anthropic's current product information.
- Google: Pro / Flash / Flash-Lite names from Google Cloud model listings; Gemini 4 is in restricted access and is not listed.
- OpenAI: names from third-party coverage (October 2026), not confirmed against OpenAI's model page at the time of writing. Verify before use.
