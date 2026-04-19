from fastapi import APIRouter, Depends, HTTPException, Query
from neo4j import AsyncSession

from app.db.neo4j import get_session
from app.schemas.person import PersonBase, PersonDetail, PersonSearchResult
from app.services import person_service

router = APIRouter(prefix="/api/persons", tags=["persons"])


@router.get("", response_model=PersonSearchResult)
async def search_persons(
    q: str = Query(..., min_length=1, description="Search query for person name"),
    limit: int = Query(20, ge=1, le=100),
    session: AsyncSession = Depends(get_session),
):
    """Search persons (actors/directors) by name."""
    results = await person_service.search_persons(session, q, limit)
    return PersonSearchResult(results=results, total=len(results))


@router.get("/{person_id}", response_model=PersonDetail)
async def get_person(
    person_id: str,
    session: AsyncSession = Depends(get_session),
):
    """Get a person by ID with their filmography."""
    person = await person_service.get_person(session, person_id)
    if not person:
        raise HTTPException(status_code=404, detail="Person not found")
    return person
