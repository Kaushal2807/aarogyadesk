from __future__ import annotations

import json
import logging
from typing import Any

from fastapi.encoders import jsonable_encoder

from app.core.config import settings

logger = logging.getLogger(__name__)

try:
    import redis
    from redis import Redis
except ImportError:  # pragma: no cover - depends on optional runtime package
    redis = None
    Redis = None

_client: Redis | None = None
_cache_available = True


def _get_client() -> Redis | None:
    global _client, _cache_available

    if not settings.cache_enabled or not _cache_available or redis is None:
        return None

    if _client is None:
        _client = redis.from_url(
            settings.redis_url,
            decode_responses=True,
            socket_connect_timeout=1,
            socket_timeout=1,
            health_check_interval=30,
        )

    return _client


def cache_get(key: str) -> Any | None:
    global _cache_available

    client = _get_client()
    if client is None:
        return None

    try:
        raw = client.get(key)
        if raw is None:
            return None
        return json.loads(raw)
    except Exception as exc:
        _cache_available = False
        logger.warning("Redis cache disabled after read failure: %s", exc)
        return None


def cache_set(key: str, value: Any, ttl_seconds: int | None = None) -> None:
    global _cache_available

    client = _get_client()
    if client is None:
        return

    try:
        ttl = ttl_seconds or settings.cache_default_ttl_seconds
        payload = json.dumps(jsonable_encoder(value))
        client.setex(key, ttl, payload)
    except Exception as exc:
        _cache_available = False
        logger.warning("Redis cache disabled after write failure: %s", exc)


def cache_delete_pattern(pattern: str) -> None:
    global _cache_available

    client = _get_client()
    if client is None:
        return

    try:
        keys = list(client.scan_iter(match=pattern, count=100))
        if keys:
            client.delete(*keys)
    except Exception as exc:
        _cache_available = False
        logger.warning("Redis cache disabled after invalidation failure: %s", exc)
