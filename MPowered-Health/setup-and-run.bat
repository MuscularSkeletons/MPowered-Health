@echo off
setlocal enabledelayedexpansion

:: Get the exact directory where setup-and-run.bat is located
set "APP_DIR=%~dp0"

:: Check if package.json exists in this folder
if not exist "%APP_DIR%package.json" (
    echo Could not find package.json at %APP_DIR% >&2
    exit /b 1
)

:: Check if Node.js and npm are installed
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo Node.js is required. Install Node.js LTS from https://nodejs.org/ >&2
    exit /b 1
)

where npm >nul 2>&1
if %errorlevel% neq 0 (
    echo npm is required. Install Node.js LTS from https://nodejs.org/ >&2
    exit /b 1
)

:: Check if npx is installed
where npx >nul 2>&1
if %errorlevel% neq 0 (
    echo npx is missing. Update Node.js/npm and rerun this script. >&2
    exit /b 1
)

cd /d "%APP_DIR%"

:: Check if .env exists
if not exist ".env" (
    echo Supabase settings are missing from %APP_DIR%.env >&2
    echo Create a .env file with EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY then rerun. >&2
    exit /b 1
)

:: Verify environment variables in .env
findstr /R /C:"^EXPO_PUBLIC_SUPABASE_URL=." .env >nul
if %errorlevel% neq 0 (
    echo EXPO_PUBLIC_SUPABASE_URL is missing or empty in %APP_DIR%.env >&2
    exit /b 1
)

findstr /R /C:"^EXPO_PUBLIC_SUPABASE_ANON_KEY=." .env >nul
if %errorlevel% neq 0 (
    echo EXPO_PUBLIC_SUPABASE_ANON_KEY is missing or empty in %APP_DIR%.env >&2
    exit /b 1
)

echo Installing app dependencies...
call npm install

echo Starting the Expo development server ^(clearing its cache^)...
call npx expo start --clear