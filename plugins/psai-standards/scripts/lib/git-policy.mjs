// Polityka komend git wspólna dla wszystkich narzędzi (Claude Code, Antigravity).
// Adaptery w scripts/*.mjs tłumaczą tylko format wejścia/wyjścia danego narzędzia.
import { findAttribution } from './attribution.mjs';

/**
 * Sprawdza komendę powłoki pod kątem łamania standardu PSAI.
 * @param {string} cmd pełna komenda przekazana do powłoki
 * @param {{ commitSkill: string }} opts nazwa skilla do komponowania commitów w danym narzędziu
 * @returns {string|null} powód odmowy albo null, gdy komenda jest dozwolona
 */
export function checkGitCommand(cmd, { commitSkill }) {
  if (!cmd || !/\bgit\b/.test(cmd)) return null;

  // Obejście hooków konfiguracją inline albo zmianą/usunięciem core.hooksPath
  if (/\bgit\s+-c\s+core\.hookspath/i.test(cmd)) {
    return 'Overriding core.hooksPath inline is not allowed. Repository git hooks must run on every commit.';
  }
  if (/\bgit\s+config\b[^;&|]*\bcore\.hookspath\b/i.test(cmd) && !/core\.hookspath\s+\.githooks\b/i.test(cmd) && !/--get\b/.test(cmd)) {
    return 'Changing or unsetting core.hooksPath is not allowed. The only valid value is ".githooks".';
  }

  // Analizujemy tylko commity (także "git -C path commit", "git commit --amend")
  const isCommit = /\bgit\b(\s+-C\s+\S+)?(\s+-c\s+\S+)*\s+commit\b/.test(cmd);
  if (!isCommit) return null;

  // Flagi sprawdzamy na komendzie bez treści w cudzysłowach i heredoców,
  // żeby tekst wiadomości (np. "fix -n flag") nie dawał fałszywych trafień
  const flags = cmd
    .replace(/<<-?\s*['"]?(\w+)['"]?[\s\S]*?\n\1\b/g, ' ')
    .replace(/"(?:\\.|[^"\\])*"/g, '""')
    .replace(/'[^']*'/g, "''");

  // --no-verify / -n wyłącza hooki commit-msg i pre-commit
  if (/\s--no-verify\b/.test(flags) || /\scommit\b[^;&|]*\s-[a-zA-Z]*n[a-zA-Z]*\b/.test(flags)) {
    return 'Commits must not bypass git hooks (--no-verify / -n). Fix the reported problem instead.';
  }

  const hit = findAttribution(cmd);
  if (hit) {
    return `Commit message contains AI attribution ("${hit}"). PSAI standard forbids any AI attribution in commits (Co-Authored-By AI, "Generated with", session links, robot emoji). Remove it and commit again.`;
  }

  // Pominięcie changelogu może zatwierdzić tylko człowiek
  if (/changelog:\s*skip/i.test(cmd)) {
    return 'The "Changelog: skip" trailer may only be added by a human. Update docs/CHANGELOG.md, or ask the user to commit this themselves.';
  }

  // Commit bez wiadomości otworzyłby edytor — agent i tak nie może go obsłużyć
  if (!/\s(-m|--message|-F|--file|-C|--reuse-message|--no-edit)\b|\s-[a-zA-Z]*m/.test(flags) && !/--amend/.test(flags)) {
    return `Provide the commit message explicitly (-m or -F). Use the ${commitSkill} skill to compose it.`;
  }

  return null;
}
