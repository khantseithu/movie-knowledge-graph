import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { searchPersons, findShortestPath } from "../api/client";
import type { PersonBase } from "../api/client";

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

  return (
    <div className="page connection-page">
      <h1>🔗 Six Degrees of Separation</h1>
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

      {pathResult && (
        <div className="path-result">
          <h2>
            Connected in {pathResult.length} step{pathResult.length !== 1 ? "s" : ""}!
          </h2>
          <div className="path-chain">
            {pathResult.path.map((node, i) => (
              <div key={node.id} className="path-node-wrapper">
                <div className={`path-node path-node-${node.label.toLowerCase()}`}>
                  <span className="path-node-label">{node.label}</span>
                  <span className="path-node-name">{node.name}</span>
                </div>
                {i < pathResult.path.length - 1 && (
                  <div className="path-edge">
                    {pathResult.links[i]?.type || "→"}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default ConnectionFinder;
