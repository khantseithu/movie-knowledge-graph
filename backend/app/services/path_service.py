from neo4j import AsyncSession

from app.schemas.graph import GraphNode, GraphLink, PathResult


async def find_shortest_path(
    session: AsyncSession, from_id: str, to_id: str
) -> PathResult | None:
    """Find the shortest path between two persons via ACTED_IN relationships."""
    result = await session.run(
        """
        MATCH (start:Person {id: $from_id}), (end:Person {id: $to_id}),
              path = shortestPath((start)-[:ACTED_IN*]-(end))
        RETURN path
        """,
        from_id=from_id,
        to_id=to_id,
    )
    record = await result.single()
    if not record:
        return None

    path = record["path"]
    nodes: list[GraphNode] = []
    links: list[GraphLink] = []
    seen_ids: set[str] = set()

    for node in path.nodes:
        label = list(node.labels)[0]
        node_id = node.get("id", str(node.element_id))
        if node_id not in seen_ids:
            nodes.append(
                GraphNode(
                    id=node_id,
                    label=label,
                    name=node.get("title", node.get("name", "Unknown")),
                    properties=dict(node),
                )
            )
            seen_ids.add(node_id)

    for rel in path.relationships:
        start_node = rel.start_node
        end_node = rel.end_node
        links.append(
            GraphLink(
                source=start_node.get("id", str(start_node.element_id)),
                target=end_node.get("id", str(end_node.element_id)),
                type=rel.type,
                properties=dict(rel),
            )
        )

    return PathResult(path=nodes, links=links, length=len(path.relationships))
