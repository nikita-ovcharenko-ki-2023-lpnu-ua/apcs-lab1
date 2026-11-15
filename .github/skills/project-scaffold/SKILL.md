---
name: project-scaffold
description: Creates the minimal cross-platform JavaScript Hello World project - directory layout, src/hello.js, README project section and the initial .gitignore. Use when a repository has no source code yet or when /create-project is run.
---

# Skill: project-scaffold

## Коли застосовувати
- Репозиторій ще не містить вихідного коду (`src/hello.js` відсутній).
- Користувач запускає `/create-project` або оркестратор `/init`.
- Потрібно відновити відсутні файли каркаса, не чіпаючи існуючих.

## Входи
| Параметр | Значення за замовчуванням | Опис |
|---|---|---|
| `language` | `javascript` | мова проєкту; skill підтримує лише `javascript` |
| `projectName` | `hello-world-js` | назва пакета (kebab-case, `^[a-z][a-z0-9-]*$`) |
| `root` | корінь репозиторію | каталог, у якому створюється проєкт |

Шаблони: `.github/skills/project-scaffold/templates/`.

## Виходи
| Файл | Джерело | Правило при повторному запуску |
|---|---|---|
| `src/hello.js` | `templates/src/hello.js` | існує → `SKIP`, відрізняється → показати diff, не перезаписувати |
| `tests/`, `scripts/`, `docs/` | каталоги | створити, якщо немає |
| `.gitignore` | `templates/gitignore` | додати лише відсутні рядки |
| `README.md` | `templates/README.project.md` | вставити/замінити блок `<!-- agent:project:start -->…<!-- agent:project:end -->`; решту README не змінювати |

`src/hello.js` експортує `greet(name)` і `main(argv)`; при прямому запуску друкує
`Hello, World!` (або `Hello, <ім'я>!`, якщо передано аргумент).

## Кроки
1. Перевірити `language === "javascript"` і формат `projectName`; інакше — помилка.
2. Створити каталоги `src/`, `tests/`, `scripts/`, `docs/` (якщо їх немає).
3. Скопіювати `templates/src/hello.js` → `src/hello.js` за правилом ідемпотентності.
4. Злити `templates/gitignore` з `.gitignore`: для кожного рядка шаблону, якого
   немає у файлі, дописати його в кінець; порядок існуючих рядків не змінювати.
5. Оновити блок `agent:project` у `README.md` (якщо блоку немає — дописати в кінець).
6. Виконати перевірки.

## Перевірки
```bash
node -e "require('fs').accessSync('src/hello.js')"   # вихідний файл існує
node src/hello.js                                    # -> Hello, World!
node src/hello.js KI-404                             # -> Hello, KI-404!
grep -c "agent:project:start" README.md              # -> 1 (блок не задубльовано)
grep -cx "node_modules/" .gitignore                  # -> 1
```
Успіх: усі команди завершуються з кодом 0 і вивід збігається з очікуваним.

## Типовий сценарій помилки
| Симптом | Причина | Дія |
|---|---|---|
| `node: command not found` | Node.js не встановлено або не в `PATH` | зупинитися, попросити встановити Node.js ≥ 20 (LTS) |
| `README.md` містить два блоки `agent:project` | попередній запуск дописав блок замість заміни | замінити вміст між першою парою маркерів, другу пару видалити лише з дозволу користувача |
| `src/hello.js` відрізняється від шаблону | користувач змінив файл | не перезаписувати; показати diff і запитати |
| вивід не `Hello, World!` | змінено `greet()` | повідомити, перевірити `templates/src/hello.js` |

## Приклад
Вхід:
```text
/create-project language=javascript projectName=hello-world-js
```
Очікуваний результат (перший запуск):
```text
CREATED  src/hello.js
CREATED  tests/ scripts/ docs/
UPDATED  .gitignore (+18 lines)
UPDATED  README.md (block agent:project)
PASS     node src/hello.js -> Hello, World!
```
Повторний запуск: усі файли `SKIP`, перевірки `PASS`, `git status` без змін.
