from fastapi import APIRouter, Depends, HTTPException, status, Request, BackgroundTasks
from app.schemas.url import URLCreate, URLOut
from app.db import database
from app.models.url import urls
from app.models.click import clicks
from app.services.url_service import generate_short_code
from app.api.auth import get_current_user
from datetime import datetime
import uuid
from typing import List


router = APIRouter()

# Create URL
@router.post("/create", response_model=URLOut, status_code=status.HTTP_201_CREATED)
async def create_url(url: URLCreate, current_user: dict = Depends(get_current_user)):
    # Generate short code
    short_code = url.custom_code or generate_short_code()
    
    # Check if short_code already exists
    query = urls.select().where(urls.c.short_code == short_code)
    existing = await database.fetch_one(query)
    if existing:
        raise HTTPException(status_code=400, detail="Short code already exists")

    url_id = str(uuid.uuid4())
    now = datetime.utcnow()
    query = urls.insert().values(
        id=url_id,
        user_id=current_user["id"],
        original_url=url.original_url,
        short_code=short_code,
        is_private=url.is_private,
        expires_at=url.expires_at,
        click_limit=url.click_limit,
        created_at=now,
        updated_at=now
    )
    await database.execute(query)
    return {
        "id": url_id,
        "original_url": url.original_url,
        "short_code": short_code,
        "is_private": url.is_private,
        "expires_at": url.expires_at,
        "click_limit": url.click_limit,
        "created_at": now
    }

# Get all URLs for current user

@router.get("/me", response_model=List[URLOut])
async def get_my_urls(current_user: dict = Depends(get_current_user)):
    query = urls.select().where(urls.c.user_id == current_user["id"]).order_by(urls.c.created_at.desc())
    result = await database.fetch_all(query)
    return result

# Delete URL
@router.delete("/{url_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_url(url_id: str, current_user: dict = Depends(get_current_user)):
    # Check if URL exists and belongs to user
    query = urls.select().where(urls.c.id == url_id)
    url = await database.fetch_one(query)
    
    if not url:
        raise HTTPException(status_code=404, detail="URL not found")
        
    if url["user_id"] != current_user["id"]:
        raise HTTPException(status_code=403, detail="Not authorized to delete this URL")
    
    # Delete URL (clicks will be deleted via cascade if set up, otherwise we should delete them too)
    # Since we didn't set up cascade in SQLAlchemy explicitly, let's delete clicks first to be safe
    await database.execute(clicks.delete().where(clicks.c.url_id == url_id))
    
    # Delete the URL
    await database.execute(urls.delete().where(urls.c.id == url_id))
    
    return None

async def record_click(url_id: str, ip_address: str, user_agent: str, referer: str):
    query = clicks.insert().values(
        id=str(uuid.uuid4()),
        url_id=url_id,
        clicked_at=datetime.utcnow(),
        ip_address=ip_address,
        user_agent=user_agent,
        referer=referer
    )
    await database.execute(query)

# Redirect endpoint
@router.get("/{short_code}")
async def redirect_url(short_code: str, request: Request, background_tasks: BackgroundTasks):
    query = urls.select().where(urls.c.short_code == short_code)
    url_obj = await database.fetch_one(query)
    
    if not url_obj:
        raise HTTPException(status_code=404, detail="URL not found")
    
    # Check expiration
    if url_obj["expires_at"] and url_obj["expires_at"] < datetime.utcnow():
        raise HTTPException(status_code=410, detail="URL has expired")
        
    # Check click limit
    if url_obj["click_limit"]:
        # Count current clicks
        count_query = "SELECT COUNT(*) FROM clicks WHERE url_id = :url_id"
        current_clicks = await database.fetch_val(query=count_query, values={"url_id": url_obj["id"]})
        if current_clicks >= url_obj["click_limit"]:
             raise HTTPException(status_code=410, detail="Click limit reached")

    # Extract data for background task
    ip_address = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent")
    referer = request.headers.get("referer")

    # Record click in background to not block the redirect
    background_tasks.add_task(record_click, url_obj["id"], ip_address, user_agent, referer)
    
    return {"redirect_to": url_obj["original_url"]}

# QR Code endpoint
from fastapi.responses import StreamingResponse
import qrcode
import io

@router.get("/{short_code}/qr")
async def get_qr_code(short_code: str):
    # Construct the full URL (assuming localhost for now, ideally from config)
    # In production, this should be the public domain
    full_url = f"http://localhost:8000/urls/{short_code}"
    
    # Generate QR code
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=4,
    )
    qr.add_data(full_url)
    qr.make(fit=True)

    img = qr.make_image(fill_color="black", back_color="white")
    
    # Save to bytes buffer
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    buf.seek(0)
    
    return StreamingResponse(buf, media_type="image/png")
