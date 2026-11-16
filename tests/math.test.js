'use strict';

const { add } = require('../src/math');

test('BasicAddition', () => {
  expect(add(2, 3)).toBe(5);
});

test('AdditionWithNegativeNumbers', () => {
  expect(add(-10, 4)).toBe(-6);
});

test('AdditionRejectsNonNumbers', () => {
  expect(() => add('2', 3)).toThrow(TypeError);
  expect(() => add(2, Number.NaN)).toThrow(TypeError);
});
