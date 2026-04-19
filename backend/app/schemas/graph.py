from pydantic import BaseModel


class GraphNode(BaseModel):
    id: str
    label: str  # "Movie", "Person", "Genre"
    name: str
    properties: dict = {}


class GraphLink(BaseModel):
    source: str
    target: str
    type: str  # "ACTED_IN", "DIRECTED", "IN_GENRE"
    properties: dict = {}


class GraphData(BaseModel):
    """Graph response format compatible with react-force-graph."""
    nodes: list[GraphNode]
    links: list[GraphLink]


class PathResult(BaseModel):
    """Result of a shortest-path query between two people."""
    path: list[GraphNode]
    links: list[GraphLink]
    length: int
