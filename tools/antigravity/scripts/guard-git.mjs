#!/usr/bin/env node
// Adapter Antigravity (PreToolUse, run_command): logika w lib/git-policy.mjs (kopiowane przez generator).
// Odpowiednik Claude Code: plugins/psai-standards/scripts/guard-git.mjs.
// Wejście: { toolCall: { name: "run_command", args: { CommandLine, Cwd, ... } }, ... }
// Wyjście: { decision: "deny" | "allow", reason? } — "decision" jest wymagane dla PreToolUse.
import { checkGitCommand } from './lib/git-policy.mjs';
import { readStdinJson } from './lib/stdin.mjs';

const input = await readStdinJson();
const call = input?.toolCall ?? {};
const cmd = call.name === 'run_command' ? (call.args?.CommandLine ?? '') : '';
const reason = checkGitCommand(cmd, { commitSkill: 'psai-commit' });

process.stdout.write(JSON.stringify(
  reason ? { decision: 'deny', reason: `[psai-standards] ${reason}` } : { decision: 'allow' },
));
process.exit(0);
