---
agent: build-engineer
description: Create ci.sh, ci.bat and the GitHub Actions workflow for Windows, Linux and macOS using the github-actions skill.
argument-hint: branches=develop,master nodeVersion=24
---

# /create-actions

Застосуй skill [github-actions](../skills/github-actions/SKILL.md).

## Передумови
- `/create-build` виконано: `npm run build` і `npm test` проходять.
- Встановлено devDependency `js-yaml` (для перевірки YAML).

## Дії
1. Визначити актуальні мажорні версії `actions/checkout`, `actions/setup-node`,
   `actions/upload-artifact` (`gh api repos/actions/<name>/releases/latest`).
2. Написати за вимогами skill `ci.sh` (755, LF) і `ci.bat` (CRLF).
3. Написати `.github/workflows/ci.yml`; якщо файл існує — перевірити вимоги, не дублювати job.
4. Запустити `./ci.sh` (Linux/macOS) або `ci.bat` (Windows) локально.

## Очікувані файли
- `ci.sh`, `ci.bat`, `.github/workflows/ci.yml`

## Перевірки
```bash
./ci.sh                                       # -> ci: OK
node .github/agent-tools/check.js --static    # workflow: PASS
```

## Повідомлення про помилку
- `create-actions: FAIL — ci.yml is not valid YAML: <помилка парсера>`
- `create-actions: FAIL — matrix misses <os>`
- `create-actions: FAIL — ci.sh exited with <code>`
