'use strict';

// Removes only temporary build results.
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
for (const dir of ['build', 'coverage']) {
  fs.rmSync(path.join(root, dir), { recursive: true, force: true });
  console.log(`clean: removed ${dir}/`);
}
