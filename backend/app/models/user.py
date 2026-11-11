from sqlalchemy import Table, Column, String, Enum, TIMESTAMP
from app.db import metadata

import enum

class RoleEnum(str, enum.Enum):
    user = "user"
    admin = "admin"

users = Table(
    "users",
    metadata,
    Column("id", String(36), primary_key=True),
    Column("name", String(100)),
    Column("email", String(255), unique=True),
    Column("password_hash", String(255)),
    Column("role", Enum(RoleEnum), default=RoleEnum.user),
    Column("created_at", TIMESTAMP)
)
