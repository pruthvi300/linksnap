from fastapi import APIRouter, Depends, HTTPException
from app.db import database
from app.models.url import urls
from app.models.click import clicks
from app.api.auth import get_current_user
from sqlalchemy import func, select
from datetime import datetime, timedelta

router = APIRouter()

@router.get("/{short_code}")
async def get_url_stats(short_code: str, current_user: dict = Depends(get_current_user)):
    # Get URL first
    query = urls.select().where(urls.c.short_code == short_code)
    url_obj = await database.fetch_one(query)
    
    if not url_obj:
        raise HTTPException(status_code=404, detail="URL not found")
        
    # Check ownership
    if url_obj["user_id"] != current_user["id"]:
        raise HTTPException(status_code=403, detail="Not authorized to view stats for this URL")

    # Get total clicks
    count_query = "SELECT COUNT(*) FROM clicks WHERE url_id = :url_id"
    total_clicks = await database.fetch_val(query=count_query, values={"url_id": url_obj["id"]})
    
    # Get clicks for last 7 days
    seven_days_ago = datetime.utcnow() - timedelta(days=7)
    
    # Group by date (simplified for MySQL)
    # Note: This raw SQL might need adjustment depending on exact MySQL version/mode
    # For simplicity, we'll fetch recent clicks and aggregate in Python for now to be safe
    
    recent_clicks_query = clicks.select().where(
        (clicks.c.url_id == url_obj["id"]) & 
        (clicks.c.clicked_at >= seven_days_ago)
    ).order_by(clicks.c.clicked_at)
    
    recent_clicks = await database.fetch_all(recent_clicks_query)
    
    # Process for chart data
    clicks_by_date = {}
    
    # Initialize last 7 days with 0
    for i in range(7):
        d = (datetime.utcnow() - timedelta(days=i)).strftime("%Y-%m-%d")
        clicks_by_date[d] = 0

    for click in recent_clicks:
        date_str = click["clicked_at"].strftime("%Y-%m-%d")
        # Only count if within our 7 day window (should be covered by query, but good for safety)
        if date_str in clicks_by_date:
            clicks_by_date[date_str] += 1
        
    # Convert to list and sort by date
    chart_data = [
        {"date": date, "count": count} 
        for date, count in clicks_by_date.items()
    ]
    chart_data.sort(key=lambda x: x["date"])
    
    return {
        "total_clicks": total_clicks,
        "chart_data": chart_data,
        "recent_clicks": recent_clicks[:10]  # Last 10 raw clicks
    }

