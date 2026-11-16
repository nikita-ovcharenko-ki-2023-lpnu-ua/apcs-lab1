#!/usr/bin/env bash
# CI for Linux and macOS: install dependencies, build, test, run the executable.
set -euo pipefail
cd "$(dirname "$0")"

node_version="$(node --version)"
echo "ci: Node.js ${node_version} on $(uname -sm)"

npm ci --no-audit --no-fund
npm run build
npm test

output="$(./build/hello)"
echo "ci: build/hello -> ${output}"
if [[ "${output}" != "Hello, World!" ]]; then
  echo "ci: error: build/hello printed '${output}', expected 'Hello, World!'" >&2
  exit 1
fi

if [[ -n "${GITHUB_STEP_SUMMARY:-}" ]]; then
  cat >> "${GITHUB_STEP_SUMMARY}" <<SUMMARY
### $(uname -s): build and tests passed
- Node.js: ${node_version}
- build/hello: \`${output}\`
SUMMARY
fi

echo "ci: OK"
