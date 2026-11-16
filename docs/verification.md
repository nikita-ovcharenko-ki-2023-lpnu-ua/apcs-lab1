# Докази перевірки результату

## Локально (Linux Mint 22.3, Node.js 24.22.3, npm 11.19.1)
| Перевірка | Команда | Результат |
|---|---|---|
| Повна перевірка агента і проєкту | `node .github/agent-tools/check.js` | `check: 40 passed, 0 failed`, exit code 0 |
| Складання | `npm run build` | `build/hello` (755), `build/hello.cmd`, `build/lib/{hello,math}.js` |
| Виконуваний файл | `./build/hello` | `Hello, World!` |
| Юніт-тести | `npm test` | 6 passed, `BasicAddition` passed |
| CI-скрипт | `./ci.sh` | `ci: OK` |
| Ідемпотентність | повторний `/init-all` + порівняння SHA-256 | жоден файл не змінився |
| Зламана перевірка | `add()` повертає `a + b + 1` | `check` FAIL для `BasicAddition`, exit code 1 |
| Git | `git status --ignored` | `build/`, `node_modules/` — ignored, не під Git |

## GitHub Actions
| Run | Подія | ubuntu-latest | windows-latest | macos-latest |
|---|---|---|---|---|
| [43797834388](https://github.com/nikita-ovcharenko-ki-2023-lpnu-ua/apcs-lab1/actions/runs/43797834388) | pull_request | ✓ | ✓ | ✓ |

Артефакти з виконуваними файлами: `hello-ubuntu-latest`, `hello-windows-latest`,
`hello-macos-latest` (вміст `build/`). Після розпакування архіву на Linux/macOS
біт виконання втрачається (особливість zip): `chmod +x hello` або `node hello`.

Pull request: [#1 lab1/finish](https://github.com/nikita-ovcharenko-ki-2023-lpnu-ua/apcs-lab1/pull/1).
