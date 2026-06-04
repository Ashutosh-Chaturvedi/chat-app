from fastapi import FastAPI
from fastapi.openapi.utils import get_openapi
from fastapi.middleware.cors import CORSMiddleware

from app.auth.router import router as auth_router
from app.routers.rooms import router as rooms_router
from app.routers.users import router as users_router
from app.routers.dms import router as dms_router
from app.routers.ws import router as ws_router
from app.logger import get_logger

from slowapi import  _rate_limit_exceeded_handler
from app.limiter import limiter
from slowapi.errors import RateLimitExceeded

app = FastAPI(title="Chat System")
logger = get_logger(__name__)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://chat-app.live",
        "https://chat-app.live",
        "http://chat-app.live",
        "http://chat-app.live",
        # "http://127.0.0.1:8000",
        # "http://localhost:3000",
    ],
    allow_credentials=True, 
    allow_methods=["*"],
    allow_headers=["*"],
)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.include_router(auth_router)
app.include_router(rooms_router)
app.include_router(users_router)
app.include_router(dms_router)
app.include_router(ws_router)

@app.on_event("startup")
async def startup():
    logger.info("Chat system starting up")
    
@app.on_event("shutdown")
async def shutdown():
    logger.info("Chat system shutting down")


def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema
    schema = get_openapi(
        title="Chat System",
        version="0.1.0",
        routes=app.routes,
    )
    schema["components"]["securitySchemes"] = {
        "BearerAuth": {
            "type": "http",
            "scheme": "bearer",
            "bearerFormat": "JWT",
        }
    }
    for path in schema["paths"].values():
        for method in path.values():
            method.setdefault("security", [{"BearerAuth": []}])
    app.openapi_schema = schema
    return schema

app.openapi_schema = None
app.openapi = custom_openapi

@app.get("/health")
async def health():
    return {"status": "ok"}