@echo off
cd /d "%~dp0"
node scripts\install.mjs %*
if errorlevel 1 pause
