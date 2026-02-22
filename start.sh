#!/bin/bash

echo "🚀 Starting Boss Personal Assistant..."
echo ""

# Start backend
echo "📡 Starting backend on port 5000..."
cd "C:/Users/godwin bobby/Desktop/Personal Assisyant/backend"
node server.js &
BACKEND_PID=$!
echo "Backend PID: $BACKEND_PID"

# Wait a moment for backend to start
sleep 3

# Start frontend
echo ""
echo "🎨 Starting frontend on port 3000/3001..."
cd "C:/Users/godwin bobby/Desktop/Personal Assisyant/frontend"
npm run dev &
FRONTEND_PID=$!
echo "Frontend PID: $FRONTEND_PID"

echo ""
echo "✅ All services started!"
echo "Frontend: http://localhost:3000 (or 3001 if port is in use)"
echo "Backend: http://localhost:5000"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID
