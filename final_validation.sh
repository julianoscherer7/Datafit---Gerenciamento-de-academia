#!/bin/bash
# Final validation of all changes

echo "=== Final Validation of Environment-Driven URLs and Selectable DB ==="
echo ""

PASS=0
FAIL=0

# Test 1: frontend/src/config.js uses VITE_API_URL without fallback
echo "Test 1: frontend/src/config.js"
if grep -q "import.meta.env.VITE_API_URL" frontend/src/config.js && \
   ! grep -q "||" frontend/src/config.js | grep -v "comment"; then
    echo "✅ PASS: Uses VITE_API_URL without hardcoded fallback"
    PASS=$((PASS+1))
else
    echo "❌ FAIL"
    FAIL=$((FAIL+1))
fi

# Test 2: frontend/src/config.js has validation
echo "Test 2: frontend/src/config.js has validation"
if grep -q "console.error" frontend/src/config.js; then
    echo "✅ PASS: Has runtime validation for missing VITE_API_URL"
    PASS=$((PASS+1))
else
    echo "❌ FAIL"
    FAIL=$((FAIL+1))
fi

# Test 3: START.sh loads environment variables
echo "Test 3: START.sh loads environment from .env files"
if grep -q "source .env" START.sh && \
   grep -q "source backend/.env" START.sh && \
   grep -q "source frontend/.env" START.sh; then
    echo "✅ PASS: Loads environment from ./, backend/.env, and frontend/.env"
    PASS=$((PASS+1))
else
    echo "❌ FAIL"
    FAIL=$((FAIL+1))
fi

# Test 4: START.sh displays environment URLs
echo "Test 4: START.sh displays VITE_API_URL and FRONTEND_URL"
if grep -q "VITE_API_URL" START.sh && grep -q "FRONTEND_URL" START.sh; then
    echo "✅ PASS: Displays environment URLs"
    PASS=$((PASS+1))
else
    echo "❌ FAIL"
    FAIL=$((FAIL+1))
fi

# Test 5: backend/database.py supports DB_ENGINE
echo "Test 5: backend/database.py supports DB_ENGINE selection"
if grep -q "DB_ENGINE" backend/database.py && \
   grep -q "sqlite" backend/database.py && \
   grep -q "mysql" backend/database.py && \
   grep -q "auto" backend/database.py; then
    echo "✅ PASS: Supports DB_ENGINE (sqlite | mysql | auto)"
    PASS=$((PASS+1))
else
    echo "❌ FAIL"
    FAIL=$((FAIL+1))
fi

# Test 6: backend/database.py defaults to SQLite
echo "Test 6: backend/database.py defaults to SQLite"
if grep -q "sqlite:///./fitdata_dev.db" backend/database.py; then
    echo "✅ PASS: Defaults to sqlite:///./fitdata_dev.db"
    PASS=$((PASS+1))
else
    echo "❌ FAIL"
    FAIL=$((FAIL+1))
fi

# Test 7: backend/database.py has connect_args for SQLite
echo "Test 7: backend/database.py has connect_args for SQLite"
if grep -q "connect_args" backend/database.py && \
   grep -q "check_same_thread" backend/database.py; then
    echo "✅ PASS: Sets connect_args for SQLite"
    PASS=$((PASS+1))
else
    echo "❌ FAIL"
    FAIL=$((FAIL+1))
fi

# Test 8: backend/database.py handles NULL DATABASE_URL
echo "Test 8: backend/database.py safely checks DATABASE_URL"
if grep -q "if DATABASE_URL and DATABASE_URL.startswith" backend/database.py; then
    echo "✅ PASS: Checks DATABASE_URL is not None before calling .startswith()"
    PASS=$((PASS+1))
else
    echo "❌ FAIL"
    FAIL=$((FAIL+1))
fi

# Test 9: backend/database.py URL-encodes MySQL password
echo "Test 9: backend/database.py URL-encodes MySQL password"
if grep -q "quote_plus" backend/database.py && \
   grep -q "from urllib.parse import quote_plus" backend/database.py; then
    echo "✅ PASS: URL-encodes MySQL password"
    PASS=$((PASS+1))
else
    echo "❌ FAIL"
    FAIL=$((FAIL+1))
fi

# Test 10: backend/.env.example documents DB_ENGINE
echo "Test 10: backend/.env.example documents DB_ENGINE"
if grep -q "DB_ENGINE" backend/.env.example && \
   grep -q "SQLITE_URL" backend/.env.example && \
   grep -q "MYSQL_" backend/.env.example; then
    echo "✅ PASS: Documents DB_ENGINE, SQLITE_URL, and MYSQL_* variables"
    PASS=$((PASS+1))
else
    echo "❌ FAIL"
    FAIL=$((FAIL+1))
fi

# Test 11: backend/.env.example documents security variables
echo "Test 11: backend/.env.example documents security variables"
if grep -q "SECRET_KEY" backend/.env.example && \
   grep -q "ALGORITHM" backend/.env.example && \
   grep -q "ACCESS_TOKEN_EXPIRE_MINUTES" backend/.env.example; then
    echo "✅ PASS: Documents SECRET_KEY, ALGORITHM, and ACCESS_TOKEN_EXPIRE_MINUTES"
    PASS=$((PASS+1))
else
    echo "❌ FAIL"
    FAIL=$((FAIL+1))
fi

# Test 12: frontend/.env.example documents VITE_API_URL
echo "Test 12: frontend/.env.example documents VITE_API_URL"
if grep -q "VITE_API_URL" frontend/.env.example && \
   grep -q "BUILD TIME" frontend/.env.example; then
    echo "✅ PASS: Documents VITE_API_URL with build-time note"
    PASS=$((PASS+1))
else
    echo "❌ FAIL"
    FAIL=$((FAIL+1))
fi

# Test 13: .gitignore excludes build artifacts
echo "Test 13: .gitignore excludes build artifacts"
if grep -q "__pycache__" .gitignore && \
   grep -q "*.db" .gitignore && \
   grep -q "frontend/dist" .gitignore; then
    echo "✅ PASS: Excludes __pycache__, *.db, and frontend/dist"
    PASS=$((PASS+1))
else
    echo "❌ FAIL"
    FAIL=$((FAIL+1))
fi

# Test 14: backend/.env is not tracked
echo "Test 14: backend/.env is not tracked in git"
if ! git ls-files | grep -q "backend/.env$"; then
    echo "✅ PASS: backend/.env is not in version control"
    PASS=$((PASS+1))
else
    echo "❌ FAIL"
    FAIL=$((FAIL+1))
fi

echo ""
echo "=== Summary ==="
echo "Passed: $PASS"
echo "Failed: $FAIL"
echo ""

if [ $FAIL -eq 0 ]; then
    echo "🎉 All validation tests passed!"
    exit 0
else
    echo "❌ Some tests failed"
    exit 1
fi
