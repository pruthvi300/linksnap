#!/bin/bash

# URL Shortener - Quick Start Script
# This script helps you get started with the application

echo "🔗 LinkSnap URL Shortener - Quick Start"
echo "========================================"
echo ""

# Check Node.js version
echo "📋 Checking Node.js version..."
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)

if [ "$NODE_VERSION" -lt 20 ]; then
    echo "❌ Node.js version is too old (current: $(node --version))"
    echo "⚠️  You need Node.js 20.19+ or 22.12+"
    echo ""
    echo "To upgrade Node.js:"
    echo "  1. Install nvm: curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash"
    echo "  2. Reload shell: source ~/.bashrc"
    echo "  3. Install Node 20: nvm install 20"
    echo "  4. Use Node 20: nvm use 20"
    echo ""
    echo "After upgrading, run this script again."
    exit 1
else
    echo "✅ Node.js version is compatible: $(node --version)"
fi

echo ""
echo "📦 Checking dependencies..."

# Check if backend venv exists
if [ ! -d "backend/venv" ]; then
    echo "❌ Backend virtual environment not found"
    echo "   Please create it: cd backend && python -m venv venv"
    exit 1
else
    echo "✅ Backend virtual environment found"
fi

# Check if frontend node_modules exists
if [ ! -d "frontend/node_modules" ]; then
    echo "⚠️  Frontend dependencies not installed"
    echo "   Installing now..."
    cd frontend
    npm install
    cd ..
    echo "✅ Frontend dependencies installed"
else
    echo "✅ Frontend dependencies found"
fi

echo ""
echo "🚀 Starting the application..."
echo ""
echo "This will open two terminal windows:"
echo "  1. Backend (FastAPI) on http://localhost:8000"
echo "  2. Frontend (React) on http://localhost:5173"
echo ""

# Check if we're in a terminal that supports multiple panes
if command -v gnome-terminal &> /dev/null; then
    echo "Opening terminals..."
    
    # Start backend
    gnome-terminal --tab --title="Backend - FastAPI" -- bash -c "cd backend && source venv/bin/activate && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000; exec bash"
    
    # Wait a bit for backend to start
    sleep 2
    
    # Start frontend
    gnome-terminal --tab --title="Frontend - React" -- bash -c "cd frontend && npm run dev; exec bash"
    
    echo "✅ Application started!"
    echo ""
    echo "📱 Access the app at: http://localhost:5173"
    echo "📡 API docs at: http://localhost:8000/docs"
    
elif command -v tmux &> /dev/null; then
    echo "Using tmux..."
    
    # Create new tmux session
    tmux new-session -d -s urlshortener
    
    # Split window
    tmux split-window -h
    
    # Start backend in first pane
    tmux send-keys -t urlshortener:0.0 "cd backend && source venv/bin/activate && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000" C-m
    
    # Start frontend in second pane
    tmux send-keys -t urlshortener:0.1 "cd frontend && npm run dev" C-m
    
    # Attach to session
    tmux attach-session -t urlshortener
    
else
    echo "⚠️  No terminal multiplexer found (gnome-terminal or tmux)"
    echo ""
    echo "Please open two terminals manually:"
    echo ""
    echo "Terminal 1 (Backend):"
    echo "  cd backend"
    echo "  source venv/bin/activate"
    echo "  uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"
    echo ""
    echo "Terminal 2 (Frontend):"
    echo "  cd frontend"
    echo "  npm run dev"
    echo ""
fi
