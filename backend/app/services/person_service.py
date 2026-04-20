from neo4j import AsyncSession

from app.schemas.person import PersonBase, PersonDetail, MovieRef


async def search_persons(session: AsyncSession, query: str, limit: int = 20) -> list[PersonBase]:
    """Search persons by name (case-insensitive contains)."""
    result = await session.run(
        """
        MATCH (p:Person)
        WHERE toLower(p.name) CONTAINS toLower($q)
        RETURN p.id AS id, p.name AS name, p.birthYear AS birth_year
        ORDER BY p.name
        LIMIT $limit
        """,
        q=query,
        limit=limit,
    )
    records = await result.data()
    return [PersonBase(**r) for r in records]


async def get_person(session: AsyncSession, person_id: str) -> PersonDetail | None:
    """Get a person by ID with their filmography."""
    result = await session.run(
        """
        MATCH (p:Person {id: $id})
        OPTIONAL MATCH (p)-[acted:ACTED_IN]->(acted_movie:Movie)
        OPTIONAL MATCH (p)-[:DIRECTED]->(directed_movie:Movie)
        RETURN p.id AS id, p.name AS name, p.birthYear AS birth_year,
               collect(DISTINCT {
                   id: acted_movie.id, title: acted_movie.title,
                   release_year: acted_movie.releaseYear, role: acted.role
               }) AS movies_acted,
               collect(DISTINCT {
                   id: directed_movie.id, title: directed_movie.title,
                   release_year: directed_movie.releaseYear
               }) AS movies_directed
        """,
        id=person_id,
    )
    record = await result.single()
    if not record or record["id"] is None:
        return None

    return PersonDetail(
        id=record["id"],
        name=record["name"],
        birth_year=record["birth_year"],
        movies_acted=[MovieRef(**m) for m in record["movies_acted"] if m["id"] is not None],
        movies_directed=[MovieRef(**m) for m in record["movies_directed"] if m["id"] is not None],
    )
