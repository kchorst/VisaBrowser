@echo off
setlocal
cd /d "%~dp0"
where py >nul 2>&1
if not errorlevel 1 (
    py -3 scripts\local.py --update
    pause
    exit /b
)
where python >nul 2>&1
if not errorlevel 1 (
    python scripts\local.py --update
    pause
    exit /b
)
echo Python 3 is required. Install it from https://www.python.org/downloads/windows/ and try again.
pause
