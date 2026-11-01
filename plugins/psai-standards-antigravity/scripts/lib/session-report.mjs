// Raport stanu struktury PSAI na start sesji — wspólny dla Claude Code i Antigravity.
// Treść jest celowo opisowa (fakty, nie rozkazy) — zalecenie z dokumentacji hooków.
import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

const git = (args, cwd) => {
  try { return execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim(); }
  catch { return null; }
};

/**
 * @param {string} cwd katalog roboczy sesji
 * @param {{ skills: { init: string, audit: string } }} opts nazwy skilli w danym narzędziu
 * @returns {string|null} kontekst dla modelu albo null poza repozytorium git
 */
export function buildSessionReport(cwd, { skills }) {
  const root = cwd && git(['rev-parse', '--show-toplevel'], cwd);
  if (!root) return null; // Poza repozytorium standard nie obowiązuje

  const required = ['instructions.md', 'docs/README.md', 'docs/CHANGELOG.md', 'docs/GLOSSARY.md'];
  const missing = required.filter((f) => !existsSync(join(root, f)));
  const hooksPath = git(['config', '--get', 'core.hooksPath'], root);
  const hooksOk = hooksPath === '.githooks' && existsSync(join(root, '.githooks', 'commit-msg'));

  const lines = ['PSAI standards are active for this repository.'];
  if (missing.length === required.length) {
    lines.push(`This repository is not initialized with the PSAI structure (no instructions.md, docs/README.md, docs/CHANGELOG.md, docs/GLOSSARY.md). The ${skills.init} skill creates it; the user should be offered initialization before larger work.`);
  } else {
    if (existsSync(join(root, 'instructions.md'))) {
      lines.push('instructions.md at the repository root is the master configuration for this project and is the first file to read before changing anything.');
    }
    if (missing.length) lines.push(`Missing required files: ${missing.join(', ')}. The ${skills.audit} skill reports and fixes structure gaps.`);
  }
  if (!hooksOk) {
    lines.push(`Repository git hooks are not active in this clone (core.hooksPath is not ".githooks" or .githooks/commit-msg is missing). Running "git config core.hooksPath .githooks" activates them; ${skills.init} installs them when absent.`);
  }
  lines.push('Rules in force: Conventional Commits with a descriptive subject; no AI attribution in commits; behavior-affecting changes (feat, fix, perf, revert, breaking) are recorded in docs/CHANGELOG.md in the same commit; new domain terms go to docs/GLOSSARY.md; feature docs live in docs/features/ and are linked from docs/README.md; work plans state complexity (XS–XL) with model suggestions for Anthropic, Google and OpenAI; L/XL work is executed as orchestrated subtasks with an independent review.');
  return lines.join('\n');
}
