from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class ClickBase(BaseModel):
    url_id: str
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    referer: Optional[str] = None
    country_code: Optional[str] = None

class ClickCreate(ClickBase):
    pass

class ClickOut(ClickBase):
    id: str
    clicked_at: datetime

    class Config:
        orm_mode = True
