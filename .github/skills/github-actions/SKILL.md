---
name: github-actions
description: Generates the CI entry scripts ci.sh / ci.bat and .github/workflows/ci.yml with a Windows, Linux and macOS matrix that only calls those scripts and uploads the built executable, following a specification. Use after build-and-test or when /create-actions is run.
---

# Skill: github-actions

Skill не містить готових файлів: агент пише CI-скрипти і workflow сам за
вимогами нижче та перевіряє їх локально і парсером YAML.

## Коли застосовувати
- Проєкт складається і тестується локально (`npm run build`, `npm test` проходять).
- Користувач запускає `/create-actions` або оркестратор `/init`.

## Входи
| Параметр | Значення за замовчуванням | Опис |
|---|---|---|
| `branches` | `develop`, `master` | гілки для `push` і `pull_request` |
| `os` | `ubuntu-latest`, `windows-latest`, `macos-latest` | matrix операційних систем |
| `nodeVersion` | `24` | версія Node.js у CI (поточна LTS) |
| `artifactName` | `hello-${{ matrix.os }}` | назва артефакту з виконуваними файлами |

## Виходи
| Файл | Призначення |
|---|---|
| `ci.sh` | CI для Linux/macOS |
| `ci.bat` | CI для Windows |
| `.github/workflows/ci.yml` | workflow GitHub Actions |

## Вимоги
### Спільне для `ci.sh` і `ci.bat`
Скрипт виконує повний цикл і зупиняється з ненульовим кодом на першій помилці:
1. перейти в каталог, де лежить сам скрипт;
2. надрукувати версію Node.js (і ОС);
3. `npm ci --no-audit --no-fund` → `npm run build` → `npm test`;
4. запустити зібраний виконуваний файл, надрукувати його вивід і перевірити, що
   він **точно** дорівнює `Hello, World!`; інакше — повідомлення в stderr і код 1;
5. якщо задано змінну `GITHUB_STEP_SUMMARY` — дописати в цей файл Markdown-підсумок:
   заголовок `### <ОС>: build and tests passed`, версію Node.js і вивід програми;
6. останній рядок виводу — `ci: OK`.

### `ci.sh`
bash, `#!/usr/bin/env bash`, `set -euo pipefail`, перехід у каталог через
`cd "$(dirname "$0")"`, запуск `./build/hello`. Кінці рядків LF, права 755.

### `ci.bat`
`@echo off`, `setlocal`, `cd /d "%~dp0"`. Кожен виклик `npm` — через `call`
(інакше batch-файл завершиться після першого `npm`) з перевіркою коду
повернення (`|| exit /b 1`). Вивід `build\hello.cmd` отримати через `for /f`.
Кінці рядків CRLF (`.gitattributes`: `*.bat text eol=crlf`). Завершення — `exit /b 0`.

### `.github/workflows/ci.yml`
- `name: CI`; тригери `push` і `pull_request` на `branches`, а також `workflow_dispatch`;
- `permissions: contents: read`, жодних `secrets.*`;
- **одна** job `build-and-test` з назвою `build-and-test (${{ matrix.os }})`,
  `runs-on: ${{ matrix.os }}`, `strategy.fail-fast: false`, `matrix.os` = `os`;
- кроки, по порядку:
  1. `actions/checkout` — отримання коду;
  2. `actions/setup-node` — `node-version: nodeVersion`, `cache: npm`;
  3. для не-Windows: `shell: bash`, `run: bash ./ci.sh` (через `bash`, щоб не залежати від біта виконання);
  4. для Windows: `shell: cmd`, `run: call ci.bat`;
  5. `actions/upload-artifact` — `name: artifactName`, `path: build/`,
     `if-no-files-found: error`, `retention-days: 30`.
- Складання і тести **лише** всередині `ci.sh` / `ci.bat`; інших кроків `run` немає.
- Версії actions — **остання мажорна** версія на момент запуску, що працює на
  Node.js 24. Визначити її: `gh api repos/actions/<name>/releases/latest --jq .tag_name`
  (або сторінка Releases репозиторію `actions/<name>`), і перевірити в `action.yml`
  цього релізу `runs.using: node24`. Версії з пам'яті моделі не використовувати.

## Кроки
1. Переконатися, що `npm run build` і `npm test` проходять локально; інакше — зупинитися.
2. Визначити актуальні версії `actions/checkout`, `actions/setup-node`, `actions/upload-artifact`.
3. Написати `ci.sh` (встановити `chmod 755`) і `ci.bat` за вимогами.
4. Написати `.github/workflows/ci.yml`. Якщо файл існує — перевірити вимоги; не
   створювати другий workflow і не дублювати job.
5. Виконати перевірки.

## Перевірки
```bash
./ci.sh                                    # локальний прогін -> останній рядок "ci: OK"
file ci.sh ci.bat                          # ci.sh: ... executable; ci.bat: ... with CRLF line terminators
node -e "require('js-yaml').load(require('fs').readFileSync('.github/workflows/ci.yml','utf8'))"
grep -c "secrets\." .github/workflows/ci.yml   # -> 0
node .github/agent-tools/check.js --static     # група workflow -> PASS
```
Після push: вкладка **Actions** → три зелені job `build-and-test (…)` без попереджень, артефакти `hello-*`.

## Типовий сценарій помилки
| Симптом | Причина | Дія |
|---|---|---|
| `YAMLException: bad indentation` | змішані пробіли/таби, неправильний відступ | виправити відступи (2 пробіли), повторити перевірку парсером |
| Windows job: кроки після першого `npm` не виконуються | виклик `npm` без `call` | `call npm …` |
| Linux job: `/usr/bin/env: 'bash\r'` | `ci.sh` збережено з CRLF | `.gitattributes`: `*.sh text eol=lf` |
| попередження `Node.js 20 is deprecated … actions/<name>@vN` | застаріла мажорна версія action | взяти останній реліз (див. вимоги), перевірити `runs.using: node24` |
| push відхилено: `without workflow scope` | токен без scope `workflow` | користувач виконує `gh auth refresh -s workflow` |
| workflow не запускається | гілка не входить до `branches` | додати `develop`/`master` до `push` і `pull_request` |

## Приклад
Вхід:
```text
/create-actions branches=develop,master nodeVersion=24
```
Очікуваний результат:
```text
INFO     actions/checkout vX, actions/setup-node vY, actions/upload-artifact vZ (node24)
CREATED  ci.sh (755, LF), ci.bat (CRLF)
CREATED  .github/workflows/ci.yml (matrix: ubuntu-latest, windows-latest, macos-latest)
PASS     ./ci.sh -> ci: OK
PASS     check --static: workflow
```
