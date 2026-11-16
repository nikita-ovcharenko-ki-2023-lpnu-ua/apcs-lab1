'use strict';

const { greet, main } = require('../src/hello');

test('GreetDefault', () => {
  expect(greet()).toBe('Hello, World!');
  expect(greet('   ')).toBe('Hello, World!');
});

test('GreetByName', () => {
  expect(greet('Nikita')).toBe('Hello, Nikita!');
});

test('MainPrintsGreeting', () => {
  const log = jest.spyOn(console, 'log').mockImplementation(() => {});
  try {
    expect(main([])).toBe(0);
    expect(log).toHaveBeenCalledWith('Hello, World!');
  } finally {
    log.mockRestore();
  }
});
