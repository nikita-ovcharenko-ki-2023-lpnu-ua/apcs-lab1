<!-- agent:build:start -->
## Складання, запуск і тестування проєкту

```bash
npm ci                 # точне встановлення залежностей з package-lock.json
npm run build          # build/hello, build/hello.cmd, build/lib/*.js
./build/hello          # Linux/macOS  -> Hello, World!
build\hello.cmd        # Windows      -> Hello, World!
npm start -- Nikita    # через npm    -> Hello, Nikita!
npm test               # Jest: BasicAddition та інші тести
npm run check          # повна перевірка агента і проєкту (exit code 0 = PASS)
npm run clean          # видалити build/ і coverage/
```

CI-скрипти, які виконує GitHub Actions, можна запустити локально:
`./ci.sh` (Linux/macOS) або `ci.bat` (Windows).
<!-- agent:build:end -->
