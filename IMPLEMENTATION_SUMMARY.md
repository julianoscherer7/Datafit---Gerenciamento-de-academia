# Implementation Summary: Environment-Driven URLs and Selectable DB

## Overview
This PR centralizes environment configuration and adds database engine selection, making the application more flexible for different deployment scenarios.

## Files Modified

### 1. frontend/src/config.js
- **Change**: Removed hardcoded fallback, now relies solely on `VITE_API_URL` from `import.meta.env`
- **Impact**: Forces proper configuration of API URL at build time
- **Added**: Runtime validation with console error if VITE_API_URL is not configured

### 2. START.sh
- **Change**: Loads environment variables from `./.env`, `backend/.env`, and `frontend/.env`
- **Change**: Displays `VITE_API_URL` and `FRONTEND_URL` from environment instead of hardcoded localhost URLs
- **Impact**: Shows actual configured URLs for backend and frontend

### 3. backend/database.py
- **Change**: Added support for `DB_ENGINE` environment variable (sqlite | mysql | auto)
- **Change**: Defaults to `sqlite:///./fitdata_dev.db` when DATABASE_URL is not provided
- **Change**: Added `connect_args` for SQLite to handle thread safety
- **Change**: Added URL encoding for MySQL passwords to handle special characters
- **Security**: Added null check before calling `.startswith()` on DATABASE_URL
- **Impact**: Allows flexible database configuration without code changes

### 4. backend/.env.example
- **Change**: Documented `DB_ENGINE`, `SQLITE_URL`, and `MYSQL_*` examples
- **Change**: Added security-related variables (SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES)
- **Impact**: Provides clear guidance for all configuration options

### 5. frontend/.env.example
- **Change**: Added documentation that VITE_API_URL is embedded at BUILD TIME
- **Impact**: Helps developers understand when rebuilds are needed

### 6. .gitignore
- **Change**: Added exclusions for Python cache files, SQLite databases, and frontend build artifacts
- **Impact**: Keeps repository clean of build artifacts and local databases

## Configuration Options

### Frontend Configuration
Set in `frontend/.env`:
```bash
VITE_API_URL=http://localhost:8000  # Development
# or
VITE_API_URL=https://api.production.com  # Production
```

**Important**: Changes require rebuilding the frontend with `npm run build`

### Backend Database Configuration

#### SQLite (Default)
```bash
DB_ENGINE=sqlite
SQLITE_URL=sqlite:///./fitdata_dev.db
```

#### MySQL
```bash
DB_ENGINE=mysql
DATABASE_URL=mysql+pymysql://user:password@host:3306/database
# or use individual variables:
MYSQL_USER=root
MYSQL_PASSWORD=password
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_DB=fitdata_dev
```

#### Auto Mode (Default)
```bash
DB_ENGINE=auto  # Uses DATABASE_URL if set, otherwise defaults to SQLite
```

## Security Improvements
- Removed `backend/.env` from version control
- Added URL encoding for MySQL passwords with special characters
- Added null checks before string operations
- Documented required security variables (SECRET_KEY, etc.)
- Added runtime validation for missing configuration

## Testing
All changes have been validated:
- ✅ Frontend builds successfully with VITE_API_URL
- ✅ Backend starts with SQLite (default)
- ✅ Database seeding works (seed.py)
- ✅ Multiple DB_ENGINE modes tested (auto, sqlite, mysql)
- ✅ MySQL password encoding with special characters
- ✅ START.sh displays environment URLs
- ✅ No security vulnerabilities (CodeQL scan passed)

## Usage Instructions

### Development Setup
```bash
# Frontend
cd frontend
cp .env.example .env
# Edit .env to set VITE_API_URL
npm install
npm run build

# Backend
cd backend
cp .env.example .env
# Edit .env to configure database and security
python seed.py
python -m uvicorn main:app --reload
```

### Quick Start
```bash
# Run START.sh to see configured URLs
bash START.sh
```

## Migration Notes
- Existing deployments using SQLite will continue to work (default behavior)
- To switch to MySQL, set `DB_ENGINE=mysql` and provide connection details
- Frontend must be rebuilt if API URL changes
- Generate a secure SECRET_KEY for production: `python -c "import secrets; print(secrets.token_urlsafe(32))"`
