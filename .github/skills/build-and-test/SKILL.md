---
name: build-and-test
description: Generates the npm-scripts build and Jest unit tests for the JavaScript Hello World project from a specification - package.json, scripts/build.js, the tested function src/math.js and tests including BasicAddition. Use after project-scaffold or when /create-build is run.
---

# Skill: build-and-test

Skill не містить готових файлів: агент пише конфігурацію, скрипти і тести сам
за вимогами нижче та підтверджує результат перевірками.

## Коли застосовувати
- Існує `src/hello.js` (виконано project-scaffold), але немає системи складання або тестів.
- Користувач запускає `/create-build` або оркестратор `/init-all`.

Skill складається з трьох підкроків, які можна виконувати окремо:
`build-config` (package.json, скрипти складання), `test-function` (`src/math.js`),
`unit-tests` (Jest-тести).

## Входи
| Параметр | Значення за замовчуванням | Опис |
|---|---|---|
| `projectName` | `hello-world-js` | поле `name` у `package.json` |
| `nodeVersion` | `>=20` | поле `engines.node` |
| `testName` | `BasicAddition` | обов'язкова назва юніт-тесту |

Версії `jest` і `js-yaml` не задаються наперед: агент бере останні стабільні
версії з реєстру (`npm view jest version`, `npm view js-yaml version`).

## Виходи
| Файл | Призначення |
|---|---|
| `package.json` | метадані пакета, npm scripts, devDependencies |
| `package-lock.json` | зафіксовані версії (створює `npm install`, вручну не пишеться) |
| `jest.config.js` | конфігурація Jest |
| `scripts/build.js` | кросплатформне складання з виконуваними файлами |
| `scripts/clean.js` | видалення тимчасових результатів |
| `src/math.js` | тестова функція `add(a, b)` |
| `tests/math.test.js`, `tests/hello.test.js` | юніт-тести Jest |
| `docs/usage.md` | блок `<!-- agent:build:start -->` … `<!-- agent:build:end -->` |

## Вимоги
### build-config
**`package.json`**: `name` = `projectName`, `version` `1.0.0`, змістовний `description`
англійською, `"private": true`, `license` `MIT`, `author` — автор репозиторію
(`git config user.name`), `main` `src/hello.js`, `engines.node` = `nodeVersion`.
Скрипти — саме з такими назвами і діями:

| Скрипт | Дія |
|---|---|
| `build` | `node scripts/build.js` |
| `start` | запуск зібраного `build/hello` через `node` (однаково на всіх ОС) |
| `test` | `jest --ci` |
| `check` | `node .github/agent-tools/check.js` |
| `clean` | `node scripts/clean.js` |

`devDependencies`: `jest` і `js-yaml` з префіксом `^` і версією з реєстру. Інших залежностей немає.

**`jest.config.js`**: CommonJS, `testEnvironment: 'node'`, тести шукаються лише в
`<rootDir>/tests`, покриття збирається з `src/**/*.js` у `coverage/`, `verbose: true`.

**`scripts/build.js`** — лише вбудовані модулі Node.js (`fs`, `path`), шляхи через
`path.join` від кореня проєкту (`path.resolve(__dirname, '..')`):
1. видалити попередній `build/` (і нічого поза ним);
2. створити `build/lib/` і скопіювати туди всі `src/*.js`; якщо `src/hello.js`
   немає — вивести помилку в stderr і завершитися з кодом 1;
3. створити `build/hello` — скрипт з першим рядком `#!/usr/bin/env node`, який
   підключає `./lib/hello.js` і встановлює `process.exitCode` за результатом `main()`;
   права `0o755` встановлювати явно через `fs.chmodSync` (бо `mode` у `writeFile` залежить від umask);
4. створити `build/hello.cmd` для Windows з кінцями рядків CRLF: вимкнути echo і
   запустити `node` для файлу `hello` з каталогу самого `.cmd` (`%~dp0`), передавши всі аргументи (`%*`);
5. надрукувати короткий підсумок: скільки файлів скопійовано і які виконувані файли створено.

**`scripts/clean.js`** — видаляє лише `build/` і `coverage/` (`fs.rmSync` з `force`), друкує, що видалено.

