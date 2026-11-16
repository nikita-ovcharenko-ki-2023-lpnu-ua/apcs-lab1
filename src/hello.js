'use strict';

/**
 * Returns a greeting for the given name.
 * A missing, null or blank name is replaced with "World".
 * @param {string} [name] who to greet
 * @returns {string} greeting in the form "Hello, <name>!"
 */
function greet(name) {
  const trimmed = name == null ? '' : String(name).trim();
  return `Hello, ${trimmed === '' ? 'World' : trimmed}!`;
}

/**
 * Entry point of the program: prints the greeting for the first argument.
 * @param {string[]} [argv] arguments after "node <script>"
 * @returns {number} process exit code
 */
function main(argv = process.argv.slice(2)) {
  console.log(greet(argv[0]));
  return 0;
}

module.exports = { greet, main };

if (require.main === module) {
  process.exitCode = main();
}
