#!/bin/bash
# Diagnostic Script for PA Frontend Deployment Issues
# This script tests your frontend locally to identify MIME type issues

echo "🔍 PA Frontend - Local Deployment Diagnostics"
echo "=============================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PREVIEW_PORT=3002
SITE_URL="http://localhost:${PREVIEW_PORT}"

echo "📦 Starting production build preview..."
cd frontend && npm run preview > /dev/null 2>&1 &
PREVIEW_PID=$!
echo "Preview server started (PID: $PREVIEW_PID) on $SITE_URL"

# Wait for server to start
sleep 3

echo ""
echo "🧪 Running diagnostics..."
echo ""

# Test 1: Main HTML
echo -e "${BLUE}[1] Testing index.html${NC}"
RESPONSE=$(curl -s -w "\n%{http_code}" "$SITE_URL/")
HTTP_CODE=$(echo "$RESPONSE" | tail -n 1)
CONTENT=$(echo "$RESPONSE" | head -n -1)
MIME=$(curl -s -I "$SITE_URL/" | grep -i "content-type" | cut -d: -f2- | xargs)

if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✅ HTTP 200${NC}"
    echo "   MIME Type: $MIME"
    if echo "$MIME" | grep -q "text/html"; then
        echo -e "${GREEN}✅ Correct MIME type${NC}"
    fi
else
    echo -e "${RED}❌ HTTP $HTTP_CODE${NC}"
fi
echo ""

# Test 2: Main JS Bundle
echo -e "${BLUE}[2] Testing Main JS Bundle${NC}"
JS_FILE=$(curl -s "$SITE_URL/" | grep -oP 'assets/[^"]*\.js' | head -1)
if [ -z "$JS_FILE" ]; then
    JS_FILE="assets/index-b-vuoCnx.js"
fi

RESPONSE=$(curl -s -w "\n%{http_code}" "$SITE_URL/$JS_FILE")
HTTP_CODE=$(echo "$RESPONSE" | tail -n 1)
MIME=$(curl -s -I "$SITE_URL/$JS_FILE" | grep -i "content-type" | cut -d: -f2- | xargs)

echo "   File: /$JS_FILE"
if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✅ HTTP 200${NC}"
    echo "   MIME Type: $MIME"
    
    if echo "$MIME" | grep -q "javascript"; then
        echo -e "${GREEN}✅ Correct MIME type (application/javascript)${NC}"
    elif echo "$MIME" | grep -q "html"; then
        echo -e "${RED}❌ WRONG MIME TYPE - Got HTML instead of JavaScript!${NC}"
        echo "   This is likely causing the MIME type error"
    elif echo "$MIME" | grep -q "octet-stream"; then
        echo -e "${RED}❌ WRONG MIME TYPE - Got application/octet-stream!${NC}"
        echo "   The server is not setting correct headers"
    fi
else
    echo -e "${RED}❌ HTTP $HTTP_CODE${NC}"
    if [ "$HTTP_CODE" = "404" ]; then
        echo -e "${YELLOW}⚠️  File not found - might be redirected to index.html${NC}"
    fi
fi
echo ""

# Test 3: CSS Bundle
echo -e "${BLUE}[3] Testing CSS Bundle${NC}"
CSS_FILE=$(curl -s "$SITE_URL/" | grep -oP 'assets/[^"]*\.css' | head -1)
if [ -z "$CSS_FILE" ]; then
    CSS_FILE="assets/index-Dw_iJgSj.css"
fi

RESPONSE=$(curl -s -w "\n%{http_code}" "$SITE_URL/$CSS_FILE")
HTTP_CODE=$(echo "$RESPONSE" | tail -n 1)
MIME=$(curl -s -I "$SITE_URL/$CSS_FILE" | grep -i "content-type" | cut -d: -f2- | xargs)

echo "   File: /$CSS_FILE"
if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✅ HTTP 200${NC}"
    echo "   MIME Type: $MIME"
    if echo "$MIME" | grep -q "css"; then
        echo -e "${GREEN}✅ Correct MIME type (text/css)${NC}"
    fi
else
    echo -e "${RED}❌ HTTP $HTTP_CODE${NC}"
fi
echo ""

# Test 4: Diagnostic Page
echo -e "${BLUE}[4] Testing Diagnostic Page${NC}"
RESPONSE=$(curl -s -w "\n%{http_code}" "$SITE_URL/diagnose.html")
HTTP_CODE=$(echo "$RESPONSE" | tail -n 1)
MIME=$(curl -s -I "$SITE_URL/diagnose.html" | grep -i "content-type" | cut -d: -f2- | xargs)

if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✅ HTTP 200${NC}"
    echo "   MIME: $MIME"
    echo "   Access at: $SITE_URL/diagnose.html"
else
    echo -e "${RED}❌ HTTP $HTTP_CODE${NC}"
fi
echo ""

# Test 5: API Backend
echo -e "${BLUE}[5] Testing Backend API${NC}"
API_RESPONSE=$(curl -s -w "\n%{http_code}" "https://persona-assistant-backend.onrender.com/api/health")
API_CODE=$(echo "$API_RESPONSE" | tail -n 1)
if [ "$API_CODE" = "200" ] || [ "$API_CODE" = "404" ]; then
    echo -e "${GREEN}✅ Backend reachable (HTTP $API_CODE)${NC}"
else
    echo -e "${YELLOW}⚠️  Backend may be offline or slow (HTTP $API_CODE)${NC}"
fi
echo ""

# Summary
echo "=============================================="
echo -e "${BLUE}📋 Summary${NC}"
echo ""
if [ "$HTTP_CODE" = "200" ] && echo "$MIME" | grep -q "javascript"; then
    echo -e "${GREEN}✅ Looks good!${NC}"
    echo "   Your frontend build is correctly configured."
    echo "   Netlify should deploy successfully."
else
    echo -e "${RED}❌ Found issues${NC}"
    echo "   Check the tests above for specific problems."
fi
echo ""

# Cleanup
echo "🧹 Cleaning up..."
kill $PREVIEW_PID 2>/dev/null
wait $PREVIEW_PID 2>/dev/null

echo ""
echo "✅ Diagnostics complete!"
