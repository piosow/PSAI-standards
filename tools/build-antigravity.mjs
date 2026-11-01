#!/usr/bin/env node
// Generuje plugin Antigravity z pluginu Claude Code (jedno źródło prawdy).
//   node tools/build-antigravity.mjs          — przebudowuje plugins/psai-standards-antigravity/
//   node tools/build-antigravity.mjs --check  — kończy się błędem, gdy wygenerowany plugin jest nieaktualny
//
// Źródła:
//   plugins/psai-standards/            — skille, szablony, referencje, wspólna logika hooków (scripts/lib)
//   tools/antigravity/fragments/<id>.md — zamienniki bloków <!-- claude-only:start <id> --> ... <!-- claude-only:end -->
//   tools/antigravity/scripts/         — adaptery hooków w formacie Antigravity
//   tools/antigravity/hooks.json       — rejestracja hooków Antigravity
import { cpSync, existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync, chmodSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(ROOT, 'plugins/psai-standards');
const AGY = join(ROOT, 'tools/antigravity');
const OUT = join(ROOT, 'plugins/psai-standards-antigravity');

// Skille, które w Antigravity stają się regułami (model_decision) zamiast skilli
const RULE_SKILLS = { rules: 'psai-rules' };
// Nazwy skilli w Antigravity mają prefiks — generyczne "init"/"plan" kolidowałyby z innymi pluginami
const agyName = (skill) => RULE_SKILLS[skill] ?? `psai-${skill}`;

const fail = (msg) => { console.error(`[build-antigravity] ERROR: ${msg}`); process.exit(1); };
const read = (p) => readFileSync(p, 'utf8');

function write(path, content) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content);
}

// Rozdziela frontmatter YAML (proste pary klucz: wartość) od treści
function splitFrontmatter(text, file) {
  const m = text.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!m) fail(`${file}: missing YAML frontmatter`);
  const fields = {};
  for (const line of m[1].split('\n')) {
    const kv = line.match(/^([A-Za-z-]+):\s*(.*)$/);
    if (kv) fields[kv[1]] = kv[2];
  }
  return { fields, body: m[2] };
}

// Przekształca treść Markdown z wersji Claude Code na wersję Antigravity
function toAgy(text, file) {
  let out = text.replace(
    /<!-- claude-only:start (\S+) -->\n?([\s\S]*?)<!-- claude-only:end -->\n?/g,
    (_, id) => {
      const frag = join(AGY, 'fragments', `${id}.md`);
      if (!existsSync(frag)) fail(`${file}: no Antigravity fragment for claude-only block "${id}" (expected tools/antigravity/fragments/${id}.md)`);
      return read(frag);
    },
  );
  out = out
    .replaceAll('${CLAUDE_PLUGIN_ROOT}/.claude-plugin/plugin.json', '<plugin-root>/plugin.json')
    .replaceAll('${CLAUDE_PLUGIN_ROOT}', '<plugin-root>')
    .replace(/psai-standards:([a-z-]+)/g, (_, skill) => agyName(skill));

  // Nic specyficznego dla Claude Code nie może przeciec do wersji Antigravity
  for (const [needle, why] of [
    ['CLAUDE_PLUGIN', 'Claude Code plugin variable'],
    ['psai-standards:', 'Claude Code skill reference'],
    ['claude-only', 'unbalanced claude-only marker'],
  ]) {
    if (out.includes(needle)) fail(`${file}: ${why} left after transformation ("${needle}")`);
  }
  return out;
}

const rootNote = (levels) =>
  `> \`<plugin-root>\` below is the directory of the psai-standards plugin: ${levels} above this file, the folder that contains \`plugin.json\`.\n`;

