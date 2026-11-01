#!/usr/bin/env node
// Hook SessionStart: sprawdza strukturę repo i podaje modelowi fakty o jej stanie.
// Treść jest celowo opisowa (fakty, nie rozkazy) — zalecenie z dokumentacji hooków.
import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

const git = (args, cwd) => {
  try { return execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim(); }
  catch { return null; }
};

let raw = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', (c) => (raw += c));
process.stdin.on('end', () => {
  let input = {};
  try { input = JSON.parse(raw); } catch { /* brak wejścia — używamy process.cwd() */ }

  const cwd = input.cwd || process.cwd();
  const root = git(['rev-parse', '--show-toplevel'], cwd);
  if (!root) process.exit(0); // Poza repozytorium standard nie obowiązuje

  const required = ['instructions.md', 'docs/README.md', 'docs/CHANGELOG.md', 'docs/GLOSSARY.md'];
  const missing = required.filter((f) => !existsSync(join(root, f)));
  const hooksPath = git(['config', '--get', 'core.hooksPath'], root);
  const hooksOk = hooksPath === '.githooks' && existsSync(join(root, '.githooks', 'commit-msg'));

  const lines = ['PSAI standards are active for this repository.'];
  if (missing.length === required.length) {
    lines.push('This repository is not initialized with the PSAI structure (no instructions.md, docs/README.md, docs/CHANGELOG.md, docs/GLOSSARY.md). The psai-standards:init skill creates it; the user should be offered initialization before larger work.');
  } else {
    if (existsSync(join(root, 'instructions.md'))) {
      lines.push('instructions.md at the repository root is the master configuration for this project and is the first file to read before changing anything.');
    }
    if (missing.length) lines.push(`Missing required files: ${missing.join(', ')}. The psai-standards:audit skill reports and fixes structure gaps.`);
  }
  if (!hooksOk) {
    lines.push('Repository git hooks are not active in this clone (core.hooksPath is not ".githooks" or .githooks/commit-msg is missing). Running "git config core.hooksPath .githooks" activates them; psai-standards:init installs them when absent.');
  }
  lines.push('Rules in force: Conventional Commits with a descriptive subject; no AI attribution in commits; behavior-affecting changes (feat, fix, perf, revert, breaking) are recorded in docs/CHANGELOG.md in the same commit; new domain terms go to docs/GLOSSARY.md; feature docs live in docs/features/ and are linked from docs/README.md; work plans state complexity (XS–XL) with model suggestions for Anthropic, Google and OpenAI; L/XL work is executed through task orchestration.');

  process.stdout.write(JSON.stringify({
    hookSpecificOutput: { hookEventName: 'SessionStart', additionalContext: lines.join('\n') },
  }));
  process.exit(0);
});