### test-function
**`src/math.js`**: CommonJS, `'use strict'`, експортує `add(a, b)`, що повертає
суму двох скінченних чисел. Якщо будь-який аргумент не є скінченним числом
(`Number.isFinite`), кидає `TypeError` з повідомленням про очікувані аргументи. JSDoc обов'язковий.

### unit-tests
Тести — верхньорівневі виклики `test(...)` (без `describe`), щоб назва тесту
дорівнювала саме `testName`:

| Файл | Тест | Що перевіряє |
|---|---|---|
| `tests/math.test.js` | `BasicAddition` | `add(2, 3)` дорівнює `5` |
| | `AdditionWithNegativeNumbers` | сума від'ємного і додатного числа |
| | `AdditionRejectsNonNumbers` | `TypeError` для рядка і для `NaN` |
| `tests/hello.test.js` | `GreetDefault` | `greet()` і `greet('   ')` → `Hello, World!` |
| | `GreetByName` | `greet('<ім'я>')` → `Hello, <ім'я>!` |
| | `MainPrintsGreeting` | `main([])` повертає `0` і викликає `console.log('Hello, World!')`; `console.log` підміняється `jest.spyOn` і обов'язково відновлюється |

### `docs/usage.md`, блок `agent:build`
Заголовок `## Складання, запуск і тестування проєкту`, блок коду bash з командами
`npm ci`, `npm run build`, запуску на Linux/macOS і Windows, `npm start -- <ім'я>`,
`npm test`, `npm run check`, `npm run clean` — кожна з коротким коментарем, що вона робить.
Після блоку — речення про локальний запуск `./ci.sh` / `ci.bat`.

## Кроки
1. **build-config.** Отримати версії з реєстру, написати `package.json`, `jest.config.js`,
   `scripts/build.js`, `scripts/clean.js`. Якщо `package.json` уже є — додати лише
   відсутні скрипти й залежності, наявні значення не змінювати.
2. **test-function.** Написати `src/math.js`.
3. **unit-tests.** Написати `tests/math.test.js`, `tests/hello.test.js`.
4. `npm install --no-audit --no-fund` — створює `package-lock.json`
   (при повторному запуску з незмінним lock-файлом — `npm ci`).
5. Оновити блок `agent:build` у `docs/usage.md`.
6. Для наявних файлів перевірити відповідність вимогам; файл, що відповідає, — `SKIP`.
7. Виконати перевірки.

## Перевірки
```bash
npm run build          # exit 0; створено build/hello, build/hello.cmd, build/lib/
ls -l build/hello      # -rwxr-xr-x (Linux/macOS)
./build/hello          # -> Hello, World!   (Windows: build\hello.cmd)
npm test               # exit 0; 6 passed, серед них "BasicAddition"
git check-ignore -v build/ node_modules/   # обидва шляхи ігноруються
```
Успіх: складання і всі тести проходять, `build/` не потрапляє в `git status`.

## Типовий сценарій помилки
| Симптом | Причина | Дія |
|---|---|---|
| `npm test` → `No tests found` | `roots` не вказує на `tests/` або файли без суфікса `.test.js` | виправити `jest.config.js` / назви файлів |
| `BasicAddition` FAIL: `expected 5, received "23"` | `add()` конкатенує рядки | додати перевірку `Number.isFinite` |
| `./build/hello: Permission denied` | не встановлено права 755 | явний `fs.chmodSync(…, 0o755)` у `scripts/build.js` |
| `npm ci` → `package-lock.json is out of sync` | змінено `package.json` без оновлення lock | `npm install`, переглянути diff lock-файлу |
| `ETARGET No matching version` | вказано неіснуючу версію | `npm view jest versions`, взяти стабільну |

## Приклад
Вхід:
```text
/create-build projectName=hello-world-js testName=BasicAddition
```
Очікуваний результат:
```text
CREATED  package.json (jest ^<версія з реєстру>, js-yaml ^<версія>), package-lock.json
CREATED  jest.config.js, scripts/build.js, scripts/clean.js, src/math.js
CREATED  tests/math.test.js, tests/hello.test.js
UPDATED  docs/usage.md (block agent:build)
PASS     npm run build -> build/hello, build/hello.cmd
PASS     npm test -> 6 passed (BasicAddition passed)
```
