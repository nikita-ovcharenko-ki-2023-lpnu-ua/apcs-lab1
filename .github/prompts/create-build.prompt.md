---
agent: build-engineer
description: Create the npm-scripts build, the tested function and Jest unit tests using the build-and-test skill.
argument-hint: projectName=hello-world-js testName=BasicAddition
---

# /create-build

Застосуй skill [build-and-test](../skills/build-and-test/SKILL.md).
Параметри: `${input:projectName:hello-world-js}`, `${input:testName:BasicAddition}`.

## Передумови
- `/create-project` виконано: існує `src/hello.js`, `node src/hello.js` друкує `Hello, World!`.
- Доступ до npm registry (`npm ping`).

## Дії
1. Підкрок build-config: `package.json`, `jest.config.js`, `scripts/build.js`, `scripts/clean.js`.
2. Підкрок test-function: `src/math.js`.
3. Підкрок unit-tests: `tests/math.test.js`, `tests/hello.test.js`.
4. `npm install --no-audit --no-fund` (або `npm ci`, якщо lock-файл уже існує і не змінювався).
5. Оновити блок `agent:build` у `docs/usage.md`, дописати запис у `docs/ai-log.md`.

## Очікувані файли
- `package.json`, `package-lock.json`, `jest.config.js`
- `scripts/build.js`, `scripts/clean.js`, `src/math.js`
- `tests/math.test.js`, `tests/hello.test.js`
- після складання (не під Git): `build/hello`, `build/hello.cmd`, `build/lib/`

## Перевірки
```bash
npm run build && ./build/hello      # -> Hello, World!
npm test                            # -> BasicAddition passed
git status --short | grep -E "build/|node_modules/"   # -> порожньо
```

## Повідомлення про помилку
- `create-build: FAIL — npm install failed: <перший рядок помилки>`
- `create-build: FAIL — npm run build exited with <code>`
- `create-build: FAIL — test BasicAddition <status>`
