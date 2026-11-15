# Інструкція з використання

## Запуск агента

### VS Code + GitHub Copilot
1. `code .` у корені репозиторію (гілка `develop` — лише агент).
2. Copilot Chat → у списку агентів вибрати **build-engineer**.
3. Ввести `/init` — оркестратор виконає `/git-init` → `/create-project` →
   `/create-build` → `/create-actions` → `/check`.
4. Переглянути зміни (Source Control), закомітити у гілку `feature/...`.

### Claude Code
```bash
git switch -c feature/hello-world-js develop
claude            # у корені репозиторію
> /init
```

### Окремі команди
| Команда | Приклад | Що робить |
|---|---|---|
| `/git-init` | `/git-init` | стан Git, `.gitignore` |
| `/create-project` | `/create-project language=javascript projectName=hello-world-js` | каркас |
| `/create-build` | `/create-build testName=BasicAddition` | npm scripts + Jest |
| `/create-actions` | `/create-actions branches=develop,master` | `ci.sh`, `ci.bat`, `ci.yml` |
| `/check` | `/check` | перевірка без змін |

## Локальна перевірка
```bash
npm ci
node .github/agent-tools/check.js          # повна перевірка, exit code 0 = PASS
node .github/agent-tools/check.js --static # лише структура (без складання і тестів)
```
У гілці `develop` (до `/init`) групи `project`, `workflow`, `build`, `tests`
очікувано мають `FAIL` — проєкт ще не згенеровано.
