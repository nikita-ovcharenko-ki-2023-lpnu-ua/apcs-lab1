---
agent: build-engineer
description: Verify structure, configuration, build, tests and the YAML workflow without changing the project.
---

# /check

Команда **нічого не змінює** в проєкті: не редагує, не створює і не видаляє
файли під Git. Дозволено лише запис у `build/` (ігнорується Git).

## Передумови
- Встановлено залежності (`npm ci`); без них build/tests/YAML-перевірки дадуть `FAIL`.

## Дії
1. Запустити автоматичну перевірку: `node .github/agent-tools/check.js`
   (групи `agent`, `skills`, `commands`, `project`, `workflow`, `git`, `build`, `tests`).
2. Ручна перевірка (агент читає файли і відповідає «так/ні» з поясненням):
   - кожна command має одну однозначну дію;
   - skills не суперечать manifest;
   - кожен згенерований файл виконує всі пункти розділу «Вимоги» свого skill
     (пройти списком і для кожного пункту відповісти «так/ні»);
   - у skills немає готових файлів-заготовок (лише вимоги й перевірки).
3. Показати `git status --short` — має бути таким самим, як до запуску.
4. Сформувати підсумок: таблиця `PASS`/`FAIL`, загальний результат.
   Якщо хоча б один `FAIL` — результат `FAIL`, без пом'якшень.

## Очікувані файли
- Жодних нових файлів під Git. Тимчасово: `build/`, `build/jest-results.json`.

## Перевірки
```bash
node .github/agent-tools/check.js; echo "exit code: $?"   # 0 = PASS
git status --short                                        # без змін
```

## Повідомлення про помилку
- `check: FAIL — <N> check(s) failed` + список рядків `[FAIL]` з причиною.
- `check: FAIL — working tree changed during check` (якщо `git status` змінився).
