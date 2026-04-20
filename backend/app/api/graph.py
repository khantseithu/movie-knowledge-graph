from fastapi import APIRouter, Depends, HTTPException
from neo4j import AsyncSession
from app.db.neo4j import get_session
from app.schemas.graph import GraphData
from app.services import graph_service

router = APIRouter(prefix="/api/graph", tags=["graph"])

@router.get("/neighbors/{node_id}", response_model=GraphData)
async def get_node_neighbors(
    node_id: str,
    session: AsyncSession = Depends(get_session)
):
    """Fetches the immediate neighborhood of a node for graph visualization."""
    graph_data = await graph_service.get_neighbors(session, node_id)
    if not graph_data.nodes:
        raise HTTPException(status_code=404, detail="Node not found")
    return graph_data
