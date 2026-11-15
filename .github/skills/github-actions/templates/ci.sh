#!/usr/bin/env bash
# CI entry point for Linux and macOS: install, build, test, run the executable.
set -euo pipefail
cd "$(dirname "$0")"

echo "== Node $(node --version), npm $(npm --version), $(uname -sm)"
npm ci --no-audit --no-fund
npm run build
npm test

output="$(./build/hello)"
echo "build/hello -> ${output}"
if [ "${output}" != "Hello, World!" ]; then
  echo "ci: unexpected output of build/hello" >&2
  exit 1
fi

if [ -n "${GITHUB_STEP_SUMMARY:-}" ]; then
  {
    echo "### $(uname -s): build and tests passed"
    echo "- Node: $(node --version)"
    echo "- build/hello: \`${output}\`"
  } >> "${GITHUB_STEP_SUMMARY}"
fi
echo "ci: OK"
