import uuid
from redis.asyncio import Redis

PRESENCE_TTL = 90   

async def set_online(redis: Redis, user_id: uuid.UUID) -> None:
    await redis.setex(f"presence:{user_id}", PRESENCE_TTL, "1")
    
async def set_offline(redis: Redis, user_id: uuid.UUID) -> None:
    await redis.delete(f"presence:{user_id}")
    
async def is_online(redis: Redis, user_id: uuid.UUID) -> bool:
    return await redis.exists(f"presence:{user_id}")