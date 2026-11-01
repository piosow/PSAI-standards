#!/bin/sh
# Testy hooków PSAI: git hooki (commit-msg, pre-commit) i guard Claude Code.
# Uruchom z katalogu głównego repo: sh tests/run.sh
set -u

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
HOOKS="$ROOT/plugins/psai-standards/templates/githooks"
GUARD="$ROOT/plugins/psai-standards/scripts/guard-git.mjs"
pass=0; failn=0

ok()  { pass=$((pass+1)); }
bad() { failn=$((failn+1)); printf 'FAIL: %s\n' "$1"; }

# Repo testowe z kompletną strukturą PSAI
T="$(mktemp -d)"
trap 'rm -rf "$T"' EXIT
cd "$T" || exit 1
git init -q
git config user.email t@t.t; git config user.name t
mkdir -p docs/features .githooks
cp "$HOOKS"/* .githooks/
echo "# x" > instructions.md
printf '# Docs\n' > docs/README.md
printf '# Changelog\n\n## [Unreleased]\n' > docs/CHANGELOG.md
printf '# Glossary\n' > docs/GLOSSARY.md
git add -A
git -c core.hooksPath=/dev/null commit -qm "chore(repo): bootstrap test repository"
git config core.hooksPath .githooks

msg() { printf '%b' "$1" > "$T/msg"; }
# expect_cm <0|1> <opis> — uruchamia commit-msg na $T/msg
expect_cm() {
  sh .githooks/commit-msg "$T/msg" 2>/dev/null; rc=$?
  if [ "$1" -eq 0 ] && [ $rc -eq 0 ]; then ok; elif [ "$1" -ne 0 ] && [ $rc -ne 0 ]; then ok; else bad "commit-msg: $2 (rc=$rc)"; fi
}

# --- commit-msg: format ---
msg 'docs(readme): describe installation steps\n';                      expect_cm 0 "valid docs commit"
msg 'updated stuff\n';                                                  expect_cm 1 "non-conventional header"
msg 'fix: fix\n';                                                       expect_cm 1 "too short description"
msg 'chore: cleanup\n';                                                 expect_cm 1 "generic description"
msg 'chore(deps): bump packages to latest minor versions\n';            expect_cm 0 "chore without body"
msg 'Merge branch '"'"'x'"'"' into main\n';                             expect_cm 0 "merge commit"
msg 'fixup! docs(readme): describe installation steps\n';               expect_cm 0 "fixup commit"
msg "docs: $(printf '%0.sa' $(seq 1 100))\n";                           expect_cm 1 "header over 100 chars"

# --- commit-msg: body + changelog ---
msg 'feat(api): add reservation export endpoint\n';                     expect_cm 1 "feat without body"
msg 'feat(api): add reservation export endpoint\n\nAdds GET /export.\n'; expect_cm 1 "feat without changelog staged"
echo "- export" >> docs/CHANGELOG.md; git add docs/CHANGELOG.md
msg 'feat(api): add reservation export endpoint\n\nAdds GET /export.\n'; expect_cm 0 "feat with body and changelog"
msg 'feat(api): add reservation export endpoint\n\nRefs: #1\n';         expect_cm 1 "trailer-only body"
git reset -q docs/CHANGELOG.md; git checkout -q docs/CHANGELOG.md
msg 'refactor(core)!: rename booking aggregate to reservation\n\nRenames types.\n'; expect_cm 1 "breaking change without changelog"
msg 'fix(core): handle null customer id in reservation lookup\n\nNull ids crashed lookup.\n\nChangelog: skip\n'; expect_cm 0 "human changelog skip"
git config psai.requireBody always
msg 'docs(readme): describe installation steps\n';                      expect_cm 1 "requireBody=always"
git config --unset psai.requireBody

# --- commit-msg: atrybucja AI ---
msg 'docs(readme): describe installation steps\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>\n'
expect_cm 0 "attribution stripped locally"
grep -qi 'co-authored-by' "$T/msg" && bad "attribution line not removed" || ok
msg 'docs(readme): describe installation steps\n\nBody.\n\n\360\237\244\226 Generated with [Claude Code](https://claude.com/claude-code)\nClaude-Session: https://claude.ai/code/session_x\n'
expect_cm 0 "footer stripped locally"
grep -qiE 'generated|claude-session|claude\.ai' "$T/msg" && bad "footer not removed" || ok
msg 'docs(readme): describe installation steps\n\nCo-authored-by: Jan Kowalski <jan@firma.pl>\n'
expect_cm 0 "human co-author kept"
grep -q 'Jan Kowalski' "$T/msg" && ok || bad "human co-author removed"
msg 'feat(router): add Claude Haiku fallback provider\n\nRoutes cheap prompts to Claude Haiku.\n'
echo "- router" >> docs/CHANGELOG.md; git add docs/CHANGELOG.md
expect_cm 0 "product name as subject is not attribution"
git reset -q docs/CHANGELOG.md; git checkout -q docs/CHANGELOG.md
msg 'docs(readme): describe installation steps\n\nCo-Authored-By: GitHub Copilot <x@y>\n'
PSAI_COMMIT=HEAD sh .githooks/commit-msg "$T/msg" 2>/dev/null && bad "CI mode must fail on attribution" || ok

# --- pre-commit ---
sh .githooks/pre-commit 2>/dev/null && ok || bad "pre-commit on valid structure"
echo "# F" > docs/features/export.md; git add docs/features/export.md
sh .githooks/pre-commit 2>/dev/null && bad "unlinked feature doc accepted" || ok
echo "- [Export](features/export.md)" >> docs/README.md; git add docs/README.md
sh .githooks/pre-commit 2>/dev/null && ok || bad "linked feature doc rejected"
echo "# T" > docs/features/_template.md; git add docs/features/_template.md
sh .githooks/pre-commit 2>/dev/null && ok || bad "_template should be ignored"
git rm -q --cached docs/GLOSSARY.md
sh .githooks/pre-commit 2>/dev/null && bad "missing glossary accepted" || ok
git add docs/GLOSSARY.md

# --- pełny commit przez git ---
git commit -qm "docs(features): document reservation export feature" 2>/dev/null && ok || bad "real commit through hooks"
git commit -q --allow-empty -m "wip" 2>/dev/null && bad "real bad commit accepted" || ok
sh .githooks/ci-check.sh HEAD~1 2>/dev/null >/dev/null && ok || bad "ci-check on good range"

# --- guard Claude Code ---
# expect_guard <deny|allow> <komenda> <opis>
expect_guard() {
  out="$(node -e 'process.stdout.write(JSON.stringify({tool_name:"Bash",tool_input:{command:process.argv[1]}}))' "$2" | node "$GUARD")"
  case "$out" in *'"deny"'*) got=deny ;; *) got=allow ;; esac
  [ "$got" = "$1" ] && ok || bad "guard: $3 (got $got)"
}
expect_guard allow 'ls -la'                                                       "non-git command"
expect_guard allow 'git status'                                                   "git status"
expect_guard allow 'git commit -m "docs: describe the -n flag usage"'             "-n inside message"
expect_guard deny  'git commit --no-verify -m "docs: describe install steps"'     "--no-verify"
expect_guard deny  'git commit -nm "docs: describe install steps"'                "-n combined flag"
expect_guard deny  'git -c core.hooksPath=/dev/null commit -m "x"'                 "inline hooksPath"
expect_guard deny  'git config --unset core.hooksPath'                             "unset hooksPath"
expect_guard allow 'git config core.hooksPath .githooks'                           "set hooksPath to .githooks"
expect_guard allow 'git config --get core.hooksPath'                               "read hooksPath"
expect_guard deny  'git commit'                                                    "commit without message"
expect_guard deny  "$(printf 'git commit -F - <<'"'"'EOF'"'"'\ndocs: describe install steps\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>\nEOF')" "attribution in heredoc"
expect_guard deny  'git commit -m "fix(x): handle null ids in lookup" -m "Changelog: skip"' "changelog skip by agent"
expect_guard allow "$(printf 'git commit -F - <<'"'"'EOF'"'"'\nfeat(router): add Claude Haiku fallback\n\nBody.\nEOF')" "product name not attribution"

printf '\n%s passed, %s failed\n' "$pass" "$failn"
[ "$failn" -eq 0 ]
