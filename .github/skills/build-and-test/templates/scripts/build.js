'use strict';

// Cross-platform build: copies the sources to build/lib and creates the
// executables build/hello (Linux/macOS, shebang + mode 755) and
// build/hello.cmd (Windows launcher). Only build/ is ever removed.
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const srcDir = path.join(root, 'src');
const outDir = path.join(root, 'build');
const libDir = path.join(outDir, 'lib');

fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(libDir, { recursive: true });

const sources = fs.readdirSync(srcDir).filter((f) => f.endsWith('.js'));
if (!sources.includes('hello.js')) {
  console.error('build: src/hello.js not found');
  process.exit(1);
}
for (const file of sources) {
  fs.copyFileSync(path.join(srcDir, file), path.join(libDir, file));
}

const unixLauncher = path.join(outDir, 'hello');
fs.writeFileSync(
  unixLauncher,
  "#!/usr/bin/env node\n'use strict';\nprocess.exitCode = require('./lib/hello.js').main();\n",
);
fs.chmodSync(unixLauncher, 0o755);

fs.writeFileSync(path.join(outDir, 'hello.cmd'), '@echo off\r\nnode "%~dp0hello" %*\r\n');

console.log(`build: ${sources.length} source file(s) -> ${path.relative(root, libDir)}`);
console.log('build: executables -> build/hello, build/hello.cmd');
