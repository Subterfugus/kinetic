@echo off
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Kinetic needs Node.js for this local launcher. Install it from https://nodejs.org and try again.
  pause
  exit /b 1
)
node server.mjs
pause
