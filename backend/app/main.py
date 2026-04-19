from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.db.neo4j import init_driver, close_driver
from app.api import health, movies, persons, paths, recommendations


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage application lifecycle: init and close Neo4j driver."""
    await init_driver()
    yield
    await close_driver()


app = FastAPI(
    title="Movie Knowledge Graph API",
    description="API for querying a Neo4j-backed movie knowledge graph",
    version="0.1.0",
    lifespan=lifespan,
)

# CORS — allow frontend dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.backend_cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(health.router)
app.include_router(movies.router)
app.include_router(persons.router)
app.include_router(paths.router)
app.include_router(recommendations.router)
