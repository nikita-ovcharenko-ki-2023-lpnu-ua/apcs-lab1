---
name: github-actions
description: Creates the CI entry scripts ci.sh / ci.bat and .github/workflows/ci.yml with a Windows, Linux and macOS matrix that only calls those scripts and uploads the built executable. Use after build-and-test or when /create-actions is run.
---

# Skill: github-actions

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

Шаблони: `.github/skills/github-actions/templates/` (`ci.sh`, `ci.bat`, `ci.yml`).

## Виходи
| Файл | Призначення |
|---|---|
| `ci.sh` | Linux/macOS: `npm ci` → `npm run build` → `npm test` → запуск `build/hello` і перевірка виводу; режим 755, LF |
| `ci.bat` | Windows: ті самі кроки через `call`, перевірка коду повернення після кожного; CRLF |
| `.github/workflows/ci.yml` | одна job `build-and-test` з matrix трьох ОС |

Структура workflow (саме складання і тести — лише всередині `ci.sh` / `ci.bat`):
1. `actions/checkout` — отримання коду;
2. `actions/setup-node` — конфігурація середовища (Node.js + кеш npm);
3. `bash ./ci.sh` (не Windows) або `call ci.bat` (Windows) — складання і тестування;
4. `actions/upload-artifact` — збереження `build/` як артефакту `hello-<os>`.

Результат job зрозумілий: назва `build-and-test (<os>)`, `fail-fast: false` (видно
результат кожної ОС), підсумок у `GITHUB_STEP_SUMMARY` і артефакт з `hello`.
`permissions: contents: read`, жодних `secrets.*`.

## Кроки
1. Переконатися, що `npm run build` і `npm test` проходять локально; інакше — зупинитися.
2. Скопіювати `ci.sh` (встановити `chmod 755`), `ci.bat` (зберегти CRLF; `.gitattributes`
   містить `*.bat text eol=crlf`).
3. Скопіювати `ci.yml` у `.github/workflows/ci.yml`. Якщо файл існує — порівняти;
   не створювати другий workflow і не дублювати job.
4. Виконати перевірки.

## Перевірки
```bash
./ci.sh                                    # локальний прогін CI-скрипту -> ci: OK
node -e "require('js-yaml').load(require('fs').readFileSync('.github/workflows/ci.yml','utf8'))"
grep -E "ubuntu-latest|windows-latest|macos-latest" .github/workflows/ci.yml
grep -c "secrets\." .github/workflows/ci.yml   # -> 0
node .github/agent-tools/check.js --static     # група workflow -> PASS
```
Після push: вкладка **Actions** → три зелені job `build-and-test (…)`, артефакти `hello-*`.

## Типовий сценарій помилки
| Симптом | Причина | Дія |
|---|---|---|
| `YAMLException: bad indentation` | змішані пробіли/таби, неправильний відступ | виправити відступи (2 пробіли), повторити перевірку парсером |
| Windows job: `'ci.bat' is not recognized` / кроки після `npm` не виконуються | виклик `npm` без `call` завершує batch-файл | у `ci.bat` викликати `call npm …` |
| Linux job: `/usr/bin/env: 'bash\r'` | `ci.sh` збережено з CRLF | `.gitattributes`: `*.sh text eol=lf` |
| `Permission denied: ./ci.sh` | файл без біта виконання | у workflow викликати `bash ./ci.sh` |
| workflow не запускається | гілка не входить до `branches` | додати `develop`/`master` до `push` і `pull_request` |

## Приклад
Вхід:
```text
/create-actions branches=develop,master nodeVersion=24
```
Очікуваний результат:
```text
CREATED  ci.sh (755), ci.bat (CRLF)
CREATED  .github/workflows/ci.yml (matrix: ubuntu-latest, windows-latest, macos-latest)
PASS     ./ci.sh -> ci: OK
PASS     check --static: workflow
```
