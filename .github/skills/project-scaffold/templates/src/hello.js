'use strict';

/**
 * Builds a greeting for the given name.
 * An empty or missing name falls back to "World".
 * @param {string} [name]
 * @returns {string}
 */
function greet(name) {
  const who = name === undefined || name === null ? '' : String(name).trim();
  return `Hello, ${who || 'World'}!`;
}

/**
 * Program entry point: prints the greeting and returns the exit code.
 * @param {string[]} [argv] command-line arguments without "node" and the script path
 * @returns {number}
 */
function main(argv = process.argv.slice(2)) {
  console.log(greet(argv[0]));
  return 0;
}

module.exports = { greet, main };

if (require.main === module) {
  process.exitCode = main();
}
