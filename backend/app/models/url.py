from sqlalchemy import Table, Column, String, Boolean, TIMESTAMP, Integer, ForeignKey
from app.db import metadata

urls = Table(
    "urls",
    metadata,
    Column("id", String(36), primary_key=True),
    Column("user_id", String(36), ForeignKey("users.id")),
    Column("original_url", String(2048), nullable=False),
    Column("short_code", String(20), unique=True, nullable=False),
    Column("title", String(255)),
    Column("is_private", Boolean, default=False),
    Column("custom_domain", String(255)),
    Column("expires_at", TIMESTAMP, nullable=True),
    Column("click_limit", Integer, nullable=True),
    Column("created_at", TIMESTAMP),
    Column("updated_at", TIMESTAMP)
)
