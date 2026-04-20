import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { searchMovies, searchPersons, getNeighbors } from "../api/client";
import type { MovieBase, PersonBase, GraphData } from "../api/client";
import GraphViewer from "../components/GraphViewer";

function ExplorePage() {
  const [query, setQuery] = useState("");
  const [searchType, setSearchType] = useState<"movies" | "persons">("movies");
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const { data: movieResults, isLoading: loadingMovies } = useQuery({
    queryKey: ["movies", query],
    queryFn: () => searchMovies(query),
    enabled: searchType === "movies" && query.length > 1,
  });

  const { data: personResults, isLoading: loadingPersons } = useQuery({
    queryKey: ["persons", query],
    queryFn: () => searchPersons(query),
    enabled: searchType === "persons" && query.length > 1,
  });

  const { data: graphData, isLoading: loadingGraph } = useQuery<GraphData>({
    queryKey: ["graph", selectedNodeId],
    queryFn: () => getNeighbors(selectedNodeId!),
    enabled: !!selectedNodeId,
  });

  const isLoading = loadingMovies || loadingPersons;

  if (selectedNodeId && graphData) {
    return (
      <div className="page graph-view-page">
        <div className="graph-header">
          <button className="back-btn" onClick={() => setSelectedNodeId(null)}>
            ← Back to Search
          </button>
          <h2>Exploring {graphData.nodes.find(n => n.id === selectedNodeId)?.name}</h2>
        </div>
        <div className="graph-layout">
          <GraphViewer 
            data={graphData} 
            onNodeClick={(node) => setSelectedNodeId(node.id)}
            height={window.innerHeight - 200}
          />
          {loadingGraph && <div className="graph-overlay">Loading...</div>}
        </div>
      </div>
    );
  }

  return (
    <div className="page explore-page">
      <h1>Explore the Graph</h1>

      <div className="search-section">
        <div className="search-toggle">
          <button
            className={searchType === "movies" ? "active" : ""}
            onClick={() => setSearchType("movies")}
          >
            🎬 Movies
          </button>
          <button
            className={searchType === "persons" ? "active" : ""}
            onClick={() => setSearchType("persons")}
          >
            🎭 People
          </button>
        </div>
        <input
          type="text"
          className="search-input"
          placeholder={`Search ${searchType}...`}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {isLoading && <p className="loading">Searching...</p>}

      {searchType === "movies" && movieResults && (
        <div className="results-grid">
          {movieResults.results.map((movie: MovieBase) => (
            <div 
              key={movie.id} 
              className="result-card"
              onClick={() => setSelectedNodeId(movie.id)}
            >
              <h3>{movie.title}</h3>
              <div className="result-meta">
                {movie.release_year && <span>{movie.release_year}</span>}
                {movie.rating && <span>⭐ {movie.rating}</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      {searchType === "persons" && personResults && (
        <div className="results-grid">
          {personResults.results.map((person: PersonBase) => (
            <div 
              key={person.id} 
              className="result-card"
              onClick={() => setSelectedNodeId(person.id)}
            >
              <h3>{person.name}</h3>
              {person.birth_year && (
                <div className="result-meta">
                  <span>Born {person.birth_year}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ExplorePage;
