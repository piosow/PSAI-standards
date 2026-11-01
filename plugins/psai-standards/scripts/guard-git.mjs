#!/usr/bin/env node
// Adapter Claude Code (PreToolUse, Bash): tłumaczy wejście/wyjście, logika w lib/git-policy.mjs.
// Odpowiednik Antigravity: tools/antigravity/scripts/guard-git.mjs.
import { checkGitCommand } from './lib/git-policy.mjs';
import { readStdinJson } from './lib/stdin.mjs';

const input = await readStdinJson();
const reason = checkGitCommand(input?.tool_input?.command ?? '', { commitSkill: 'psai-standards:commit' });

if (reason) {
  process.stdout.write(JSON.stringify({
    hookSpecificOutput: {
      hookEventName: 'PreToolUse',
      permissionDecision: 'deny',
      permissionDecisionReason: `[psai-standards] ${reason}`,
    },
  }));
}
process.exit(0);
