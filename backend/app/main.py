from fastapi import FastAPI
from fastapi.openapi.utils import get_openapi
from app.auth.router import router as auth_router

app = FastAPI(title="Chat System")

app.include_router(auth_router)

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