#!/usr/bin/env node
// Hook PreToolUse (Bash): blokuje komendy git łamiące standard PSAI, zanim się wykonają.
// To pierwsza linia obrony dla agenta; właściwą egzekucję robią git hooki w .githooks/.
import { findAttribution } from './lib/attribution.mjs';

const deny = (reason) => {
  process.stdout.write(JSON.stringify({
    hookSpecificOutput: {
      hookEventName: 'PreToolUse',
      permissionDecision: 'deny',
      permissionDecisionReason: `[psai-standards] ${reason}`,
    },
  }));
  process.exit(0);
};

let raw = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', (c) => (raw += c));
process.stdin.on('end', () => {
  let input;
  try { input = JSON.parse(raw); } catch { process.exit(0); } // Nieczytelne wejście — nie blokujemy pracy

  const cmd = input?.tool_input?.command ?? '';
  if (!/\bgit\b/.test(cmd)) process.exit(0);

  // Obejście hooków konfiguracją inline albo zmianą/usunięciem core.hooksPath
  if (/\bgit\s+-c\s+core\.hookspath/i.test(cmd)) {
    deny('Overriding core.hooksPath inline is not allowed. Repository git hooks must run on every commit.');
  }
  if (/\bgit\s+config\b[^;&|]*\bcore\.hookspath\b/i.test(cmd) && !/core\.hookspath\s+\.githooks\b/i.test(cmd) && !/--get\b/.test(cmd)) {
    deny('Changing or unsetting core.hooksPath is not allowed. The only valid value is ".githooks".');
  }

  // Analizujemy tylko commity (także "git -C path commit", "git commit --amend")
  const isCommit = /\bgit\b(\s+-C\s+\S+)?(\s+-c\s+\S+)*\s+commit\b/.test(cmd);
  if (!isCommit) process.exit(0);

  // Flagi sprawdzamy na komendzie bez treści w cudzysłowach i heredoców,
  // żeby tekst wiadomości (np. "fix -n flag") nie dawał fałszywych trafień
  const flags = cmd
    .replace(/<<-?\s*['"]?(\w+)['"]?[\s\S]*?\n\1\b/g, ' ')
    .replace(/"(?:\\.|[^"\\])*"/g, '""')
    .replace(/'[^']*'/g, "''");

  // --no-verify / -n wyłącza hooki commit-msg i pre-commit
  if (/\s--no-verify\b/.test(flags) || /\scommit\b[^;&|]*\s-[a-zA-Z]*n[a-zA-Z]*\b/.test(flags)) {
    deny('Commits must not bypass git hooks (--no-verify / -n). Fix the reported problem instead.');
  }

  const hit = findAttribution(cmd);
  if (hit) {
    deny(`Commit message contains AI attribution ("${hit}"). PSAI standard forbids any AI attribution in commits (Co-Authored-By AI, "Generated with", session links, robot emoji). Remove it and commit again.`);
  }

  // Pominięcie changelogu może zatwierdzić tylko człowiek
  if (/changelog:\s*skip/i.test(cmd)) {
    deny('The "Changelog: skip" trailer may only be added by a human. Update docs/CHANGELOG.md, or ask the user to commit this themselves.');
  }

  // Commit bez wiadomości otworzyłby edytor — agent i tak nie może go obsłużyć
  if (!/\s(-m|--message|-F|--file|-C|--reuse-message|--no-edit)\b|\s-[a-zA-Z]*m/.test(flags) && !/--amend/.test(flags)) {
    deny('Provide the commit message explicitly (-m or -F). Use the psai-standards:commit skill to compose it.');
  }

  process.exit(0);
});
