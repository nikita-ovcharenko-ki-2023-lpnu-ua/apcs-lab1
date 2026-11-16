@echo off
rem CI for Windows: install dependencies, build, test, run the executable.
setlocal
cd /d "%~dp0"

for /f "delims=" %%v in ('node --version') do set "NODE_VERSION=%%v"
echo ci: Node.js %NODE_VERSION% on Windows

call npm ci --no-audit --no-fund || exit /b 1
call npm run build || exit /b 1
call npm test || exit /b 1

set "OUTPUT="
for /f "delims=" %%o in ('build\hello.cmd') do set "OUTPUT=%%o"
echo ci: build\hello.cmd -^> %OUTPUT%
if not "%OUTPUT%"=="Hello, World!" (
  echo ci: error: build\hello.cmd printed "%OUTPUT%", expected "Hello, World!" 1>&2
  exit /b 1
)

if defined GITHUB_STEP_SUMMARY (
  >> "%GITHUB_STEP_SUMMARY%" echo ### Windows: build and tests passed
  >> "%GITHUB_STEP_SUMMARY%" echo - Node.js: %NODE_VERSION%
  >> "%GITHUB_STEP_SUMMARY%" echo - build\hello.cmd: `%OUTPUT%`
)

echo ci: OK
exit /b 0
