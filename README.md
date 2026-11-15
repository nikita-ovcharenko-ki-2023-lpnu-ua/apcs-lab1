# Лабораторна робота № 1 — AI-агент build-engineer

**Студент:** Овчаренко Нікіта Андрійович, група КІ-404
**Викладач:** Чапля О. Ю.
**Варіант:** 15 → 3 (6 варіантів, циклічно: ((15 − 1) mod 6) + 1 = 3)

| Мова | Система складання / запуску | Тестування |
|---|---|---|
| JavaScript (Node.js) | npm scripts | Jest |

## Опис
Репозиторій містить AI-агента **build-engineer**, який за вимогами варіанта
створює мінімальний кросплатформний проєкт Hello World на JavaScript, систему
складання на npm scripts, юніт-тести Jest і CI workflow GitHub Actions для
Windows, Linux і macOS, а потім перевіряє результат.

| Компонент | Шлях |
|---|---|
| Agent manifest | [`.github/agents/build-engineer.agent.md`](.github/agents/build-engineer.agent.md) |
| Skills (3) | [`.github/skills/`](.github/skills/) — `project-scaffold`, `build-and-test`, `github-actions` |
| Commands (6) | [`.github/prompts/`](.github/prompts/) — `git-init`, `create-project`, `create-build`, `create-actions`, `check`, `init` |
| Перевірка | [`.github/agent-tools/check.js`](.github/agent-tools/check.js) |
| Архітектура | [`docs/architecture.md`](docs/architecture.md) |
| Інструкція запуску | [`docs/usage.md`](docs/usage.md) |
| Журнал AI | [`docs/ai-log.md`](docs/ai-log.md) |

## Гілки
- `develop` — лише агент з інструкціями;
- `feature/hello-world-js` — результат запуску `/init`: вихідний код, тести, CI;
- `master` — фінальний результат після перевірки.

## Запуск агента
**VS Code + GitHub Copilot Chat:** відкрити репозиторій, у Chat вибрати агента
`build-engineer` і виконати `/init`.

**Claude Code:** `claude` у корені репозиторію, потім `/init`.

Окремі кроки: `/git-init`, `/create-project`, `/create-build`, `/create-actions`, `/check`.
Детально — у [`docs/usage.md`](docs/usage.md).
