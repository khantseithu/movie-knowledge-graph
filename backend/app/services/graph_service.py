from neo4j import AsyncSession
from app.schemas.graph import GraphData, GraphNode, GraphLink

async def get_neighbors(session: AsyncSession, node_id: str) -> GraphData:
    """
    Fetches the immediate neighborhood of a node (Movie or Person).
    Returns nodes and links in the GraphData format.
    """
    query = """
    MATCH (n {id: $id})
    OPTIONAL MATCH (n)-[r]-(m)
    WITH n, collect(DISTINCT m) AS neighbors, collect(DISTINCT r) AS rels
    RETURN n, neighbors, rels
    """
    result = await session.run(query, id=node_id)
    record = await result.single()

    if not record or not record["n"]:
        return GraphData(nodes=[], links=[])

    root_node = record["n"]
    neighbors = record["neighbors"]
    rels = record["rels"]

    nodes = []
    links = []
    seen_ids = set()

    # Add root node
    root_id = root_node["id"]
    root_label = list(root_node.labels)[0]
    nodes.append(
        GraphNode(
            id=root_id,
            label=root_label,
            name=root_node.get("title", root_node.get("name", "Unknown")),
            properties=dict(root_node)
        )
    )
    seen_ids.add(root_id)

    # Add neighbor nodes
    for m in neighbors:
        if not m: continue
        m_id = m["id"]
        if m_id not in seen_ids:
            m_label = list(m.labels)[0]
            nodes.append(
                GraphNode(
                    id=m_id,
                    label=m_label,
                    name=m.get("title", m.get("name", "Unknown")),
                    properties=dict(m)
                )
            )
            seen_ids.add(m_id)

    # Add relationships
    for r in rels:
        if not r: continue
        # r.start_node and r.end_node are accessible
        # But we need their 'id' property
        # Neo4j objects have element_id but we used 'id' property in our schema
        start_node = r.start_node
        end_node = r.end_node
        
        links.append(
            GraphLink(
                source=start_node["id"],
                target=end_node["id"],
                type=r.type,
                properties=dict(r)
            )
        )

    return GraphData(nodes=nodes, links=links)
