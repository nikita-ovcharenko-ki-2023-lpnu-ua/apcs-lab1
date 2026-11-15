'use strict';

const { add } = require('../src/math');

test('BasicAddition', () => {
  expect(add(2, 3)).toBe(5);
});

test('AdditionWithNegativeNumbers', () => {
  expect(add(-7, 4)).toBe(-3);
});

test('AdditionRejectsNonNumbers', () => {
  expect(() => add('2', 3)).toThrow(TypeError);
  expect(() => add(1, Number.NaN)).toThrow(TypeError);
});
