@echo off
chcp 65001 >nul
echo ========================================
echo   PsycheNote Canvas 一键启动脚本
echo ========================================
echo.

:: 检查 Node.js 是否安装
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [错误] 未检测到 Node.js！
    echo 请先从 https://nodejs.org 下载并安装 Node.js
    echo.
    pause
    exit /b 1
)

:: 获取 Node.js 版本
for /f "tokens=*" %%i in ('node -v') do set NODE_VERSION=%%i
echo [OK] 检测到 Node.js %NODE_VERSION%

:: 检查 API 密钥配置
echo.
echo [配置] 检查 API 密钥...
if not exist "backend\.env" (
    echo [提示] 首次运行，需要配置 MiniMax API 密钥
    echo 请到 https://platform.minimaxi.com/ 注册并获取 API Key
    echo.
    set /p API_KEY=请输入你的 API Key:
    if "%API_KEY%"=="" (
        echo [错误] API Key 不能为空！
        pause
        exit /b 1
    )
    echo MINIMAX_API_KEY=%API_KEY% > "backend\.env"
    echo [OK] API 密钥已保存到 backend\.env
) else (
    echo [OK] API 密钥已配置
)

:: 检查前端依赖
echo.
echo [1/4] 检查前端依赖...
if not exist "node_modules" (
    echo [安装] 正在安装前端依赖...
    call npm install
) else (
    echo [OK] 前端依赖已安装
)

:: 检查后端依赖
echo.
echo [2/4] 检查后端依赖...
if not exist "backend\node_modules" (
    echo [安装] 正在安装后端依赖...
    cd backend
    call npm install
    cd ..
) else (
    echo [OK] 后端依赖已安装
)

:: 启动后端服务
echo.
echo [3/4] 启动后端服务 (端口 3001)...
start "PsycheNote Backend" cmd /k "cd /d %~dp0backend && node server.js"

:: 等待后端启动
timeout /t 2 /nobreak >nul

:: 启动前端服务
echo [4/4] 启动前端服务 (端口 3000)...
start "PsycheNote Frontend" cmd /k "npm run dev"

echo.
echo ========================================
echo   启动完成！
echo   - 后端: http://localhost:3001
echo   - 前端: http://localhost:3000
echo ========================================
echo.
echo 按任意键退出此窗口（服务继续在后台运行）...
pause >nul
