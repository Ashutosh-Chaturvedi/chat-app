from sqlalchemy.ext.asyncio import AsyncSession
from app.models import Room, RoomMember, User, Message, MessageReceipt
from sqlalchemy import select, asc, update, delete 
from sqlalchemy.orm import selectinload
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import aliased
from sqlalchemy import desc

from app.presence import is_online
from app.redis import get_redis
import uuid

async def get_all_users(db: AsyncSession, limit: int = 50, offset: int = 0):
    users = await db.execute(select(User).limit(limit).offset(offset))
    return users.scalars().all()

async def create_room(db: AsyncSession, name: str, user: User) -> Room:
    room = Room(
        name=name,
        is_direct=False, 
        created_by=user.id,
    )
    
    room_member = RoomMember(user_id=user.id)
    room.members.append(room_member)
    room.member_count = 1
    
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
        room.member_count+=1
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


async def get_room_message(db: AsyncSession, room_id: uuid.UUID, user: User) -> list:
    result = await db.execute(
        select(Message, User.username)
        .join(User, Message.sender_id == User.id)
        .where(Message.room_id == room_id)
        .order_by(asc(Message.created_at))
    )
    rows = result.all()
    
    messages = [row[0] for row in rows]
    await db.execute(
        update(MessageReceipt)
        .where(
            MessageReceipt.user_id == user.id,
            MessageReceipt.status == "delivered",
            MessageReceipt.message_id.in_([m.id for m in messages])
        )
        .values(status="read")
    )
    await db.commit()
    
    result_list = []
    for row in rows:
        message = row[0]
        username = row[1]
        result_list.append({
            "id": message.id,
            "content": message.content,
            "sender_id": message.sender_id,
            "sender_username": username,
            "created_at": message.created_at,
        })

    return result_list

async def get_user_rooms(db: AsyncSession, user: User):
    result = await db.execute(
        select(Room)
        .join(RoomMember)
        .where(RoomMember.user_id == user.id)
    )

    rooms = result.scalars().all()

    enriched_rooms = []

    for room in rooms:
        latest_result = await db.execute(
            select(Message)
            .where(Message.room_id == room.id)
            .order_by(desc(Message.created_at))
            .limit(1)
        )

        latest_message = latest_result.scalar_one_or_none()

        enriched_rooms.append({
            "id": room.id,
            "name": room.name,
            "code": room.code,
            "is_direct": room.is_direct,
            "created_at": room.created_at,
            "created_by": room.created_by,
            "member_count": room.member_count,
            "last_message": (
                latest_message.content
                if latest_message
                else None
            ),
            "last_activity": (
                latest_message.created_at
                if latest_message
                else None
            ),
        })

    return enriched_rooms

async def get_dm_room(db: AsyncSession, user1_id: uuid.UUID, user2_id: uuid.UUID):
    user1_rooms = select(RoomMember.room_id).where(RoomMember.user_id == user1_id)

    user2_rooms = select(RoomMember.room_id).where(RoomMember.user_id == user2_id)

    result = await db.execute(
        select(Room).where(
            Room.is_direct == True,
            Room.id.in_(user1_rooms),
            Room.id.in_(user2_rooms)
        )
    )
    return result.scalar_one_or_none()

async def initiate_dm(db: AsyncSession, receiver: User, user: User) -> Room:
    
    existing = await get_dm_room(db, receiver.id, user.id)
    
    if existing: 
        return existing
    
    room = Room(
        name=receiver.username,
        is_direct=True, 
        created_by=user.id,
    )
    
    room_member = RoomMember(user_id=user.id)
    room_member_receiver = RoomMember(user_id=receiver.id)
    room.members.append(room_member_receiver)
    room.members.append(room_member)
    
    db.add(room)
    await db.commit()
    await db.refresh(room)
    return room

async def create_receipts(db: AsyncSession, message: Message, sender: User, room_id: uuid.UUID):
    
    result = await db.execute(select(RoomMember).where(RoomMember.room_id == room_id))
    members = result.scalars().all()
    
    for member in members:
        if member.user_id != sender.id:
            receipt = MessageReceipt(
                message_id=message.id,
                user_id=member.user_id,
                status="delivered"
            )
            db.add(receipt)        

    await db.commit()
    
async def delete_room(db: AsyncSession, room_id: uuid.UUID, current_user: User) -> bool:
    result = await db.execute(
        delete(Room).where(
            Room.created_by == current_user.id,
            Room.id == room_id
        )
    )

    await db.commit()

    return result.rowcount > 0  # type: ignore


async def last_record(db: AsyncSession, room_id: uuid.UUID):
    result = await db.execute(
        select(Message)
        .where(Message.room_id == room_id)
        .order_by(desc(Message.created_at))
        .limit(1)
    )

    last_message = result.scalar_one_or_none()

    if last_message is None:
        return None

    return {
        "last_message": last_message.content,
        "last_activity": last_message.created_at
    }
    
async def leave_room(
    db: AsyncSession,
    room_id: uuid.UUID,
    current_user: User
) -> bool:

    result = await db.execute(
        select(RoomMember).where(
            RoomMember.room_id == room_id,
            RoomMember.user_id == current_user.id
        )
    )

    membership = result.scalar_one_or_none()

    if membership is None:
        return False

    room_result = await db.execute(
        select(Room).where(Room.id == room_id)
    )

    room = room_result.scalar_one_or_none()

    if room is None or room.created_by == current_user.id:
        return False

    await db.delete(membership)

    if room.member_count is not None and room.member_count > 0:
        room.member_count -= 1

    await db.commit()

    return True

async def get_room_members(
    db: AsyncSession,
    room_id: uuid.UUID
):
    redis = await get_redis()

    result = await db.execute(
        select(User)
        .join(RoomMember)
        .where(RoomMember.room_id == room_id)
    )

    users = result.scalars().all()

    members = []

    for user in users:
        members.append({
            "id": user.id,
            "username": user.username,
            "online": bool(
                await is_online(redis, user.id)
            )
        })

    await redis.aclose()

    return members