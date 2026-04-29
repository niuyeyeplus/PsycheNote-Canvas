#!/bin/bash

# PsycheNote Canvas 一键启动脚本

echo "========================================"
echo "  PsycheNote Canvas 一键启动脚本"
echo "========================================"
echo ""

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo "[错误] 未检测到 Node.js！"
    echo "请先从 https://nodejs.org 下载并安装 Node.js"
    exit 1
fi

NODE_VERSION=$(node -v)
echo "[OK] 检测到 Node.js $NODE_VERSION"

# 检查前端依赖
echo ""
echo "[1/4] 检查前端依赖..."
if [ ! -d "node_modules" ]; then
    echo "[安装] 正在安装前端依赖..."
    npm install
else
    echo "[OK] 前端依赖已安装"
fi

# 检查后端依赖
echo ""
echo "[2/4] 检查后端依赖..."
if [ ! -d "backend/node_modules" ]; then
    echo "[安装] 正在安装后端依赖..."
    cd backend && npm install && cd ..
else
    echo "[OK] 后端依赖已安装"
fi

# 启动后端
echo ""
echo "[3/4] 启动后端服务 (端口 3001)..."
cd backend && node server.js &
BACKEND_PID=$!
cd ..

# 等待后端启动
sleep 2

# 启动前端
echo "[4/4] 启动前端服务 (端口 3000)..."
npm run dev &
FRONTEND_PID=$!

echo ""
echo "========================================"
echo "  启动完成！"
echo "  - 后端: http://localhost:3001"
echo "  - 前端: http://localhost:3000"
echo "========================================"
echo ""
echo "按 Ctrl+C 停止所有服务"

# 等待信号
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" SIGINT SIGTERM
wait
