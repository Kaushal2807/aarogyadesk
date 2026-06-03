#!/usr/bin/env python3
"""
run_migrations.py — Alembic migration runner with retry for PostgreSQL (Supabase).

Two issues with serverless databases + Docker, and their fixes:

  1. IPv6 "Network unreachable" — Docker can't route to IPv6-only addresses.
     Fix: monkey-patch socket.getaddrinfo to return AF_INET (IPv4) only.
     The hostname is kept intact so TLS SNI works.

  2. Initial database latency or connection delays.
     Fix: retry with exponential backoff + connect_timeout=30 in URL.
"""

import time
import sys
import logging
import socket
import os

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
log = logging.getLogger(__name__)

DATABASE_URL = os.environ.get("DATABASE_URL", "")
MAX_RETRIES = 12
INITIAL_DELAY = 5

# ── Force IPv4-only DNS ───────────────────────────────────────────────────────
# psycopg2 tries every address returned by getaddrinfo in order.
# IPv6 addrs fail instantly with "Network unreachable", wasting time.
# This patch returns ONLY IPv4 addresses while keeping the hostname string
# intact (required for Neon's TLS SNI-based endpoint routing).
_orig_getaddrinfo = socket.getaddrinfo

def _ipv4_only_getaddrinfo(host, port, family=0, type=0, proto=0, flags=0):
    return _orig_getaddrinfo(host, port, socket.AF_INET, type, proto, flags)

socket.getaddrinfo = _ipv4_only_getaddrinfo
log.info("IPv4-only DNS patch applied (hostname kept for TLS/SNI routing)")
# ─────────────────────────────────────────────────────────────────────────────


def make_ping_url(url: str) -> str:
    """Add connect_timeout=30 to the URL for the ping test."""
    sep = "&" if "?" in url else "?"
    if "connect_timeout" not in url:
        return f"{url}{sep}connect_timeout=30"
    return url


def wait_for_db(url: str) -> bool:
    """Ping the DB with retries until reachable or max retries exceeded."""
    import psycopg2
    ping_url = make_ping_url(url)
    delay = INITIAL_DELAY

    for attempt in range(1, MAX_RETRIES + 1):
        try:
            log.info(f"[{attempt}/{MAX_RETRIES}] Connecting to Supabase (pooler endpoint) ...")
            conn = psycopg2.connect(ping_url)
            conn.close()
            log.info("✅ DB connection successful!")
            return True
        except Exception as e:
            err_line = str(e).splitlines()[0]
            log.warning(f"  ↳ Failed: {err_line}")
            if attempt < MAX_RETRIES:
                log.info(f"  ↳ Retrying in {delay}s ...")
                time.sleep(delay)
                delay = min(delay * 2, 30)
            else:
                log.error("  ↳ Max retries reached. Giving up.")
    return False


def run_migrations():
    if not DATABASE_URL:
        log.error("DATABASE_URL env var is not set. Aborting.")
        sys.exit(1)

    if not wait_for_db(DATABASE_URL):
        log.error("Could not connect to database. Migration aborted.")
        sys.exit(1)

    log.info("Running Alembic migrations ...")
    from alembic.config import Config
    from alembic import command

    alembic_cfg = Config("/app/alembic.ini")
    alembic_cfg.set_main_option("sqlalchemy.url", DATABASE_URL)
    command.upgrade(alembic_cfg, "head")
    log.info("✅ All migrations applied successfully!")


if __name__ == "__main__":
    run_migrations()

