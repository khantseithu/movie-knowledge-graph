from fastapi import APIRouter, Depends, Query
from neo4j import AsyncSession

from app.db.neo4j import get_session
from app.schemas.movie import MovieBase
from app.services import recommendation_service

router = APIRouter(prefix="/api/recommendations", tags=["recommendations"])


@router.get("/{movie_id}", response_model=list[MovieBase])
async def get_recommendations(
    movie_id: str,
    limit: int = Query(10, ge=1, le=50),
    session: AsyncSession = Depends(get_session),
):
    """Get movie recommendations based on shared actors and genres."""
    return await recommendation_service.get_recommendations(session, movie_id, limit)
