# Chat System

A real-time chat backend built with FastAPI, PostgreSQL, and Redis.
Supports direct messaging and group rooms with message persistence,
online presence, and delivery receipts.

## Architecture

- **Transport**: REST (auth, history) + WebSocket (real-time events)
- **Auth**: JWT-based stateless auth with access/refresh token pair
- **Storage**: PostgreSQL for persistence, Redis for presence and sessions
- **Schema**: DMs modeled as rooms with 2 members — unified message storage

## Stack

- Python 3.11+, FastAPI, SQLAlchemy (async), Alembic
- PostgreSQL 16, Redis 7
- Docker Compose for local infrastructure

## Project Status

- [x] Phase 1 — Auth (register, login, refresh, protected routes)
- [x] Phase 2 — Rooms, messaging, DMs
- [x] Phase 3 — WebSocket real-time messaging
- [x] Phase 4 — Presence with Redis TTL and heartbeat
- [x] Phase 5 — Delivery receipts
- [ ] Phase 6 — Frontend auth UI
- [ ] Phase 7 — Room list, create room, join by code
- [ ] Phase 8 — Chat UI with real-time WebSocket messages
- [ ] Phase 9 — DMs, presence indicators, delivery receipts UI

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /auth/register | Register a new user |
| POST | /auth/login | Login, get token pair |
| POST | /auth/refresh | Refresh access token |
| GET | /auth/me | Get current user |

### Rooms
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /rooms/ | Create a group room |
| POST | /rooms/{room_code}/members | Join a room by code |
| GET | /rooms/{room_id}/messages | Fetch message history |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /users/ | List all users |
| GET | /users/me/rooms | List my rooms |
| GET | /users/{user_id} | Get user details |
| GET | /users/{user_id}/presence | Check online status |

### DMs
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /dms/{user_id} | Initiate or get DM |
| GET | /dms/{user_id}/messages | Fetch DM history |

### WebSocket
| Endpoint | Description |
|----------|-------------|
| WS /ws/{room_id}?token= | Connect to room, send/receive messages |

#### WebSocket message format

**Send a message:**
"hello world"

**Send a heartbeat:**
"ping"

**Receive a message:**
```json
{
  "id": "uuid",
  "sender_id": "uuid",
  "content": "hello world",
  "created_at": "2026-05-26T19:51:40.718544+00:00"
}
```

**Receive a heartbeat response:**
"pong"

## WebSocket close codes

| Code | Meaning |
|------|---------|
| 4001 | Unauthorized — invalid or expired token |
| 4003 | Forbidden — not a member of this room |

## Running locally

```bash
docker compose up -d
alembic upgrade head
uvicorn app.main:app --reload
```

API docs at `http://localhost:8000/docs`

## Environment variables

| Variable | Description |
|----------|-------------|
| DATABASE_URL | PostgreSQL async connection string |
| SECRET_KEY | JWT signing key — generate with `openssl rand -hex 32` |
| ALGORITHM | JWT algorithm (HS256) |
| ACCESS_TOKEN_EXPIRE_MINUTES | Access token TTL (default 15) |
| REFRESH_TOKEN_EXPIRE_DAYS | Refresh token TTL (default 7) |
| REDIS_URL | Redis connection string |

Copy `.env.example` to `.env` and fill in values.

## Project structure
backend/
├── app/
│   ├── main.py              # app entrypoint, router mounts
│   ├── config.py            # pydantic settings, env vars
│   ├── database.py          # async engine, session factory
│   ├── models.py            # SQLAlchemy ORM models
│   ├── schemas.py           # Pydantic request/response models
│   ├── utils.py             # room code generator
│   ├── websockets.py        # connection manager
│   ├── presence.py          # Redis presence functions
│   ├── redis.py             # Redis client factory
│   ├── auth/
│   │   ├── router.py        # /auth endpoints
│   │   ├── service.py       # JWT, bcrypt, user queries
│   │   └── dependencies.py  # get_current_user dependency
│   └── routers/
│       ├── rooms.py         # /rooms endpoints
│       ├── users.py         # /users endpoints
│       ├── dms.py           # /dms endpoints
│       ├── ws.py            # WebSocket endpoint
│       └── service.py       # shared database operations
├── migrations/              # Alembic schema versions
├── tests/
├── docker-compose.yml       # PostgreSQL + Redis
├── requirements.txt
└── .env.example

## Design decisions

- UUIDs as primary keys — no sequential ID leakage
- Timezone-aware timestamps throughout (`TIMESTAMPTZ`)
- Password pre-hashed with SHA-256 before bcrypt — avoids 72-byte truncation
- Refresh tokens are the revocation point — access tokens are short-lived (15min)
- DMs modeled as rooms with `is_direct=True` — unified message storage, no duplicate logic
- Room join codes — 6 character alphanumeric, auto-generated on room creation
- Offset pagination on user listing — limit/offset with default limit of 50
- Presence via Redis TTL — heartbeat every 30s, TTL of 90s, no background cleanup needed
- WebSocket only for sending messages — REST is read-only for message history
- In-memory connection manager — sufficient for single server, Redis Pub/Sub needed for horizontal scaling
- Delivery receipts — created on WebSocket broadcast, marked read on history fetch