# Convo — Real-time Chat System

A full-stack real-time chat application built with FastAPI, PostgreSQL, Redis, and Next.js.
Supports direct messaging and group rooms with message persistence, online presence, and delivery receipts.

## Live Demo

🌐 [chat-app.live](https://chat-app.live)

## Architecture
```
Internet
↓
Nginx (port 80) — reverse proxy
├── Frontend (Next.js, port 3000)
├── Backend API (FastAPI, port 8000)
└── WebSocket (FastAPI, port 8000)
↓
PostgreSQL (Docker) — persistent storage
Redis (Docker) — presence and caching
```

- **Transport**: REST (auth, history) + WebSocket (real-time events)
- **Auth**: JWT-based stateless auth with access/refresh token pair
- **Storage**: PostgreSQL for persistence, Redis for presence and sessions
- **Schema**: DMs modeled as rooms with 2 members — unified message storage
- **Deployment**: DigitalOcean Droplet, Ubuntu 24.04, systemd process management

## Stack

### Backend
- Python 3.12, FastAPI, SQLAlchemy (async), Alembic
- PostgreSQL 16, Redis 7
- Docker Compose for infrastructure
- Nginx as reverse proxy
- systemd for process management

### Frontend
- Next.js 15, React, Tailwind CSS
- Native WebSocket API
- localStorage for token management

## Features

- User registration and login with JWT authentication
- Create group rooms with auto-generated 6-character join codes
- Join rooms by code
- Real-time messaging via WebSocket
- Direct messaging between users
- Online presence — Redis TTL-based with 30s heartbeat
- Delivery receipts — sent → delivered → read
- Message history with pagination
- Rate limiting on auth endpoints
- Member list with online/offline status per room

## Project Structure

```
chat-system/
├── backend/
│   ├── app/
│   │   ├── main.py              # app entrypoint, router mounts
│   │   ├── config.py            # pydantic settings, env vars
│   │   ├── database.py          # async engine, session factory
│   │   ├── models.py            # SQLAlchemy ORM models
│   │   ├── schemas.py           # Pydantic request/response models
│   │   ├── utils.py             # room code generator
│   │   ├── websockets.py        # connection manager
│   │   ├── presence.py          # Redis presence functions
│   │   ├── redis.py             # Redis client factory
│   │   ├── limiter.py           # rate limiter instance
│   │   ├── logger.py            # structured logging
│   │   ├── auth/
│   │   │   ├── router.py        # /auth endpoints
│   │   │   ├── service.py       # JWT, bcrypt, user queries
│   │   │   └── dependencies.py  # get_current_user dependency
│   │   └── routers/
│   │       ├── rooms.py         # /rooms endpoints
│   │       ├── users.py         # /users endpoints
│   │       ├── dms.py           # /dms endpoints
│   │       ├── ws.py            # WebSocket endpoint
│   │       └── service.py       # shared database operations
│   ├── migrations/              # Alembic schema versions
│   ├── tests/
│   ├── docker-compose.yml       # PostgreSQL + Redis
│   ├── requirements.txt
│   └── .env.example
└── frontend/
├── app/
│   ├── page.tsx             # root redirect
│   ├── login/page.tsx       # login page
│   ├── register/page.tsx    # register page
│   ├── dashboard/page.tsx   # rooms list
│   └── lib/
│       ├── api.ts           # API and WS base URLs
│       └── auth.ts          # token management
└── .env.local.example
```

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
  "sender_username": "ashutosh",
  "content": "hello world",
  "created_at": "2026-05-26T19:51:40.718544+00:00"
}
```

#### WebSocket close codes
| Code | Meaning |
|------|---------|
| 4001 | Unauthorized — invalid or expired token |
| 4003 | Forbidden — not a member of this room |

## Running locally

### Backend
```bash
cd backend
docker compose up -d
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

API docs at `http://localhost:8000/docs`

## Environment variables

### Backend `.env`
| Variable | Description |
|----------|-------------|
| DATABASE_URL | PostgreSQL async connection string |
| SECRET_KEY | JWT signing key — generate with `openssl rand -hex 32` |
| ALGORITHM | JWT algorithm (HS256) |
| ACCESS_TOKEN_EXPIRE_MINUTES | Access token TTL (default 15) |
| REFRESH_TOKEN_EXPIRE_DAYS | Refresh token TTL (default 7) |
| REDIS_URL | Redis connection string |

### Frontend `.env.local`
| Variable | Description |
|----------|-------------|
| NEXT_PUBLIC_API_URL | Backend API URL |
| NEXT_PUBLIC_WS_URL | WebSocket server URL |

Copy `.env.example` and `.env.local.example` and fill in values.

## Deployment

Deployed on a DigitalOcean Droplet (Ubuntu 24.04, 1GB RAM, Bangalore).

### Stack on server
- Nginx — reverse proxy on port 80/443 with SSL
- FastAPI via uvicorn — port 8000, managed by systemd
- Next.js — port 3000, managed by systemd
- PostgreSQL + Redis — Docker Compose, bound to 127.0.0.1

### Deploy updates
```bash
cd /var/www/chat-app
git pull
cd backend
source venv/bin/activate
pip install -r requirements.txt
alembic upgrade head
systemctl restart chat-backend
cd ../frontend
npm install
npm run build
systemctl restart chat-frontend
```

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
- Nginx reverse proxy — single entry point, handles WebSocket upgrade headers
- systemd process management — auto-restart on crash or server reboot
- Docker services bound to 127.0.0.1 — PostgreSQL and Redis not exposed to public internet