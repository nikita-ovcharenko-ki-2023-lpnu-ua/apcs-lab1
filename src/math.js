'use strict';

/**
 * Returns the sum of two finite numbers.
 * @param {number} a first addend
 * @param {number} b second addend
 * @returns {number} a + b
 * @throws {TypeError} when an argument is not a finite number
 */
function add(a, b) {
  if (!Number.isFinite(a) || !Number.isFinite(b)) {
    throw new TypeError(`add() expects two finite numbers, got ${typeof a} and ${typeof b}`);
  }
  return a + b;
}

module.exports = { add };
