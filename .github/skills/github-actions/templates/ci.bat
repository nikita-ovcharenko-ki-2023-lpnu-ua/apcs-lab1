@echo off
rem CI entry point for Windows: install, build, test, run the executable.
setlocal
cd /d "%~dp0"

for /f "delims=" %%v in ('node --version') do set NODE_VER=%%v
echo == Node %NODE_VER%, Windows
call npm ci --no-audit --no-fund || exit /b 1
call npm run build || exit /b 1
call npm test || exit /b 1

set OUTPUT=
for /f "delims=" %%o in ('build\hello.cmd') do set OUTPUT=%%o
echo build\hello.cmd -^> %OUTPUT%
if not "%OUTPUT%"=="Hello, World!" (
  echo ci: unexpected output of build\hello.cmd 1>&2
  exit /b 1
)

if defined GITHUB_STEP_SUMMARY (
  echo ### Windows: build and tests passed>> "%GITHUB_STEP_SUMMARY%"
  echo - Node: %NODE_VER%>> "%GITHUB_STEP_SUMMARY%"
  echo - build\hello.cmd: `%OUTPUT%`>> "%GITHUB_STEP_SUMMARY%"
)
echo ci: OK
exit /b 0
