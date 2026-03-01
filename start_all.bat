@echo off
:: ============================================================
:: StratAxis — Full Stack Startup Script
:: ============================================================
:: This script starts all three layers in the CORRECT ORDER:
::   1. Supabase Docker stack (Kong, GoTrue, PostgreSQL, etc.)
::   2. FastAPI backend (waits for DB to be ready automatically)
::   3. Vite frontend dev server
::
:: USAGE:
::   Double-click start_all.bat   OR   run it in a terminal
:: ============================================================

setlocal

set SUPABASE_DIR=%~dp0infrastructure\supabase-docker\docker
set BACKEND_DIR=%~dp0backend
set FRONTEND_DIR=%~dp0frontend

echo.
echo ============================================================
echo   StratAxis — Starting Full Stack
echo ============================================================
echo.

:: ── Step 1: Start Supabase Docker ────────────────────────────
echo [1/3] Starting Supabase Docker stack...
cd /d "%SUPABASE_DIR%"
docker compose up -d
if errorlevel 1 (
    echo.
    echo ERROR: Docker Compose failed.
    echo Make sure Docker Desktop is running, then try again.
    pause
    exit /b 1
)

echo.
echo [1/3] Waiting 15s for Supabase containers to become healthy...
timeout /t 15 /nobreak >nul

:: ── Step 2: Start FastAPI Backend ────────────────────────────
echo.
echo [2/3] Starting FastAPI backend on port 8081...
echo       (It will retry DB connection automatically if needed)
cd /d "%BACKEND_DIR%"
start "StratAxis Backend" cmd /k "uvicorn src.main:app --host 0.0.0.0 --port 8081 --reload"

:: Give backend 5s to start before frontend
timeout /t 5 /nobreak >nul

:: ── Step 3: Start Vite Frontend ──────────────────────────────
echo.
echo [3/3] Starting Vite frontend...
cd /d "%FRONTEND_DIR%"
start "StratAxis Frontend" cmd /k "npm run dev"

echo.
echo ============================================================
echo   All services started!
echo.
echo   Supabase Studio : http://localhost:8000
echo   FastAPI Docs    : http://localhost:8081/api/docs
echo   FastAPI Health  : http://localhost:8081/api/health
echo   Frontend (Vite) : http://localhost:5173
echo ============================================================
echo.
echo   To stop everything:
echo     docker compose -f infrastructure\supabase-docker\docker\docker-compose.yml down
echo     (and close the backend/frontend terminal windows)
echo.
pause
