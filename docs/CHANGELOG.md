# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Claude Code plugin `psai-standards` with skills `rules`, `init`, `plan`, `commit`, `document-feature`, `audit`.
- Claude Code hooks: SessionStart structure report and PreToolUse guard blocking AI attribution, `--no-verify` and hook overrides in git commands. See [Claude Code hooks](features/claude-code-hooks.md).
- Tool-agnostic git hooks (`commit-msg`, `pre-commit`) and CI check enforcing Conventional Commits, no AI attribution, changelog entries and linked feature docs. See [Commit enforcement](features/commit-enforcement.md).
- Project templates: model-agnostic `instructions.md`, docs index, changelog, glossary, feature doc template, pointer files for Claude, Codex and Gemini, GitHub Actions workflow.
- Model matrix with complexity tiers XS–XL for Anthropic, Google and OpenAI. See [Planning and model matrix](features/planning-and-model-matrix.md).
- Marketplace `psai` for installation from GitHub.
- Google Antigravity plugin `plugins/psai-standards-antigravity/`, generated from the Claude Code plugin by `tools/build-antigravity.mjs`, with skills `psai-init`, `psai-plan`, `psai-commit`, `psai-document-feature`, `psai-audit`, rule `psai-rules` and hooks in Antigravity format. See [Antigravity plugin](features/antigravity-plugin.md).
- `Plugin checks` workflow running hook tests and the Antigravity sync check on every push and pull request.
