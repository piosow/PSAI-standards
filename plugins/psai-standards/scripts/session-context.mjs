#!/usr/bin/env node
// Adapter Claude Code (SessionStart): logika w lib/session-report.mjs.
// Odpowiednik Antigravity: tools/antigravity/scripts/session-context.mjs.
import { buildSessionReport } from './lib/session-report.mjs';
import { readStdinJson } from './lib/stdin.mjs';

const input = await readStdinJson();
const report = buildSessionReport(input.cwd || process.cwd(), {
  skills: { init: 'psai-standards:init', audit: 'psai-standards:audit' },
});

if (report) {
  process.stdout.write(JSON.stringify({
    hookSpecificOutput: { hookEventName: 'SessionStart', additionalContext: report },
  }));
}
process.exit(0);
