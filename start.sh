#!/bin/bash

# PsycheNote Canvas One-Click Start Script

echo "========================================"
echo "  PsycheNote Canvas - One-Click Start"
echo "========================================"
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "[ERROR] Node.js is not installed!"
    echo "Please download from https://nodejs.org"
    exit 1
fi

NODE_VERSION=$(node -v)
echo "[OK] Node.js $NODE_VERSION detected"

# Check API Key configuration
echo ""
echo "[CONFIG] Checking API Key..."
if [ ! -f "backend/.env" ]; then
    echo "[INFO] First time setup - API Key required"
    echo "Please register at https://platform.minimaxi.com/"
    echo ""
    read -r -s -p "Enter your API Key: " API_KEY
    echo
    if [ -z "$API_KEY" ]; then
        echo "[ERROR] API Key cannot be empty!"
        exit 1
    fi
    umask 077
    printf 'MINIMAX_API_KEY=%s\n' "$API_KEY" > backend/.env
    chmod 600 backend/.env
    echo "[OK] API Key saved to backend/.env"
else
    echo "[OK] API Key already configured"
fi

# Check frontend dependencies
echo ""
echo "[1/4] Checking frontend dependencies..."
if [ ! -d "node_modules" ]; then
    echo "[INSTALL] Installing frontend dependencies..."
    npm install
else
    echo "[OK] Frontend dependencies ready"
fi

# Check backend dependencies
echo ""
echo "[2/4] Checking backend dependencies..."
if [ ! -d "backend/node_modules" ]; then
    echo "[INSTALL] Installing backend dependencies..."
    cd backend && npm install && cd ..
else
    echo "[OK] Backend dependencies ready"
fi

# Start backend
echo ""
echo "[3/4] Starting backend service (port 3001)..."
cd backend && node server.js &
BACKEND_PID=$!
cd ..

# Wait for backend
sleep 2

# Start frontend
echo "[4/4] Starting frontend service (port 3000)..."
npm run dev &
FRONTEND_PID=$!

echo ""
echo "========================================"
echo "  Done!"
echo "  - Backend: http://localhost:3001"
echo "  - Frontend: http://localhost:3000"
echo "========================================"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for signal
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" SIGINT SIGTERM
wait
