---
name: build-and-test
description: Sets up the npm-scripts build and Jest unit tests for the JavaScript Hello World project - package.json, scripts/build.js, the tested function src/math.js and tests including BasicAddition. Use after project-scaffold or when /create-build is run.
---

# Skill: build-and-test

## Коли застосовувати
- Існує `src/hello.js` (виконано project-scaffold), але немає системи складання або тестів.
- Користувач запускає `/create-build` або оркестратор `/init`.

Skill складається з трьох підкроків, які можна виконувати окремо:
`build-config` (package.json, скрипти складання), `test-function` (`src/math.js`),
`unit-tests` (Jest-тести).

## Входи
| Параметр | Значення за замовчуванням | Опис |
|---|---|---|
| `projectName` | `hello-world-js` | поле `name` у `package.json` |
| `nodeVersion` | `>=20` | поле `engines.node` |
| `jestVersion` | остання стабільна `jest` з npm (`^30`) | версія фреймворку тестування |
| `testName` | `BasicAddition` | обов'язкова назва юніт-тесту |

Шаблони: `.github/skills/build-and-test/templates/`.

## Виходи
| Файл | Призначення |
|---|---|
| `package.json` | npm scripts: `build`, `start`, `test`, `check`, `clean`; devDependencies `jest`, `js-yaml` |
| `package-lock.json` | зафіксовані версії залежностей (створює `npm install`) |
| `jest.config.js` | середовище `node`, тести лише з `tests/` |
| `scripts/build.js` | кросплатформне складання: `build/lib/*.js`, `build/hello` (755), `build/hello.cmd` |
| `scripts/clean.js` | видаляє лише `build/` і `coverage/` |
| `src/math.js` | тестова функція `add(a, b)` з перевіркою типів |
| `tests/math.test.js` | `BasicAddition`, `AdditionWithNegativeNumbers`, `AdditionRejectsNonNumbers` |
| `tests/hello.test.js` | `GreetDefault`, `GreetByName`, `MainPrintsGreeting` |
| `docs/usage.md` | блок `<!-- agent:build:start -->…<!-- agent:build:end -->` з `templates/usage.project.md` |

## Кроки
1. **build-config.** Якщо `package.json` немає — скопіювати шаблон і замінити
   `__JEST_VERSION__` / `__JS_YAML_VERSION__` на `^<остання версія>`
   (`npm view jest version`, `npm view js-yaml version`).
   Якщо є — додати лише відсутні скрипти й залежності, існуючі значення не змінювати.
2. Скопіювати `jest.config.js`, `scripts/build.js`, `scripts/clean.js` (правило ідемпотентності з manifest).
3. **test-function.** Скопіювати `src/math.js`.
4. **unit-tests.** Скопіювати `tests/math.test.js`, `tests/hello.test.js`.
5. Виконати `npm install --no-audit --no-fund`, щоб створити/оновити `package-lock.json`
   (при повторному запуску з наявним lock-файлом — `npm ci`).
6. Оновити блок `agent:build` у `docs/usage.md`.
7. Виконати перевірки.

## Перевірки
```bash
npm run build          # exit 0; створено build/hello, build/hello.cmd, build/lib/
./build/hello          # -> Hello, World!   (Windows: build\hello.cmd)
npm test               # exit 0; у виводі "✓ BasicAddition"
git check-ignore build/ node_modules/   # обидва шляхи ігноруються
```
Успіх: складання і всі тести проходять, `build/` не потрапляє в `git status`.

## Типовий сценарій помилки
| Симптом | Причина | Дія |
|---|---|---|
| `npm test` → `No tests found` | `jest.config.js` вказує не на `tests/` або файли не мають суфікса `.test.js` | перевірити `roots` і назви файлів |
| `BasicAddition` FAIL: `expected 5, received "23"` | `add()` конкатенує рядки | повернути перевірку `Number.isFinite` з шаблону |
| `./build/hello: Permission denied` | не встановлено режим 755 | перевірити `fs.chmodSync` у `scripts/build.js` |
| `npm ci` → `package-lock.json is out of sync` | змінено `package.json` без оновлення lock | виконати `npm install`, переглянути diff lock-файлу |
| `ETARGET No matching version` | вказано неіснуючу версію | `npm view jest versions`, взяти стабільну |

## Приклад
Вхід:
```text
/create-build projectName=hello-world-js testName=BasicAddition
```
Очікуваний результат:
```text
CREATED  package.json, package-lock.json, jest.config.js
CREATED  scripts/build.js, scripts/clean.js, src/math.js
CREATED  tests/math.test.js, tests/hello.test.js
UPDATED  docs/usage.md (block agent:build)
PASS     npm run build -> build/hello, build/hello.cmd
PASS     npm test -> 6 passed (BasicAddition passed)
```
