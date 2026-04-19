"""
Ingest cleaned CSV data into Neo4j.

Creates:
  - Constraints for uniqueness
  - :Movie, :Person, :Genre nodes
  - :ACTED_IN, :DIRECTED, :IN_GENRE relationships
"""

import os
import csv
from neo4j import GraphDatabase

CLEAN_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "data", "cleaned")

NEO4J_URI = os.environ.get("NEO4J_URI", "bolt://localhost:7687")
NEO4J_USER = os.environ.get("NEO4J_USER", "neo4j")
NEO4J_PASSWORD = os.environ.get("NEO4J_PASSWORD", "movieknowledge")

BATCH_SIZE = 1000


def read_csv(filename: str) -> list[dict]:
    """Read a CSV file and return list of dicts."""
    filepath = os.path.join(CLEAN_DIR, filename)
    with open(filepath, "r", encoding="utf-8") as f:
        return list(csv.DictReader(f))


def ingest_data() -> None:
    """Run the full ingestion pipeline."""
    driver = GraphDatabase.driver(NEO4J_URI, auth=(NEO4J_USER, NEO4J_PASSWORD))

    with driver.session() as session:
        print("🗄️  Setting up constraints...\n")
        session.run("CREATE CONSTRAINT movie_id IF NOT EXISTS FOR (m:Movie) REQUIRE m.id IS UNIQUE")
        session.run("CREATE CONSTRAINT person_id IF NOT EXISTS FOR (p:Person) REQUIRE p.id IS UNIQUE")
        session.run("CREATE CONSTRAINT genre_name IF NOT EXISTS FOR (g:Genre) REQUIRE g.name IS UNIQUE")

        # --- Genres ---
        print("  📦 Loading genres...")
        genres = read_csv("genres.csv")
        for i in range(0, len(genres), BATCH_SIZE):
            batch = genres[i : i + BATCH_SIZE]
            session.run(
                "UNWIND $batch AS row CREATE (g:Genre {name: row.name})",
                batch=batch,
            )
        print(f"  ✅ {len(genres)} genres created")

        # --- Movies ---
        print("  📦 Loading movies...")
        movies = read_csv("movies.csv")
        for i in range(0, len(movies), BATCH_SIZE):
            batch = movies[i : i + BATCH_SIZE]
            session.run(
                """
                UNWIND $batch AS row
                CREATE (m:Movie {
                    id: row.id,
                    title: row.title,
                    releaseYear: toInteger(row.releaseYear),
                    rating: toFloat(row.rating)
                })
                """,
                batch=batch,
            )
        print(f"  ✅ {len(movies)} movies created")

        # --- Persons ---
        print("  📦 Loading persons...")
        persons = read_csv("persons.csv")
        for i in range(0, len(persons), BATCH_SIZE):
            batch = persons[i : i + BATCH_SIZE]
            session.run(
                """
                UNWIND $batch AS row
                CREATE (p:Person {
                    id: row.id,
                    name: row.name,
                    birthYear: CASE WHEN row.birthYear IS NOT NULL AND row.birthYear <> ''
                                    THEN toInteger(row.birthYear) ELSE null END
                })
                """,
                batch=batch,
            )
        print(f"  ✅ {len(persons)} persons created")

        # --- ACTED_IN relationships ---
        print("  🔗 Creating ACTED_IN relationships...")
        acted = read_csv("acted_in.csv")
        for i in range(0, len(acted), BATCH_SIZE):
            batch = acted[i : i + BATCH_SIZE]
            session.run(
                """
                UNWIND $batch AS row
                MATCH (p:Person {id: row.person_id})
                MATCH (m:Movie {id: row.movie_id})
                CREATE (p)-[:ACTED_IN {role: row.role}]->(m)
                """,
                batch=batch,
            )
        print(f"  ✅ {len(acted)} ACTED_IN relationships created")

        # --- DIRECTED relationships ---
        print("  🔗 Creating DIRECTED relationships...")
        directed = read_csv("directed.csv")
        for i in range(0, len(directed), BATCH_SIZE):
            batch = directed[i : i + BATCH_SIZE]
            session.run(
                """
                UNWIND $batch AS row
                MATCH (p:Person {id: row.person_id})
                MATCH (m:Movie {id: row.movie_id})
                CREATE (p)-[:DIRECTED]->(m)
                """,
                batch=batch,
            )
        print(f"  ✅ {len(directed)} DIRECTED relationships created")

        # --- IN_GENRE relationships ---
        print("  🔗 Creating IN_GENRE relationships...")
        movie_genres = read_csv("movie_genres.csv")
        for i in range(0, len(movie_genres), BATCH_SIZE):
            batch = movie_genres[i : i + BATCH_SIZE]
            session.run(
                """
                UNWIND $batch AS row
                MATCH (m:Movie {id: row.movie_id})
                MATCH (g:Genre {name: row.genre})
                CREATE (m)-[:IN_GENRE]->(g)
                """,
                batch=batch,
            )
        print(f"  ✅ {len(movie_genres)} IN_GENRE relationships created")

    driver.close()

    print("\n✅ Data ingestion complete!")


if __name__ == "__main__":
    ingest_data()
