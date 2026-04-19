from fastapi import APIRouter, Depends, HTTPException, Query
from neo4j import AsyncSession

from app.db.neo4j import get_session
from app.schemas.movie import MovieBase, MovieDetail, MovieSearchResult
from app.services import movie_service

router = APIRouter(prefix="/api/movies", tags=["movies"])


@router.get("", response_model=MovieSearchResult)
async def search_movies(
    q: str = Query(..., min_length=1, description="Search query for movie title"),
    limit: int = Query(20, ge=1, le=100),
    session: AsyncSession = Depends(get_session),
):
    """Search movies by title."""
    results = await movie_service.search_movies(session, q, limit)
    return MovieSearchResult(results=results, total=len(results))


@router.get("/{movie_id}", response_model=MovieDetail)
async def get_movie(
    movie_id: str,
    session: AsyncSession = Depends(get_session),
):
    """Get a movie by ID with cast, directors, and genres."""
    movie = await movie_service.get_movie(session, movie_id)
    if not movie:
        raise HTTPException(status_code=404, detail="Movie not found")
    return movie
