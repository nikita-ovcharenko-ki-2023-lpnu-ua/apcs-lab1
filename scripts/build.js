'use strict';

// Cross-platform build of the Hello World application.
// Output: build/lib/*.js (sources), build/hello (Linux/macOS executable),
// build/hello.cmd (Windows launcher). Nothing outside build/ is touched.
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const srcDir = path.join(root, 'src');
const buildDir = path.join(root, 'build');
const libDir = path.join(buildDir, 'lib');

if (!fs.existsSync(path.join(srcDir, 'hello.js'))) {
  console.error('build: error: src/hello.js not found');
  process.exit(1);
}

fs.rmSync(buildDir, { recursive: true, force: true });
fs.mkdirSync(libDir, { recursive: true });

const sources = fs.readdirSync(srcDir).filter((name) => name.endsWith('.js'));
for (const name of sources) {
  fs.copyFileSync(path.join(srcDir, name), path.join(libDir, name));
}

const executable = path.join(buildDir, 'hello');
fs.writeFileSync(
  executable,
  [
    '#!/usr/bin/env node',
    "'use strict';",
    "process.exitCode = require('./lib/hello.js').main();",
    '',
  ].join('\n'),
);
fs.chmodSync(executable, 0o755);

fs.writeFileSync(
  path.join(buildDir, 'hello.cmd'),
  ['@echo off', 'node "%~dp0hello" %*', ''].join('\r\n'),
);

console.log(`build: copied ${sources.length} file(s) to build/lib`);
console.log('build: created build/hello and build/hello.cmd');
