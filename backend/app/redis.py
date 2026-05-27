from redis.asyncio import Redis
from app.config import settings

async def get_redis() -> Redis:
    return Redis.from_url(settings.REDIS_URL, decode_responses=True )