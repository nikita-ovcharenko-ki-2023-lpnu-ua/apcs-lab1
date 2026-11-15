'use strict';

/**
 * Adds two finite numbers.
 * @param {number} a
 * @param {number} b
 * @returns {number}
 * @throws {TypeError} if an argument is not a finite number
 */
function add(a, b) {
  if (!Number.isFinite(a) || !Number.isFinite(b)) {
    throw new TypeError('add() expects two finite numbers');
  }
  return a + b;
}

module.exports = { add };
