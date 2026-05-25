from sqlalchemy.ext.asyncio import AsyncSession
from app.models import Room, RoomMember, User, Message
from sqlalchemy import select, asc
from sqlalchemy.orm import selectinload
import uuid

async def create_room(db: AsyncSession, name: str, user: User) -> Room:
    room = Room(
        name=name,
        is_direct=False, 
        created_by=user.id,
    )
    
    room_member = RoomMember(user_id=user.id)
    room.members.append(room_member)
    
    db.add(room)
    await db.commit()
    await db.refresh(room)
    return room

async def join_room(db: AsyncSession, code: str, user: User) -> Room | None:
    result = await db.execute(select(Room).options(selectinload(Room.members)).where(Room.code == code))
    room = result.scalar_one_or_none()
    
    if room is None: 
        return None
    
    result = await db.execute(
        select(RoomMember).where(
            RoomMember.room_id == room.id,
            RoomMember.user_id == user.id
        )
    )
    existing = result.scalar_one_or_none()

    if existing:
        return room
    else:        
        room_member = RoomMember(user_id=user.id)
        room.members.append(room_member)
        await db.commit()
        await db.refresh(room)
        return room
    
    
async def send_message(db: AsyncSession, room_id: uuid.UUID, sender: User, content: str) -> Message:
    message = Message(
        room_id=room_id,
        sender_id=sender.id,
        content=content
    )
    
    db.add(message)
    await db.commit()
    await db.refresh(message)

    return message

async def get_room_message(db: AsyncSession, room_id: uuid.UUID, user: User) -> list[Message]:
    result = await db.execute(select(Message).where(Message.room_id == room_id).order_by(asc(Message.created_at)))
    
    room_messages = list(result.scalars().all())
    
    return room_messages

async def get_user_rooms(db: AsyncSession, user: User) -> list[Room]: 
    result = await db.execute(select(Room).join(RoomMember).where(RoomMember.user_id == user.id))
    
    user_rooms = list(result.scalars().all())
    
    return user_rooms
    

