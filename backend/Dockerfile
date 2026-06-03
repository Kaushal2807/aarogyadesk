FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    pkg-config \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Write startup script: run migrations (with retry for database connections) then start the server
RUN printf '#!/bin/bash\nset -e\necho "Running DB migrations..."\npython run_migrations.py\necho "Starting Uvicorn..."\nexec uvicorn app.main:app --host 0.0.0.0 --port 8000 "$@"\n' > /app/start.sh && chmod +x /app/start.sh

CMD ["/app/start.sh"]
