#!/bin/bash
# Test script to verify environment-driven configuration

echo "=== Testing Environment-Driven Configuration ==="
echo ""

# Test 1: Check that START.sh loads environment variables
echo "Test 1: START.sh loads and displays environment variables"
export VITE_API_URL="http://test-api:8080"
export FRONTEND_URL="http://test-frontend:3000"
bash START.sh | grep -E "URL:" | grep -E "test-api|test-frontend"
if [ $? -eq 0 ]; then
    echo "✅ PASSED: START.sh displays environment URLs"
else
    echo "❌ FAILED: START.sh does not display environment URLs"
fi
echo ""

# Test 2: Check that frontend config.js reads VITE_API_URL
echo "Test 2: frontend config.js relies on VITE_API_URL"
if grep -q "import.meta.env.VITE_API_URL" frontend/src/config.js; then
    if ! grep -q "||" frontend/src/config.js && ! grep -q "??" frontend/src/config.js; then
        echo "✅ PASSED: config.js uses VITE_API_URL without fallback"
    else
        echo "❌ FAILED: config.js has a fallback operator"
    fi
else
    echo "❌ FAILED: config.js does not read VITE_API_URL"
fi
echo ""

# Test 3: Check that backend database.py supports DB_ENGINE
echo "Test 3: backend database.py supports DB_ENGINE"
if grep -q "DB_ENGINE" backend/database.py && \
   grep -q "sqlite" backend/database.py && \
   grep -q "mysql" backend/database.py; then
    echo "✅ PASSED: database.py supports DB_ENGINE selection"
else
    echo "❌ FAILED: database.py does not support DB_ENGINE"
fi
echo ""

# Test 4: Check that .env.example documents DB_ENGINE
echo "Test 4: backend .env.example documents DB_ENGINE"
if grep -q "DB_ENGINE" backend/.env.example && \
   grep -q "SQLITE_URL" backend/.env.example && \
   grep -q "MYSQL_" backend/.env.example; then
    echo "✅ PASSED: .env.example documents DB_ENGINE options"
else
    echo "❌ FAILED: .env.example does not document DB_ENGINE"
fi
echo ""

# Test 5: Check that connect_args are set for SQLite
echo "Test 5: database.py sets connect_args for SQLite"
if grep -q "connect_args" backend/database.py && \
   grep -q "check_same_thread" backend/database.py; then
    echo "✅ PASSED: connect_args configured for SQLite"
else
    echo "❌ FAILED: connect_args not configured"
fi
echo ""

echo "=== All Tests Complete ==="
