---
agent: build-engineer
description: Check the Git repository, create or update .gitignore and show the Git state.
---

# /git-init

## Передумови
- Встановлено `git` (`git --version`).
- Поточний каталог — корінь робочої копії (`git rev-parse --show-toplevel` збігається з `pwd`).
  Якщо репозиторію немає — запропонувати `git init -b master` і виконати лише після згоди.

## Дії
1. Показати `git --version`, поточну гілку, `git remote -v`, `git config user.name`.
2. Перевірити `.gitignore`: дописати відсутні обов'язкові рядки
   `node_modules/`, `build/`, `coverage/`, `.env` (повний набір — у
   `.github/skills/project-scaffold/templates/gitignore`). Існуючі рядки не змінювати, не дублювати.
3. Перевірити `.gitattributes`: `*.sh text eol=lf`, `*.bat text eol=crlf` (дописати відсутні).
4. Перевірити, що під Git немає тимчасових файлів і секретів:
   `git ls-files | grep -E '^(build|node_modules|coverage)/|\.env'` — має бути порожньо.
5. Показати `git status --short --branch`.
6. **Не** виконувати commit, push, зміну гілок — лише запропонувати команди.

## Очікувані файли
- `.gitignore` (створено або оновлено), `.gitattributes`.

## Перевірки
```bash
git rev-parse --is-inside-work-tree        # -> true
git check-ignore -q build/ node_modules/ coverage/ .env && echo ignored
git status --short --branch
```

## Повідомлення про помилку
- `git-init: FAIL — not a git repository (run "git init -b master")`
- `git-init: FAIL — tracked temporary files: <список>; remove with "git rm -r --cached <path>" after review`
- `git-init: FAIL — git user.name/user.email not configured`
