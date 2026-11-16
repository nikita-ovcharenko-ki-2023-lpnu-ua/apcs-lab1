---
name: project-scaffold
description: Generates the minimal cross-platform JavaScript Hello World project from a specification - directory layout, src/hello.js, README project section and the initial .gitignore. Use when a repository has no source code yet or when /create-project is run.
---

# Skill: project-scaffold

Skill не містить готових файлів. Він описує **вимоги**, за якими агент сам пише
код, і **перевірки**, якими агент доводить, що написане відповідає вимогам.

## Коли застосовувати
- Репозиторій ще не містить вихідного коду (`src/hello.js` відсутній).
- Користувач запускає `/create-project` або оркестратор `/init-all`.
- Потрібно відновити відсутні файли каркаса, не чіпаючи існуючих.

## Входи
| Параметр | Значення за замовчуванням | Опис |
|---|---|---|
| `language` | `javascript` | мова проєкту; skill підтримує лише `javascript` |
| `projectName` | `hello-world-js` | назва пакета (kebab-case, `^[a-z][a-z0-9-]*$`) |
| `root` | корінь репозиторію | каталог, у якому створюється проєкт |

## Виходи
| Шлях | Що має бути |
|---|---|
| `src/`, `tests/`, `scripts/`, `docs/` | каталоги проєкту |
| `src/hello.js` | застосунок Hello World (вимоги — нижче) |
| `.gitignore` | обов'язкові правила ігнорування (вимоги — нижче) |
| `README.md` | блок `<!-- agent:project:start -->` … `<!-- agent:project:end -->` з описом проєкту |

## Вимоги
### `src/hello.js`
1. Модуль CommonJS, перший рядок — `'use strict';`, без зовнішніх залежностей.
2. Експортує `greet(name)` і `main(argv)` через `module.exports`.
3. `greet(name)` повертає рядок `Hello, <name>!`. Якщо `name` не передано, він
   `null` або складається лише з пробілів — повертає `Hello, World!`. Ім'я
   обрізається від пробілів по краях.
4. `main(argv)` (за замовчуванням `process.argv.slice(2)`) друкує через
   `console.log` результат `greet(argv[0])` і повертає код `0`.
5. Під час прямого запуску (`require.main === module`) встановлює
   `process.exitCode = main()`; під час `require()` нічого не друкує.
6. Публічні функції мають JSDoc-коментарі (параметри, результат).

### `.gitignore`
Має містити щонайменше такі рядки (кожен — окремим рядком, без дублікатів):
- залежності: `node_modules/`;
- результати складання і тестів: `build/`, `coverage/`, `*.tgz`;
- журнали: `npm-debug.log*`, `*.log`;
- секрети: `.env`, `.env.*`, `*.pem`, `*.key`;
- редактори й ОС: `.vscode/*`, `!.vscode/extensions.json`, `.idea/`, `.DS_Store`, `Thumbs.db`.
Наявні рядки не змінювати й не переставляти; відсутні — дописати в кінець з коментарем групи.

### `README.md`, блок `agent:project`
Українською мовою: заголовок `## Проєкт <projectName>`, одне речення опису і
таблиця «Що → Команда» з рядками: встановити залежності (`npm ci`), зібрати
(`npm run build`), запустити зібраний файл (Linux/macOS і Windows окремо, а також
`npm start`), запустити без складання (`node src/hello.js [ім'я]`), юніт-тести
(`npm test`), повна перевірка (`npm run check`), CI локально (`./ci.sh`, `ci.bat`).
Після таблиці — один абзац про структуру каталогів. Текст поза маркерами не змінювати.

## Кроки
1. Перевірити `language === "javascript"` і формат `projectName`; інакше — помилка.
2. Створити відсутні каталоги `src/`, `tests/`, `scripts/`, `docs/`.
3. Якщо `src/hello.js` немає — **написати** його за вимогами. Якщо є — перевірити
   кожну вимогу; файл, що відповідає вимогам, не змінювати (`SKIP`).
4. Доповнити `.gitignore` відсутніми рядками.
5. Створити або замінити вміст блоку `agent:project` у `README.md`
   (якщо блоку немає — дописати в кінець файлу).
6. Виконати перевірки.

## Перевірки
```bash
node src/hello.js                                     # -> Hello, World!
node src/hello.js KI-404                              # -> Hello, KI-404!
node src/hello.js "   "                               # -> Hello, World!
node -e "const h=require('./src/hello'); console.log(typeof h.greet, typeof h.main)"   # -> function function (і жодного привітання)
grep -c "agent:project:start" README.md               # -> 1 (блок не задубльовано)
grep -cx "node_modules/" .gitignore                   # -> 1
```
Успіх: усі команди завершуються з кодом 0 і вивід збігається з очікуваним.

## Типовий сценарій помилки
| Симптом | Причина | Дія |
|---|---|---|
| `node: command not found` | Node.js не встановлено або не в `PATH` | зупинитися, попросити встановити Node.js ≥ 20 (LTS) |
| `require('./src/hello')` друкує привітання | немає перевірки `require.main === module` | додати перевірку (вимога 5) |
| `node src/hello.js "   "` → `Hello,    !` | ім'я не обрізається | виконати `trim()` і підставити `World` (вимога 3) |
| `README.md` містить два блоки `agent:project` | блок дописано замість заміни | замінити вміст між першою парою маркерів, другу пару видалити лише з дозволу користувача |
| `src/hello.js` змінено користувачем і не відповідає вимогам | ручна зміна | не перезаписувати; показати, яку вимогу порушено, і запитати |

## Приклад
Вхід:
```text
/create-project language=javascript projectName=hello-world-js
```
Очікуваний результат (перший запуск):
```text
CREATED  src/ tests/ scripts/ docs/
CREATED  src/hello.js (greet, main)
UPDATED  .gitignore (+N lines)
UPDATED  README.md (block agent:project)
PASS     node src/hello.js -> Hello, World!
```
Повторний запуск: усі файли `SKIP` (вимоги виконано), перевірки `PASS`, `git status` без змін.
