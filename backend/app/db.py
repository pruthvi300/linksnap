from databases import Database
from sqlalchemy import create_engine, MetaData
from urllib.parse import quote_plus  # <-- Import this

from app.core.config import settings

# 1. URL-encode the password
encoded_password = quote_plus(settings.MYSQL_PASSWORD)

# 2. Use the encoded password in the f-string
DATABASE_URL = f"mysql+pymysql://{settings.MYSQL_USER}:{encoded_password}@{settings.MYSQL_HOST}:{settings.MYSQL_PORT}/{settings.MYSQL_DB}"

# 3. Rest of your file remains the same
database = Database(DATABASE_URL)
metadata = MetaData()
engine = create_engine(DATABASE_URL)