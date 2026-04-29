@echo off
chcp 65001 >nul 2>&1
echo ========================================
echo   PsycheNote Canvas - One-Click Start
echo ========================================
echo.

:: Check Node.js
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed!
    echo Please download from https://nodejs.org
    echo.
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node -v') do set NODE_VERSION=%%i
echo [OK] Node.js %NODE_VERSION% detected

:: Check API Key configuration
echo.
echo [CONFIG] Checking API Key...
if not exist "backend\.env" (
    echo [INFO] First time setup - API Key required
    echo Please register at https://platform.minimaxi.com/
    echo.
    powershell -Command "$apiKey = Read-Host -Prompt 'Enter your API Key'; if ($apiKey) { Set-Content -Path 'backend\.env' -Value \"MINIMAX_API_KEY=$apiKey\" -Encoding UTF8; Write-Host '[OK] API Key saved' } else { Write-Host '[ERROR] API Key cannot be empty!'; exit 1 }"
    if errorlevel 1 (
        echo.
        pause
        exit /b 1
    )
) else (
    echo [OK] API Key already configured
)

:: Check frontend dependencies
echo.
echo [1/4] Checking frontend dependencies...
if not exist "node_modules" (
    echo [INSTALL] Installing frontend dependencies...
    call npm install
) else (
    echo [OK] Frontend dependencies ready
)

:: Check backend dependencies
echo.
echo [2/4] Checking backend dependencies...
if not exist "backend\node_modules" (
    echo [INSTALL] Installing backend dependencies...
    cd backend
    call npm install
    cd ..
) else (
    echo [OK] Backend dependencies ready
)

:: Start backend
echo.
echo [3/4] Starting backend service (port 3001)...
start "PsycheNote Backend" cmd /k "cd /d %~dp0backend && node server.js"

timeout /t 2 /nobreak >nul

:: Start frontend
echo [4/4] Starting frontend service (port 3000)...
start "PsycheNote Frontend" cmd /k "npm run dev"

echo.
echo ========================================
echo   Done!
echo   - Backend: http://localhost:3001
echo   - Frontend: http://localhost:3000
echo ========================================
echo.
echo Press any key to close this window...
echo (Services will keep running in background)
pause >nul
