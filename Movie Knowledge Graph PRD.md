# **Product Requirements Document (PRD)**

## **Project Name: Personal Movie Knowledge Graph (PMKG)**

### **1\. Project Overview**

**Description:** A personal side project to build a Knowledge Graph using IMDB data. The system will ingest raw movie and cast data, model it as a graph, and provide a way to visualize relationships (e.g., "Six Degrees of Kevin Bacon") and generate basic movie recommendations.

**Purpose:** Purely educational. Designed to build hands-on experience with Graph Databases, Data Engineering pipelines, and Graph Algorithms.

### **2\. Learning Objectives (Why are you building this?)**

* **Graph Data Modeling:** Learn how to think in "nodes and edges" instead of "tables and rows."  
* **Graph Databases:** Master Neo4j and the Cypher query language.  
* **Data Pipelining:** Practice extracting, cleaning, and loading (ETL) large datasets using Python and Pandas.  
* **Graph Algorithms:** Understand pathfinding (Shortest Path) and graph-based recommendation logic.  
* **Full-Stack Integration:** Connect a frontend UI to a graph database backend.

### **3\. Scope and Constraints**

* **In Scope:** \* Downloading and parsing official IMDB TSV datasets.  
  * Filtering data to a manageable subset (e.g., Top 10,000 movies or movies post-2000) to ensure it runs smoothly on free-tier infrastructure.  
  * Graph database setup and data ingestion script.  
  * A simple UI to query and visualize the graph.  
* **Out of Scope (For MVP):** \* Real-time data updates (batch processing is fine).  
  * User authentication.  
  * Complex cloud infrastructure (keep it local or use managed free tiers).

### **4\. Proposed Tech Stack**

* **Database:** Neo4j (Use Neo4j Desktop locally, or Neo4j AuraDB Free Tier).  
* **Data Processing (ETL):** Python, Pandas.  
* **Backend / API:** Python with FastAPI (or just query directly from the frontend if using Streamlit).  
* **Frontend/Visualization:** Streamlit (Python) for the fastest UI, OR a simple React app using a graph visualization library like react-force-graph or vis.js.

### **5\. The Graph Data Model (Schema)**

Before writing any code, this is how the data will be structured in the graph.

**Nodes (Entities):**

* (:Movie {id, title, releaseYear, rating})  
* (:Person {id, name, birthYear})  
* (:Genre {name})

**Relationships (Edges):**

* (:Person)-\[:ACTED\_IN {role}\]-\>(:Movie)  
* (:Person)-\[:DIRECTED\]-\>(:Movie)  
* (:Movie)-\[:IN\_GENRE\]-\>(:Genre)

### **6\. Phased Implementation Plan**

#### **Phase 1: Data Acquisition & Preprocessing (The ETL Pipeline)**

* **Goal:** Get the data ready for the graph.  
* **Tasks:**  
  1. Download datasets from datasets.imdbws.com (specifically title.basics.tsv, title.principals.tsv, name.basics.tsv).  
  2. Write a Python script using Pandas to load the TSVs.  
  3. **Crucial Step:** Filter the data\! The IMDB dataset is massive. Filter title.basics to only include titleType \== 'movie' and limit to movies with high vote counts to keep your node count under 100,000 for smooth local development.  
  4. Export the cleaned, filtered data into new, smaller CSV files ready for Neo4j import.

#### **Phase 2: Database Setup & Ingestion**

* **Goal:** Stand up Neo4j and load the data.  
* **Tasks:**  
  1. Spin up a Neo4j instance.  
  2. Add constraints (e.g., CREATE CONSTRAINT ON (m:Movie) ASSERT m.id IS UNIQUE).  
  3. Write Cypher scripts (using LOAD CSV) or use the Neo4j Python driver to ingest the cleaned CSVs into the graph, creating the Nodes and Relationships defined in your schema.

#### **Phase 3: Querying & Graph Algorithms (The "Brain")**

* **Goal:** Extract value from the graph using Cypher.  
* **Tasks:**  
  1. **Basic Queries:** Find all movies a specific actor was in.  
  2. **Collaborators:** Find actors who frequently work with a specific director.  
  3. **Pathfinding (Six Degrees):** Write a Cypher query using shortestPath() to find the connection between any two actors (e.g., Nicolas Cage and Keanu Reeves).  
  4. **Recommendation:** Write a query that says: "Given Movie X, find users who acted in Movie X, see what other movies they acted in, and recommend the ones in the same genre."

#### **Phase 4: Visualization / User Interface**

* **Goal:** Make it interactive.  
* **Tasks:**  
  1. Create a simple web interface (Streamlit is highly recommended for data side projects).  
  2. Create a search bar for Actors/Movies.  
  3. Create a "Connection Finder" form (Input Actor A, Input Actor B) that outputs the path (Actor A \-\> Movie \-\> Actor B \-\> Movie \-\> Actor C).  
  4. (Optional) Integrate a network graph visualizer to render the nodes and edges on the screen.

### **7\. Success Metrics (How do you know you're done?)**

1. **Data Milestone:** You have a running Neo4j database with at least 10,000 movies and their associated actors/directors linked correctly.  
2. **Query Milestone:** You can successfully return the shortest path between two obscure actors in under 2 seconds.  
3. **UI Milestone:** A working frontend where a non-technical user can type in a movie name and see the cast graph.

### **8\. Future Enhancements (v2.0 Ideas)**

* **Natural Language to Cypher:** Integrate an LLM (like Gemini or OpenAI) so users can type "What sci-fi movies did Tom Cruise do in the 2000s?" and translate that into a graph query.  
* **Add More Data:** Integrate TMDB API to pull in movie posters and plot summaries for a better UI experience.  
* **Advanced Algorithms:** Run PageRank on the graph to find the "most influential" actors in Hollywood based on their connections.