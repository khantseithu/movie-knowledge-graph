import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { searchPersons, findShortestPath } from "../api/client";
import type { PersonBase } from "../api/client";
import GraphViewer from "../components/GraphViewer";

function ConnectionFinder() {
  const [queryA, setQueryA] = useState("");
  const [queryB, setQueryB] = useState("");
  const [personA, setPersonA] = useState<PersonBase | null>(null);
  const [personB, setPersonB] = useState<PersonBase | null>(null);
  const [shouldSearch, setShouldSearch] = useState(false);

  const { data: resultsA } = useQuery({
    queryKey: ["persons", queryA],
    queryFn: () => searchPersons(queryA),
    enabled: queryA.length > 1 && !personA,
  });

  const { data: resultsB } = useQuery({
    queryKey: ["persons", queryB],
    queryFn: () => searchPersons(queryB),
    enabled: queryB.length > 1 && !personB,
  });

  const {
    data: pathResult,
    isLoading: pathLoading,
    error: pathError,
  } = useQuery({
    queryKey: ["path", personA?.id, personB?.id],
    queryFn: () => findShortestPath(personA!.id, personB!.id),
    enabled: shouldSearch && !!personA && !!personB,
  });

  const handleSearch = () => {
    if (personA && personB) {
      setShouldSearch(true);
    }
  };

  const handleReset = () => {
    setPersonA(null);
    setPersonB(null);
    setQueryA("");
    setQueryB("");
    setShouldSearch(false);
  };

  return (
    <div className="page connection-page">
      <h1>🔗 Six Degrees of Separation</h1>
      {!shouldSearch || !pathResult ? (
        <>
          <p className="page-subtitle">
            Find the shortest connection between any two actors through their shared
            movies.
          </p>

          <div className="connection-form">
            <div className="person-picker">
              <label>Actor A</label>
              {personA ? (
                <div className="selected-person">
                  <span>{personA.name}</span>
                  <button onClick={() => { setPersonA(null); setShouldSearch(false); }}>✕</button>
                </div>
              ) : (
                <>
                  <input
                    type="text"
                    placeholder="Search for an actor..."
                    value={queryA}
                    onChange={(e) => setQueryA(e.target.value)}
                  />
                  {resultsA && (
                    <ul className="person-suggestions">
                      {resultsA.results.slice(0, 5).map((p) => (
                        <li key={p.id} onClick={() => { setPersonA(p); setQueryA(p.name); }}>
                          {p.name}
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              )}
            </div>

            <div className="connection-arrow">↔</div>

            <div className="person-picker">
              <label>Actor B</label>
              {personB ? (
                <div className="selected-person">
                  <span>{personB.name}</span>
                  <button onClick={() => { setPersonB(null); setShouldSearch(false); }}>✕</button>
                </div>
              ) : (
                <>
                  <input
                    type="text"
                    placeholder="Search for an actor..."
                    value={queryB}
                    onChange={(e) => setQueryB(e.target.value)}
                  />
                  {resultsB && (
                    <ul className="person-suggestions">
                      {resultsB.results.slice(0, 5).map((p) => (
                        <li key={p.id} onClick={() => { setPersonB(p); setQueryB(p.name); }}>
                          {p.name}
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              )}
            </div>
          </div>

          <button
            className="find-path-btn"
            onClick={handleSearch}
            disabled={!personA || !personB || pathLoading}
          >
            {pathLoading ? "Searching..." : "Find Connection"}
          </button>

          {pathError && (
            <div className="error-message">
              No connection found between these two actors.
            </div>
          )}
        </>
      ) : (
        <div className="path-visualization">
          <div className="graph-header">
            <button className="back-btn" onClick={handleReset}>
              ← New Search
            </button>
            <h2>
              {personA?.name} and {personB?.name} are connected in {pathResult.length} steps!
            </h2>
          </div>
          <div className="graph-layout">
            <GraphViewer 
              data={{ nodes: pathResult.path, links: pathResult.links }} 
              height={window.innerHeight - 250}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default ConnectionFinder;
