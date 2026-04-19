"""
Download IMDB datasets from datasets.imdbws.com.

Downloads:
  - title.basics.tsv.gz
  - title.principals.tsv.gz
  - name.basics.tsv.gz
  - title.ratings.tsv.gz
"""

import os
import requests

BASE_URL = "https://datasets.imdbws.com"
DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "data", "raw")

DATASETS = [
    "title.basics.tsv.gz",
    "title.principals.tsv.gz",
    "name.basics.tsv.gz",
    "title.ratings.tsv.gz",
]


def download_file(filename: str, output_dir: str) -> str:
    """Download a single file from IMDB datasets."""
    url = f"{BASE_URL}/{filename}"
    output_path = os.path.join(output_dir, filename)

    if os.path.exists(output_path):
        print(f"  ⏭  {filename} already exists, skipping.")
        return output_path

    print(f"  ⬇  Downloading {filename}...")
    response = requests.get(url, stream=True)
    response.raise_for_status()

    total = int(response.headers.get("content-length", 0))
    downloaded = 0

    with open(output_path, "wb") as f:
        for chunk in response.iter_content(chunk_size=8192):
            f.write(chunk)
            downloaded += len(chunk)
            if total:
                pct = downloaded / total * 100
                print(f"\r  ⬇  {filename}: {pct:.1f}%", end="", flush=True)

    print(f"\n  ✅ {filename} downloaded ({downloaded / 1024 / 1024:.1f} MB)")
    return output_path


def download_all() -> None:
    """Download all required IMDB datasets."""
    os.makedirs(DATA_DIR, exist_ok=True)
    print("📥 Downloading IMDB datasets...\n")

    for dataset in DATASETS:
        download_file(dataset, DATA_DIR)

    print("\n✅ All datasets downloaded.")


if __name__ == "__main__":
    download_all()
