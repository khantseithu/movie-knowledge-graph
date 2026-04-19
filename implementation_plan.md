# Personal Movie Knowledge Graph — Implementation Plan

## Overview

Build a knowledge graph from IMDB data to explore movie/actor/director relationships, find shortest paths between actors ("Six Degrees"), and generate basic movie recommendations — all with an interactive graph visualization UI.

---

## Tech Stack Decisions

> [!IMPORTANT]
> The PRD leaves frontend and backend choices open. Here are my recommendations based on your existing TypeScript/React expertise and the project's learning goals.

### Database: **Neo4j 5.x** (Docker, local)

| Option | Verdict |
|---|---|
| Neo4j Desktop | ❌ Heavy GUI app, harder to version-control config |
| Neo4j AuraDB Free | ⚠️ 200k node limit is fine, but auto-pauses after 72h inactivity and deletes after 30 days idle |
| **Neo4j via Docker Compose** | ✅ **Chosen** — reproducible, no idle deletion, full control, easy `docker compose up` |

We'll use the official `neo4j:5` image with APOC plugin enabled.

---

### ETL / Data Processing: **Python 3.12 + Pandas**

Matches the PRD. Python is the best tool for parsing IMDB's TSV files. We'll use:
- `pandas` — for loading/filtering large TSVs
- `neo4j` Python driver — for ingesting cleaned data into the graph
- `requests` or `urllib` — for downloading datasets

---

### Backend API: **Python FastAPI**

| Option | Verdict |
|---|---|
| Streamlit | ❌ Good for prototypes, but poor for custom UIs and graph visualization |
| Express.js (Node) | ⚠️ Viable, but splits the backend across two languages |
| **FastAPI (Python)** | ✅ **Chosen** — async, auto-generated OpenAPI docs, reuses the same Python/Neo4j driver as ETL |

Structure follows the layered pattern:
```
backend/
├── app/
│   ├── api/           # Route definitions
│   ├── core/          # Config, settings
│   ├── db/            # Neo4j driver lifecycle
│   ├── schemas/       # Pydantic request/response models
│   ├── services/      # Business logic + Cypher queries
│   └── main.py        # Entry point
├── etl/               # Data download, cleaning, ingestion scripts
├── requirements.txt
└── Dockerfile
```

---

### Frontend: **React + Vite + TypeScript**

| Option | Verdict |
|---|---|
| Streamlit | ❌ Very limited for custom graph UIs |
| Next.js | ⚠️ Overkill — no SSR/SEO needs for a personal tool |
| **Vite + React + TypeScript** | ✅ **Chosen** — fast DX, lightweight, matches your existing skills |

Graph visualization library: **`react-force-graph-2d`** (from the `react-force-graph` package)
- Great force-directed layout out of the box
- Supports node coloring by label, click-to-expand, tooltips
- 2D is faster and more practical than 3D for this dataset size

Additional frontend dependencies:
- **`@tanstack/react-query`** — data fetching/caching
- **`react-router-dom`** — routing between views

---

### Dev Environment: **Docker Compose**

Single `docker compose up` spins up:
1. `neo4j` — graph database on `bolt://localhost:7687` + browser on `http://localhost:7474`
2. `backend` — FastAPI on `http://localhost:8000`
3. Frontend runs via `npm run dev` locally (hot reload, no container needed)

---

## Project Structure

```
movie-knowledge-graph/
├── docker-compose.yml
├── .env.example
├── .gitignore
├── README.md
│
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py              # FastAPI app entry
│   │   ├── core/
│   │   │   ├── __init__.py
│   │   │   └── config.py        # pydantic-settings for env vars
│   │   ├── db/
│   │   │   ├── __init__.py
│   │   │   └── neo4j.py         # Driver init, lifespan, session DI
│   │   ├── schemas/
│   │   │   ├── __init__.py
│   │   │   ├── movie.py
│   │   │   ├── person.py
│   │   │   └── graph.py         # Graph response models (nodes/links)
│   │   ├── services/
│   │   │   ├── __init__.py
│   │   │   ├── movie_service.py
│   │   │   ├── person_service.py
│   │   │   ├── path_service.py  # Shortest path / six degrees
│   │   │   └── recommendation_service.py
│   │   └── api/
│   │       ├── __init__.py
│   │       ├── movies.py
│   │       ├── persons.py
│   │       ├── paths.py
│   │       └── recommendations.py
│   └── etl/
│       ├── download.py          # Fetch IMDB TSVs
│       ├── clean.py             # Filter & transform with Pandas
│       ├── ingest.py            # Load CSVs into Neo4j
│       └── run_pipeline.py      # Orchestrate the full ETL
│
├── frontend/
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── index.html
│   └── src/
│       ├── main.tsx
│       ├── App.tsx
│       ├── api/                 # API client functions
│       ├── components/          # Reusable UI components
│       │   ├── GraphViewer.tsx   # react-force-graph wrapper
│       │   ├── SearchBar.tsx
│       │   └── PathResult.tsx
│       ├── pages/
│       │   ├── HomePage.tsx
│       │   ├── ExplorePage.tsx   # Graph visualization
│       │   └── ConnectionFinder.tsx  # Six Degrees UI
│       └── styles/
│           └── index.css
│
└── data/                        # .gitignored — raw + cleaned CSVs
    ├── raw/
    └── cleaned/
```

