---
agent: build-engineer
description: Create the initial Hello World project using the project-scaffold skill.
argument-hint: language=javascript projectName=hello-world-js
---

# /create-project

Застосуй skill [project-scaffold](../skills/project-scaffold/SKILL.md).
Параметри: `${input:language:javascript}`, `${input:projectName:hello-world-js}`.

## Передумови
- `/git-init` виконано успішно (є `.gitignore`).
- `node --version` ≥ v20.

## Дії
1. Виконати кроки skill project-scaffold з переданими параметрами: код
   `src/hello.js` написати за розділом «Вимоги» skill.
2. Для кожного файлу звітувати `CREATED` / `UPDATED` / `SKIP` і для `CREATED`/`UPDATED`
   коротко пояснити, як виконано кожну вимогу.

## Очікувані файли
- `src/hello.js`, каталоги `tests/`, `scripts/`, `docs/`
- `.gitignore` (з усіма обов'язковими рядками), `README.md` (блок `agent:project`)

## Перевірки
```bash
node src/hello.js          # -> Hello, World!
grep -c "agent:project:start" README.md   # -> 1
```

## Повідомлення про помилку
- `create-project: FAIL — unsupported language "<language>" (only javascript)`
- `create-project: FAIL — node src/hello.js printed "<output>", expected "Hello, World!"`
- `create-project: STOP — src/hello.js violates requirement <n>: <опис>`
