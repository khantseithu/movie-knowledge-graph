from fastapi import APIRouter, Depends, HTTPException, Query
from neo4j import AsyncSession

from app.db.neo4j import get_session
from app.schemas.graph import PathResult
from app.services import path_service

router = APIRouter(prefix="/api/paths", tags=["paths"])


@router.get("", response_model=PathResult)
async def find_shortest_path(
    from_id: str = Query(..., alias="from", description="Source person ID"),
    to_id: str = Query(..., alias="to", description="Target person ID"),
    session: AsyncSession = Depends(get_session),
):
    """Find the shortest path (Six Degrees) between two people."""
    result = await path_service.find_shortest_path(session, from_id, to_id)
    if not result:
        raise HTTPException(status_code=404, detail="No path found between these two people")
    return result
