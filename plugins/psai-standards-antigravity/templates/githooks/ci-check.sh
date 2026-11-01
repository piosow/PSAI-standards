#!/bin/sh
# PSAI standards — weryfikacja po stronie CI (lokalne hooki da się pominąć przez --no-verify).
# Użycie: .githooks/ci-check.sh <base-ref> [<head-ref>]
#   Sprawdza każdy commit z zakresu base..head (bez merge) oraz strukturę repo w head.

BASE="$1"
HEAD_REF="${2:-HEAD}"
[ -n "$BASE" ] || { echo "usage: $0 <base-ref> [<head-ref>]" >&2; exit 2; }

DIR="$(cd "$(dirname "$0")" && pwd)"
fail=0
tmp="$(mktemp)"
trap 'rm -f "$tmp"' EXIT

for sha in $(git rev-list --no-merges "$BASE..$HEAD_REF"); do
  git log -1 --format=%B "$sha" > "$tmp"
  printf '[psai] checking %s %s\n' "$(git log -1 --format=%h "$sha")" "$(git log -1 --format=%s "$sha")"
  PSAI_COMMIT="$sha" sh "$DIR/commit-msg" "$tmp" || fail=1
done

printf '[psai] checking repository structure at %s\n' "$HEAD_REF"
PSAI_REF="$(git rev-parse "$HEAD_REF")" sh "$DIR/pre-commit" || fail=1

[ "$fail" -eq 0 ] && echo "[psai] all checks passed"
exit $fail