function build(out) {
  rmSync(out, { recursive: true, force: true });
  mkdirSync(out, { recursive: true });

  // 1. Manifest
  const src = JSON.parse(read(join(SRC, '.claude-plugin/plugin.json')));
  const manifest = {
    $schema: 'https://antigravity.google/schemas/v1/plugin.json',
    name: src.name,
    displayName: src.displayName,
    version: src.version,
    description: src.description,
    author: src.author,
    repository: src.repository,
    license: src.license,
    keywords: src.keywords,
    suggestedPrompts: [
      'Set up PSAI standards in this repository',
      'Plan this change with complexity tiers and model suggestions',
      'Audit this repository against PSAI standards',
    ],
  };
  write(join(out, 'plugin.json'), `${JSON.stringify(manifest, null, 2)}\n`);

  // 2. Skille i reguły
  for (const skill of readdirSync(join(SRC, 'skills')).sort()) {
    const file = `skills/${skill}/SKILL.md`;
    const { fields, body } = splitFrontmatter(read(join(SRC, file)), file);
    if (!fields.description) fail(`${file}: missing description`);
    const agyBody = toAgy(body, file);
    const name = agyName(skill);

    if (RULE_SKILLS[skill]) {
      const note = agyBody.includes('<plugin-root>') ? rootNote('one level') : '';
      write(join(out, 'rules', `${name}.md`),
        `---\ntrigger: model_decision\ndescription: ${fields.description}\n---\n${note}${agyBody}`);
    } else {
      const note = agyBody.includes('<plugin-root>') ? rootNote('two levels') : '';
      write(join(out, 'skills', name, 'SKILL.md'),
        `---\nname: ${name}\ndescription: ${fields.description}\n---\n${note}${agyBody}`);
    }
  }

  // 3. Szablony i referencje — bez zmian (są niezależne od narzędzia)
  cpSync(join(SRC, 'templates'), join(out, 'templates'), { recursive: true });
  cpSync(join(SRC, 'references'), join(out, 'references'), { recursive: true });

  // 4. Hooki: wspólna logika + adaptery Antigravity
  cpSync(join(SRC, 'scripts/lib'), join(out, 'scripts/lib'), { recursive: true });
  for (const f of readdirSync(join(AGY, 'scripts')).sort()) {
    cpSync(join(AGY, 'scripts', f), join(out, 'scripts', f));
    chmodSync(join(out, 'scripts', f), 0o755);
  }
  cpSync(join(AGY, 'hooks.json'), join(out, 'hooks.json'));

  // 5. README z ostrzeżeniem o generowaniu
  write(join(out, 'README.md'), `# PSAI Standards — Antigravity plugin

> GENERATED by \`tools/build-antigravity.mjs\` from \`plugins/psai-standards/\`. Do not edit files in this directory by hand.
> Change the Claude Code plugin or \`tools/antigravity/\`, then run \`node tools/build-antigravity.mjs\`.

Version ${manifest.version}. See the repository [README](../../README.md) and [Antigravity plugin](../../docs/features/antigravity-plugin.md) for installation and behavior.
`);
}

// Rekurencyjna lista plików (ścieżki względne, posortowane)
function listFiles(dir) {
  const res = [];
  const walk = (d) => {
    for (const e of readdirSync(d).sort()) {
      const p = join(d, e);
      if (statSync(p).isDirectory()) walk(p); else res.push(relative(dir, p));
    }
  };
  if (existsSync(dir)) walk(dir);
  return res;
}

if (process.argv.includes('--check')) {
  const tmp = mkdtempSync(join(tmpdir(), 'psai-agy-'));
  try {
    build(tmp);
    const want = listFiles(tmp);
    const have = listFiles(OUT);
    const problems = [
      ...want.filter((f) => !have.includes(f)).map((f) => `missing: ${f}`),
      ...have.filter((f) => !want.includes(f)).map((f) => `unexpected: ${f}`),
      ...want.filter((f) => have.includes(f) && !readFileSync(join(tmp, f)).equals(readFileSync(join(OUT, f)))).map((f) => `outdated: ${f}`),
    ];
    if (problems.length) {
      console.error('[build-antigravity] plugins/psai-standards-antigravity/ is out of date:');
      for (const p of problems) console.error(`  ${p}`);
      console.error('Run: node tools/build-antigravity.mjs');
      process.exit(1);
    }
    console.log('[build-antigravity] Antigravity plugin is up to date');
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
} else {
  build(OUT);
  console.log(`[build-antigravity] wrote ${relative(ROOT, OUT)} (${listFiles(OUT).length} files)`);
}
