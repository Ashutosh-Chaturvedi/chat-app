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
- [ ] Phase 2 — Rooms and REST messaging
- [ ] Phase 3 — WebSocket real-time delivery
- [ ] Phase 4 — Presence
- [ ] Phase 5 — Delivery receipts

## Running locally

```bash
docker compose up -d
alembic upgrade head
uvicorn app.main:app --reload
```

API docs at `http://localhost:8000/docs`

## Design decisions

- UUIDs as primary keys — no sequential ID leakage
- Timezone-aware timestamps throughout (`TIMESTAMPTZ`)
- Password pre-hashed with SHA-256 before bcrypt — avoids 72-byte truncation
- Refresh tokens are the revocation point — access tokens are short-lived (15min)