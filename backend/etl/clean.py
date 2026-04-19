"""
Clean and filter IMDB data using Pandas.

Filters:
  - Only titleType == 'movie'
  - Only movies with ratings (joined with title.ratings)
  - Top N movies by number of votes
  - Associated persons and genres

Outputs cleaned CSVs ready for Neo4j ingestion.
"""

import os
import pandas as pd

RAW_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "data", "raw")
CLEAN_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "data", "cleaned")

# Keep top N movies by vote count for manageable graph size
TOP_N_MOVIES = 10_000


def clean_data() -> None:
    """Run the full cleaning pipeline."""
    os.makedirs(CLEAN_DIR, exist_ok=True)

    print("🧹 Cleaning IMDB data...\n")

    # --- Load title basics ---
    print("  📄 Loading title.basics.tsv.gz...")
    titles = pd.read_csv(
        os.path.join(RAW_DIR, "title.basics.tsv.gz"),
        sep="\t",
        na_values="\\N",
        dtype={"tconst": str, "startYear": str, "genres": str},
    )
    # Filter to movies only
    titles = titles[titles["titleType"] == "movie"].copy()
    titles["startYear"] = pd.to_numeric(titles["startYear"], errors="coerce")
    print(f"  ✅ {len(titles)} movies loaded (all types filtered)")

    # --- Load ratings ---
    print("  📄 Loading title.ratings.tsv.gz...")
    ratings = pd.read_csv(
        os.path.join(RAW_DIR, "title.ratings.tsv.gz"),
        sep="\t",
        na_values="\\N",
    )

    # Join titles with ratings
    movies = titles.merge(ratings, on="tconst", how="inner")
    print(f"  ✅ {len(movies)} movies have ratings")

    # Take top N by vote count
    movies = movies.nlargest(TOP_N_MOVIES, "numVotes")
    print(f"  ✅ Filtered to top {TOP_N_MOVIES} movies by vote count")

    movie_ids = set(movies["tconst"])

    # Save movies CSV
    movies_out = movies[["tconst", "primaryTitle", "startYear", "averageRating", "genres"]].copy()
    movies_out.columns = ["id", "title", "releaseYear", "rating", "genres"]
    movies_out.to_csv(os.path.join(CLEAN_DIR, "movies.csv"), index=False)
    print(f"  💾 movies.csv saved ({len(movies_out)} rows)")

    # --- Extract genres ---
    print("  📄 Extracting genres...")
    genre_set: set[str] = set()
    movie_genres = []
    for _, row in movies_out.iterrows():
        if pd.notna(row["genres"]):
            for genre in str(row["genres"]).split(","):
                genre = genre.strip()
                genre_set.add(genre)
                movie_genres.append({"movie_id": row["id"], "genre": genre})

    genres_df = pd.DataFrame({"name": sorted(genre_set)})
    genres_df.to_csv(os.path.join(CLEAN_DIR, "genres.csv"), index=False)
    print(f"  💾 genres.csv saved ({len(genres_df)} rows)")

    movie_genres_df = pd.DataFrame(movie_genres)
    movie_genres_df.to_csv(os.path.join(CLEAN_DIR, "movie_genres.csv"), index=False)
    print(f"  💾 movie_genres.csv saved ({len(movie_genres_df)} rows)")

    # --- Load principals (cast/crew) ---
    print("  📄 Loading title.principals.tsv.gz...")
    principals = pd.read_csv(
        os.path.join(RAW_DIR, "title.principals.tsv.gz"),
        sep="\t",
        na_values="\\N",
        dtype={"tconst": str, "nconst": str, "category": str, "characters": str},
    )
    # Filter to our movies and relevant categories
    principals = principals[principals["tconst"].isin(movie_ids)]
    principals = principals[principals["category"].isin(["actor", "actress", "director"])]
    person_ids = set(principals["nconst"])
    print(f"  ✅ {len(principals)} principal entries for our movies")

    # Save acted_in relationships
    acted = principals[principals["category"].isin(["actor", "actress"])][
        ["nconst", "tconst", "characters"]
    ].copy()
    acted.columns = ["person_id", "movie_id", "role"]
    acted.to_csv(os.path.join(CLEAN_DIR, "acted_in.csv"), index=False)
    print(f"  💾 acted_in.csv saved ({len(acted)} rows)")

    # Save directed relationships
    directed = principals[principals["category"] == "director"][
        ["nconst", "tconst"]
    ].copy()
    directed.columns = ["person_id", "movie_id"]
    directed.to_csv(os.path.join(CLEAN_DIR, "directed.csv"), index=False)
    print(f"  💾 directed.csv saved ({len(directed)} rows)")

    # --- Load name basics ---
    print("  📄 Loading name.basics.tsv.gz...")
    names = pd.read_csv(
        os.path.join(RAW_DIR, "name.basics.tsv.gz"),
        sep="\t",
        na_values="\\N",
        dtype={"nconst": str, "birthYear": str},
    )
    names = names[names["nconst"].isin(person_ids)]
    names["birthYear"] = pd.to_numeric(names["birthYear"], errors="coerce")

    persons_out = names[["nconst", "primaryName", "birthYear"]].copy()
    persons_out.columns = ["id", "name", "birthYear"]
    persons_out.to_csv(os.path.join(CLEAN_DIR, "persons.csv"), index=False)
    print(f"  💾 persons.csv saved ({len(persons_out)} rows)")

    print("\n✅ Data cleaning complete!")
    print(f"   Movies:  {len(movies_out):,}")
    print(f"   Persons: {len(persons_out):,}")
    print(f"   Genres:  {len(genres_df):,}")
    print(f"   Acted:   {len(acted):,}")
    print(f"   Directed:{len(directed):,}")


if __name__ == "__main__":
    clean_data()
