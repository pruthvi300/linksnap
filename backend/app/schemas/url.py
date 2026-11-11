from pydantic import BaseModel, HttpUrl
from typing import Optional
from datetime import datetime

class URLCreate(BaseModel):
    original_url: HttpUrl
    custom_code: Optional[str] = None
    is_private: Optional[bool] = False
    expires_at: Optional[datetime] = None
    click_limit: Optional[int] = None

class URLOut(BaseModel):
    id: str
    original_url: HttpUrl
    short_code: str
    is_private: bool
    expires_at: Optional[datetime]
    click_limit: Optional[int]
    created_at: datetime
    