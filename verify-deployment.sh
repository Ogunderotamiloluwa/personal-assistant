#!/bin/bash
# Quick Verification Script for Personal Assistant Deployment

echo "=========================================="
echo "Personal Assistant - Deployment Verification"
echo "=========================================="
echo ""

# Check if .env exists
echo "1. Checking environment files..."
if [ -f ".env" ]; then
    echo "   ✅ Root .env found"
    cat .env | head -3
else
    echo "   ⚠️  Root .env not found (optional)"
fi

if [ -f "frontend/.env" ]; then
    echo "   ✅ Frontend .env found"
    grep "VITE_API_URL" frontend/.env || echo "   ⚠️  VITE_API_URL not set"
else
    echo "   ⚠️  Frontend .env not found"
fi

# Check if config exists
echo ""
echo "2. Checking API configuration..."
if [ -f "frontend/src/config/apiConfig.js" ]; then
    echo "   ✅ API config found at frontend/src/config/apiConfig.js"
else
    echo "   ❌ API config NOT found - CREATE frontend/src/config/apiConfig.js"
fi

# Check backend persistence
echo ""
echo "3. Checking backend persistence..."
if [ -d "backend/data" ]; then
    echo "   ✅ backend/data directory exists"
    echo "   Files: $(ls backend/data/ | wc -l) files"
    ls -1 backend/data/ 2>/dev/null | sed 's/^/      /'
else
    echo "   ⚠️  backend/data not created yet (will be created on first run)"
fi

# Check if node_modules installed
echo ""
echo "4. Checking dependencies..."
if [ -d "backend/node_modules" ]; then
    echo "   ✅ Backend dependencies installed"
else
    echo "   ⚠️  Backend dependencies NOT installed"
    echo "      Run: cd backend && npm install"
fi

if [ -d "frontend/node_modules" ]; then
    echo "   ✅ Frontend dependencies installed"
else
    echo "   ⚠️  Frontend dependencies NOT installed"
    echo "      Run: cd frontend && npm install"
fi

# Check startup files
echo ""
echo "5. Checking startup scripts..."
[ -f "backend/server.js" ] && echo "   ✅ backend/server.js found" || echo "   ❌ backend/server.js NOT found"
[ -f "frontend/vite.config.js" ] && echo "   ✅ frontend/vite.config.js found" || echo "   ❌ frontend/vite.config.js NOT found"

# Check key updated files
echo ""
echo "6. Checking deployment-ready files..."
files_to_check=(
    "frontend/src/config/apiConfig.js"
    "frontend/src/pages/LoginPage.jsx"
    "frontend/src/pages/ChatPage.jsx"
    "backend/controllers.js"
    "DEPLOYMENT_CONFIG.md"
    "FIXES_COMPLETE.md"
)

for file in "${files_to_check[@]}"; do
    if [ -f "$file" ]; then
        echo "   ✅ $file"
    else
        echo "   ⚠️  $file"
    fi
done

# Summary
echo ""
echo "=========================================="
echo "Status Check Complete!"
echo "=========================================="
echo ""
echo "To start development:"
echo "  Terminal 1: cd backend && npm install && node server.js"
echo "  Terminal 2: cd frontend && npm install && npm run dev"
echo ""
echo "To test:"
echo "  1. Open http://localhost:5173"
echo "  2. Try: 'Tell me about my habits' in chat"
echo "  3. Try: 'Give me productivity tips' in chat"
echo "  4. F12 → Ctrl+Shift+M → Test on 375px width (iPhone SE)"
echo ""
