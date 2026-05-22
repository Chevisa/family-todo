from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import auth, tasks, teams, users
from app.core.config import settings
from app.core.database import Base, engine
from app.models import refresh_session, task, team, user, user_team  # noqa: F401

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.app_name,
    version="1.0.0",
    description="Backend для лабораторной работы Family ToDo List",
)

origins = [origin.strip() for origin in settings.cors_origins.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins or ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", tags=["Health"])
def health_check() -> dict:
    return {"status": "ok"}


app.include_router(auth.router, prefix="/api/v1/auth", tags=["Auth"])
app.include_router(users.router, prefix="/api/v1/users", tags=["Users"])
app.include_router(teams.router, prefix="/api/v1/teams", tags=["Teams"])
app.include_router(tasks.router, prefix="/api/v1/tasks", tags=["Tasks"])
