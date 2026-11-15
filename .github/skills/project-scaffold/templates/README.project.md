<!-- agent:project:start -->
## Проєкт hello-world-js

Мінімальний кросплатформний застосунок Hello World на JavaScript (Node.js).

| Що | Команда |
|---|---|
| Встановити залежності | `npm ci` |
| Зібрати | `npm run build` → `build/hello`, `build/hello.cmd` |
| Запустити зібраний файл | `./build/hello` (Linux/macOS), `build\hello.cmd` (Windows) або `npm start` |
| Запустити без складання | `node src/hello.js [ім'я]` |
| Юніт-тести (Jest) | `npm test` |
| Повна перевірка | `npm run check` |
| CI локально | `./ci.sh` (Linux/macOS), `ci.bat` (Windows) |

Структура: `src/` — вихідний код, `tests/` — тести Jest, `scripts/` — скрипти
складання, `.github/workflows/ci.yml` — GitHub Actions.
<!-- agent:project:end -->
