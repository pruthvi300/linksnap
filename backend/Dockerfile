FROM python:3.10-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Default port if not provided
ENV PORT=8000
EXPOSE $PORT

# Use shell form to expand the PORT variable which Railway injects
CMD sh -c "uvicorn app.main:app --host 0.0.0.0 --port ${PORT}"
