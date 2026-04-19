"""
Run the full ETL pipeline: Download → Clean → Ingest.
"""

from etl.download import download_all
from etl.clean import clean_data
from etl.ingest import ingest_data


def run_pipeline() -> None:
    """Execute the complete ETL pipeline."""
    print("=" * 60)
    print("  🎬 Movie Knowledge Graph — ETL Pipeline")
    print("=" * 60)
    print()

    # Step 1: Download raw data
    download_all()
    print()

    # Step 2: Clean and filter
    clean_data()
    print()

    # Step 3: Ingest into Neo4j
    ingest_data()

    print()
    print("=" * 60)
    print("  🎉 Pipeline complete! Your knowledge graph is ready.")
    print("=" * 60)


if __name__ == "__main__":
    run_pipeline()
