from neo4j import AsyncSession

from app.schemas.movie import MovieBase, MovieDetail


async def search_movies(session: AsyncSession, query: str, limit: int = 20) -> list[MovieBase]:
    """Search movies by title (case-insensitive contains)."""
    result = await session.run(
        """
        MATCH (m:Movie)
        WHERE toLower(m.title) CONTAINS toLower($q)
        RETURN m.id AS id, m.title AS title, m.releaseYear AS release_year, m.rating AS rating
        ORDER BY m.rating DESC
        LIMIT $limit
        """,
        q=query,
        limit=limit,
    )
    records = await result.data()
    return [MovieBase(**r) for r in records]


async def get_movie(session: AsyncSession, movie_id: str) -> MovieDetail | None:
    """Get a movie by ID with its cast, directors, and genres."""
    result = await session.run(
        """
        MATCH (m:Movie {id: $id})
        OPTIONAL MATCH (actor:Person)-[r:ACTED_IN]->(m)
        OPTIONAL MATCH (director:Person)-[:DIRECTED]->(m)
        OPTIONAL MATCH (m)-[:IN_GENRE]->(g:Genre)
        RETURN m.id AS id, m.title AS title, m.releaseYear AS release_year, m.rating AS rating,
               collect(DISTINCT {id: actor.id, name: actor.name, birth_year: actor.birthYear}) AS cast,
               collect(DISTINCT {id: director.id, name: director.name, birth_year: director.birthYear}) AS directors,
               collect(DISTINCT g.name) AS genres
        """,
        id=movie_id,
    )
    record = await result.single()
    if not record or record["id"] is None:
        return None

    return MovieDetail(
        id=record["id"],
        title=record["title"],
        release_year=record["release_year"],
        rating=record["rating"],
        genres=record["genres"],
        cast=[c for c in record["cast"] if c["id"] is not None],
        directors=[d for d in record["directors"] if d["id"] is not None],
    )
