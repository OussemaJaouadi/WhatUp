import os
from fastapi import FastAPI
from core.config import settings
from utils.s3 import S3Handler
from utils.image import ImageHandler
from utils.email import EmailHandler
from core.database import AsyncSessionLocal, Base, engine
from services.user_service import UserService
from routers.user import UserRoutes

from fastapi.openapi.utils import get_openapi
from seeders.seed import seed_admin_user

from contextlib import asynccontextmanager
from fastapi.middleware.cors import CORSMiddleware

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup event
    if settings.DEBUG:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        print("🗄️ Database tables created/updated (DEBUG mode). 🗄️")

    async with AsyncSessionLocal() as session:
        await seed_admin_user(session, user_service)
    yield
    # Shutdown event (if any)

app = FastAPI(
    title="WhatUp Backend",
    description="Backend API for WhatUp, a social media platform",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins for development. Restrict in production.
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# Add JWT Bearer security scheme to OpenAPI docs
def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema
    openapi_schema = get_openapi(
        title=app.title,
        version=app.version,
        description=app.description,
        routes=app.routes,
    )
    openapi_schema["components"]["securitySchemes"] = {
        "BearerAuth": {
            "type": "http",
            "scheme": "bearer",
            "bearerFormat": "JWT"
        }
    }
    openapi_schema["security"] = [
        {"BearerAuth": []}
    ]
    app.openapi_schema = openapi_schema
    return app.openapi_schema

app.openapi = custom_openapi


# Define dependencies
s3_handler = S3Handler()
image_handler = ImageHandler()
email_templates_path = os.path.join(os.path.dirname(__file__), 'templates', 'emails')
email_handler = EmailHandler(email_templates_path)

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session



# Define services to use
user_service = UserService(
    db_session_factory=AsyncSessionLocal,
    s3_handler=s3_handler,
    image_handler=image_handler,
    email_handler=email_handler
)

# Define routes 
user_routes = UserRoutes(user_service)


# Put all the puzzle pieces together
app.include_router(user_routes.router)

if __name__ == "__main__":
    import uvicorn
    if settings.DEBUG:
        uvicorn.run("main:app", host=settings.HOST, port=settings.PORT, reload=True)
    else:
        uvicorn.run(app, host=settings.HOST, port=settings.PORT)