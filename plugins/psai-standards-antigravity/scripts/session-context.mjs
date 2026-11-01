#!/usr/bin/env node
// Adapter Antigravity (SessionStart): logika w lib/session-report.mjs (kopiowane przez generator).
// Odpowiednik Claude Code: plugins/psai-standards/scripts/session-context.mjs.
// Hook działa w katalogu pluginu (cwd), więc repozytorium bierzemy z workspacePaths.
import { buildSessionReport } from './lib/session-report.mjs';
import { readStdinJson } from './lib/stdin.mjs';

const input = await readStdinJson();
const workspace = Array.isArray(input.workspacePaths) ? input.workspacePaths[0] : null;
const report = buildSessionReport(workspace, {
  skills: { init: 'psai-init', audit: 'psai-audit' },
});

process.stdout.write(JSON.stringify(
  report ? { injectSteps: [{ systemMessage: { systemMessage: report, metadata: { source: 'psai-standards' } } }] } : {},
));
process.exit(0);
