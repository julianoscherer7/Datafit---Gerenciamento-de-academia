"""Test script to verify database configuration"""
import os
from dotenv import load_dotenv

# Save current environment
saved_env = dict(os.environ)

def restore_env():
    """Restore environment to saved state"""
    os.environ.clear()
    os.environ.update(saved_env)

# Test 1: Default configuration (auto mode, no DATABASE_URL)
print("=== Test 1: Default configuration (auto) ===")
restore_env()
os.environ["DB_ENGINE"] = "auto"
os.environ.pop("DATABASE_URL", None)
load_dotenv(override=True)

from database import DATABASE_URL
print(f"DATABASE_URL: {DATABASE_URL}")
assert DATABASE_URL == "sqlite:///./fitdata_dev.db", "Default SQLite URL should be used"
print("✅ PASSED\n")

# Test 2: Explicit SQLite mode
print("=== Test 2: Explicit SQLite mode ===")
restore_env()
os.environ["DB_ENGINE"] = "sqlite"
os.environ["SQLITE_URL"] = "sqlite:///./custom_test.db"
# Reload module to pick up new environment
import importlib
import database
importlib.reload(database)
print(f"DATABASE_URL: {database.DATABASE_URL}")
assert database.DATABASE_URL == "sqlite:///./custom_test.db", "Custom SQLite URL should be used"
print("✅ PASSED\n")

# Test 3: MySQL mode with MYSQL_* variables
print("=== Test 3: MySQL mode with MYSQL_* variables ===")
restore_env()
os.environ["DB_ENGINE"] = "mysql"
os.environ.pop("DATABASE_URL", None)
os.environ["MYSQL_USER"] = "testuser"
os.environ["MYSQL_PASSWORD"] = "testpass"
os.environ["MYSQL_HOST"] = "testhost"
os.environ["MYSQL_PORT"] = "3307"
os.environ["MYSQL_DB"] = "testdb"
importlib.reload(database)
print(f"DATABASE_URL: {database.DATABASE_URL}")
assert "mysql+pymysql://testuser:testpass@testhost:3307/testdb" in database.DATABASE_URL, "MySQL URL should be built from parts"
print("✅ PASSED\n")

# Test 4: SQLite connect_args
print("=== Test 4: SQLite connect_args ===")
restore_env()
os.environ["DB_ENGINE"] = "sqlite"
importlib.reload(database)
assert "connect_args" in database.engine_kwargs, "connect_args should be set for SQLite"
assert database.engine_kwargs["connect_args"]["check_same_thread"] == False, "check_same_thread should be False"
print("✅ PASSED\n")

print("🎉 All tests passed!")
