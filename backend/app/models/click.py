from sqlalchemy import Table, Column, String, DateTime, ForeignKey
from app.db import metadata
from datetime import datetime
import uuid

clicks = Table(
    "clicks",
    metadata,
    Column("id", String(36), primary_key=True, default=lambda: str(uuid.uuid4())),
    Column("url_id", String(36), ForeignKey("urls.id"), nullable=False),
    Column("clicked_at", DateTime, default=datetime.utcnow),
    Column("ip_address", String(45), nullable=True),  # IPv6 support
    Column("user_agent", String(255), nullable=True),
    Column("referer", String(255), nullable=True),
    Column("country_code", String(2), nullable=True)
)
