from neo4j import AsyncSession

from app.schemas.movie import MovieBase


async def get_recommendations(
    session: AsyncSession, movie_id: str, limit: int = 10
) -> list[MovieBase]:
    """
    Recommend movies based on shared actors and genres.

    Logic: Given Movie X, find actors who acted in X, find other movies they
    acted in, and rank by how many shared actors + same genre overlap.
    """
    result = await session.run(
        """
        MATCH (m:Movie {id: $movie_id})<-[:ACTED_IN]-(actor:Person)-[:ACTED_IN]->(rec:Movie)
        WHERE rec.id <> $movie_id
        OPTIONAL MATCH (m)-[:IN_GENRE]->(g:Genre)<-[:IN_GENRE]-(rec)
        WITH rec, count(DISTINCT actor) AS shared_actors, count(DISTINCT g) AS shared_genres
        RETURN rec.id AS id, rec.title AS title, rec.releaseYear AS release_year, rec.rating AS rating,
               shared_actors, shared_genres,
               (shared_actors * 2 + shared_genres) AS score
        ORDER BY score DESC, rec.rating DESC
        LIMIT $limit
        """,
        movie_id=movie_id,
        limit=limit,
    )
    records = await result.data()
    return [MovieBase(id=r["id"], title=r["title"], release_year=r["release_year"], rating=r["rating"]) for r in records]
