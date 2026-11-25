#!/usr/bin/env bash
# Vercel "Ignored Build Step" (vercel.json ignoreCommand).
# Exit 0 = SKIP the build. Exit 1 = BUILD.
#
# Why: every push to main rebuilds ~2,338 pages. A push that only changes
# audit notes or root-level docs ships nothing to users, so it should not
# spend Build CPU. See audits/vercel-build-cost-audit-2026-11-25.md.
#
# Rule: skip ONLY when every changed file since the last successful
# deployment is under audits/, docs/, reports/, .claude/ or is a .md file
# in the repo root. Any doubt (no previous SHA, SHA missing from the shallow
# clone, diff error, empty diff) means BUILD. Never widen this to a global
# *.md: content/blogs/ holds .md files.

prev="${VERCEL_GIT_PREVIOUS_SHA:-}"
head="${VERCEL_GIT_COMMIT_SHA:-HEAD}"

if [ -z "$prev" ]; then
  echo "ignore-build: no previous deployment SHA, building"
  exit 1
fi

if ! git cat-file -e "${prev}^{commit}" 2>/dev/null; then
  echo "ignore-build: previous SHA $prev not in clone, building"
  exit 1
fi

if ! changed="$(git diff --name-only "$prev" "$head" 2>/dev/null)"; then
  echo "ignore-build: git diff failed, building"
  exit 1
fi

if [ -z "$changed" ]; then
  echo "ignore-build: no file changes since $prev, building"
  exit 1
fi

site="$(printf '%s\n' "$changed" | grep -vE '^(audits|docs|reports|\.claude)/|^[^/]+\.md$')"

if [ -z "$site" ]; then
  echo "ignore-build: docs-only change since $prev, skipping build"
  printf '%s\n' "$changed" | sed 's/^/  /'
  exit 0
fi

echo "ignore-build: site files changed since $prev, building"
printf '%s\n' "$site" | head -20 | sed 's/^/  /'
exit 1
