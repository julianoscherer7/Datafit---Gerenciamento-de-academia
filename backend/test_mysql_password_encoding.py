"""Test MySQL password encoding with special characters"""
import os
from dotenv import load_dotenv

# Test MySQL password with special characters
print("=== Testing MySQL Password URL Encoding ===")
os.environ["DB_ENGINE"] = "mysql"
os.environ.pop("DATABASE_URL", None)
os.environ["MYSQL_USER"] = "root"
os.environ["MYSQL_PASSWORD"] = "p@ss:word/with$pecial&chars"
os.environ["MYSQL_HOST"] = "localhost"
os.environ["MYSQL_PORT"] = "3306"
os.environ["MYSQL_DB"] = "testdb"

import database
import importlib
importlib.reload(database)

print(f"Raw password: {os.environ['MYSQL_PASSWORD']}")
print(f"Generated URL: {database.DATABASE_URL}")

# Check that special characters are encoded
assert "p%40ss%3Aword%2Fwith%24pecial%26chars" in database.DATABASE_URL, "Password should be URL encoded"
print("✅ PASSED: Special characters are properly URL encoded")

print("\n🎉 Password encoding test passed!")
