import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { searchMovies, searchPersons, getNeighbors } from "../api/client";
import type { MovieBase, PersonBase, GraphData } from "../api/client";
import GraphViewer from "../components/GraphViewer";
import NodeDetailPanel from "../components/NodeDetailPanel";

function ExplorePage() {
  const [query, setQuery] = useState("");
  const [searchType, setSearchType] = useState<"movies" | "persons">("movies");
  const [focusedNodeId, setFocusedNodeId] = useState<string | null>(null);
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [isExpanding, setIsExpanding] = useState(false);

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

  const handleNodeSelect = async (nodeId: string) => {
    setIsExpanding(true);
    setFocusedNodeId(nodeId);
    try {
      const newData = await getNeighbors(nodeId);
      
      if (!graphData) {
        // Initial load from search
        setGraphData(newData);
      } else {
        // Merge with existing graph
        setGraphData(prev => {
          if (!prev) return newData;
          
          const existingNodeIds = new Set(prev.nodes.map(n => n.id));
          const newNodes = newData.nodes.filter(n => !existingNodeIds.has(n.id));
          
          // Identify unique links (simple source-target key)
          const existingLinkKeys = new Set(prev.links.map(l => `${l.source}-${l.target}`));
          const newLinks = newData.links.filter(l => !existingLinkKeys.has(`${l.source}-${l.target}`));

          return {
            nodes: [...prev.nodes, ...newNodes],
            links: [...prev.links, ...newLinks]
          };
        });
      }
    } catch (error) {
      console.error("Failed to expand graph:", error);
    } finally {
      setIsExpanding(false);
    }
  };

  const isLoading = loadingMovies || loadingPersons;

  if (graphData) {
    const selectedNode = graphData.nodes.find(n => n.id === focusedNodeId);

    return (
      <div className="page graph-view-page">
        <div className="graph-header">
          <button className="back-btn" onClick={() => { setGraphData(null); setFocusedNodeId(null); }}>
            ← Back to Search
          </button>
          <h2>Exploring the Graph</h2>
        </div>
        <div className="graph-layout-container">
          <div className="graph-layout">
            <GraphViewer 
              data={graphData} 
              onNodeClick={(node) => handleNodeSelect(node.id)}
            />
            {isExpanding && <div className="graph-overlay">Expanding...</div>}
          </div>

          <NodeDetailPanel 
            nodeId={focusedNodeId}
            label={selectedNode?.label || null}
            onClose={() => setFocusedNodeId(null)}
            onMovieClick={handleNodeSelect}
          />
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
              onClick={() => handleNodeSelect(movie.id)}
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
              onClick={() => handleNodeSelect(person.id)}
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