---

## Phased Implementation

### Phase 1 — Project Init & Infrastructure

**Goal:** Scaffold everything so `docker compose up` gives you a running Neo4j + FastAPI.

1. Initialize the Vite + React + TypeScript frontend
2. Create the FastAPI backend skeleton
3. Write `docker-compose.yml` (Neo4j + backend)
4. Create `.env.example`, `.gitignore`, `README.md`
5. Verify: Neo4j Browser accessible at `localhost:7474`, FastAPI docs at `localhost:8000/docs`

---

### Phase 2 — ETL Pipeline

**Goal:** Download IMDB data, filter it, and load it into Neo4j.

1. `download.py` — fetch `title.basics.tsv.gz`, `title.principals.tsv.gz`, `name.basics.tsv.gz` from `datasets.imdbws.com`
2. `clean.py` — filter to `titleType == 'movie'`, keep top ~10k by vote count, resolve person/genre references
3. `ingest.py` — create constraints, then use `LOAD CSV` or the Python driver to create `:Movie`, `:Person`, `:Genre` nodes and `:ACTED_IN`, `:DIRECTED`, `:IN_GENRE` relationships
4. `run_pipeline.py` — orchestrate download → clean → ingest

---

### Phase 3 — API Layer

**Goal:** Expose graph queries as REST endpoints.

| Endpoint | Description |
|---|---|
| `GET /api/movies?q=` | Search movies by title |
| `GET /api/movies/{id}` | Movie detail + cast graph |
| `GET /api/persons?q=` | Search actors/directors by name |
| `GET /api/persons/{id}` | Person detail + filmography graph |
| `GET /api/paths?from={id}&to={id}` | Shortest path between two people |
| `GET /api/recommendations/{movieId}` | Recommend movies based on shared actors + genre |

---

### Phase 4 — Frontend & Visualization

**Goal:** Interactive UI with search, graph visualization, and connection finder.

1. **Home Page** — search bar for movies/actors, trending/popular section
2. **Explore Page** — click a movie or person → see the graph neighborhood rendered with `react-force-graph-2d` (nodes colored by label: Movie = blue, Person = amber, Genre = green)
3. **Connection Finder** — two search inputs (Actor A, Actor B), submit → display the shortest path as a visual chain

---

## User Review Required

> [!IMPORTANT]
> **Frontend choice: React vs Streamlit**
> The PRD mentions Streamlit as the "fastest" option. I'm recommending React + Vite instead because:
> 1. You already have deep React/TypeScript experience
> 2. `react-force-graph` gives much richer graph visualization than anything in Streamlit
> 3. Better learning outcome for "Full-Stack Integration" (PRD objective #5)
>
> Let me know if you'd prefer Streamlit.

> [!IMPORTANT]
> **Neo4j: Docker vs AuraDB Free**
> I'm recommending Docker for local dev (no idle deletion, full control). You can always deploy to AuraDB Free later for a hosted demo. Sound good?

> [!WARNING]
> **IMDB Data License**
> The IMDB datasets are for **personal and non-commercial use only**. This is fine for a learning project but worth noting if you ever plan to share it publicly.

---

## Verification Plan

### Automated Tests
- `docker compose up` → Neo4j healthy on `:7474`, FastAPI on `:8000/docs`
- Run ETL pipeline → verify node/relationship counts via Cypher: `MATCH (n) RETURN labels(n), count(n)`
- Hit each API endpoint and verify JSON responses
- Frontend `npm run dev` → pages render, graph visualization loads

### Manual Verification
- Search for "Tom Hanks" → see filmography graph
- Find shortest path between two actors → verify the chain makes sense
- Movie recommendations → check genre/actor overlap logic
