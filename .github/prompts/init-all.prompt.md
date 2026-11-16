---
agent: build-engineer
description: Orchestrator - run git-init, create-project, create-build, create-actions and check in order, stopping at the first error.
---

# /init-all (orchestrator)

Повний сценарій створення проєкту. Кожен крок — окрема command зі своїми
передумовами і перевірками. Оркестратор не виконує роботу команд сам, а
викликає їх і передає результати далі.

## Передумови
- Прочитано manifest `.github/agents/build-engineer.agent.md`.
- `git --version`, `node --version` (≥ 20), `npm --version` виконуються успішно.
- Робоча копія без незбережених змін у файлах, якими керує агент
  (`git status --short`); інакше — запитати користувача.

## Дії
Виконати **строго по черзі**; після кожного кроку перевірити його розділ «Перевірки».

| # | Command | Вхід | Результат, що передається далі |
|---|---|---|---|
| 1 | `/git-init` | — | репозиторій валідний, `.gitignore` готовий |
| 2 | `/create-project` | `language=javascript projectName=hello-world-js` | `src/hello.js`, README |
| 3 | `/create-build` | `projectName=hello-world-js testName=BasicAddition` | `package.json`, `node_modules`, тести проходять |
| 4 | `/create-actions` | `branches=develop,master nodeVersion=24` | `ci.sh`, `ci.bat`, `ci.yml` |
| 5 | `/check` | — | підсумковий `PASS`/`FAIL` |

Обробка помилок:
- Якщо крок завершився `FAIL` — **зупинитися**, наступні кроки не запускати.
  Вивести: номер і назву кроку, команду, що впала, вивід помилки, ймовірну
  причину (з розділу «Типовий сценарій помилки» skill) і пропозицію виправлення.
- Не «лагодити» результат обхідними шляхами (вимкнення тестів, видалення перевірок,
  `|| true`). Виправлення — через інструкції skill / command, після чого `/init-all` повторно.
- Повторний запуск `/init-all` після успіху має дати лише `SKIP` і `PASS`,
  `git status --short` — без змін.

## Очікувані файли
Усі файли з розділів «Очікувані файли» команд 1–4.

## Перевірки
```bash
node .github/agent-tools/check.js; echo "exit code: $?"   # -> 0
git status --short                                        # лише очікувані нові файли
```
Підсумковий звіт:
```text
init-all: 1/5 git-init        PASS
init-all: 2/5 create-project  PASS
init-all: 3/5 create-build    PASS
init-all: 4/5 create-actions  PASS
init-all: 5/5 check           PASS
init-all: DONE — commit suggestion: git add -A && git commit -m "..."
```

## Повідомлення про помилку
`init-all: STOPPED at step <n>/5 (<command>) — <причина>. Fix and run /init-all again.`
