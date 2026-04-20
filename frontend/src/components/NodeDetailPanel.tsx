import { useQuery } from "@tanstack/react-query";
import { getMovie, getPerson, getRecommendations } from "../api/client";
import type { MovieDetail, PersonDetail, MovieBase } from "../api/client";

interface NodeDetailPanelProps {
  nodeId: string | null;
  label: string | null;
  onClose: () => void;
  onMovieClick: (id: string) => void;
}

const NodeDetailPanel = ({ nodeId, label, onClose, onMovieClick }: NodeDetailPanelProps) => {
  const isMovie = label === "Movie";
  const isPerson = label === "Person";

  const { data: movieData, isLoading: loadingMovie } = useQuery({
    queryKey: ["movie-detail", nodeId],
    queryFn: () => getMovie(nodeId!),
    enabled: !!nodeId && isMovie,
  });

  const { data: personData, isLoading: loadingPerson } = useQuery({
    queryKey: ["person-detail", nodeId],
    queryFn: () => getPerson(nodeId!),
    enabled: !!nodeId && isPerson,
  });

  const { data: recommendations, isLoading: loadingRecs } = useQuery({
    queryKey: ["recommendations", nodeId],
    queryFn: () => getRecommendations(nodeId!),
    enabled: !!nodeId && isMovie,
  });

  if (!nodeId) return null;

  return (
    <div className={`detail-panel ${nodeId ? "open" : ""}`}>
      <button className="close-panel-btn" onClick={onClose}>✕</button>

      <div className="panel-content">
        {(loadingMovie || loadingPerson) && <div className="panel-loading">Loading details...</div>}

        {isMovie && movieData && (
          <div className="movie-details">
            <span className="type-tag movie">Movie</span>
            <h1>{movieData.title}</h1>
            <div className="meta-row">
              <span className="rating">⭐ {movieData.rating}</span>
              <span className="year">{movieData.release_year}</span>
            </div>

            <div className="genres">
              {movieData.genres.map(g => <span key={g} className="genre-tag">{g}</span>)}
            </div>

            <section className="cast-crew">
              <h3>Top Cast & Crew</h3>
              <div className="cast-list">
                {movieData.cast.slice(0, 5).map(actor => (
                  <div key={actor.id} className="mini-card">
                    <span className="name">{actor.name}</span>
                  </div>
                ))}
              </div>
            </section>

            {recommendations && recommendations.length > 0 && (
              <section className="recommendations">
                <h3>Similar Movies</h3>
                <div className="rec-list">
                  {recommendations.slice(0, 4).map(rec => (
                    <div 
                      key={rec.id} 
                      className="rec-card"
                      onClick={() => onMovieClick(rec.id)}
                    >
                      <span className="rec-title">{rec.title}</span>
                      <span className="rec-meta">{rec.release_year} • ⭐{rec.rating}</span>
                    </div>
                  ))}
                </div>
                {loadingRecs && <p className="small-loading">Fetching recommendations...</p>}
              </section>
            )}
          </div>
        )}

        {isPerson && personData && (
          <div className="person-details">
            <span className="type-tag person">Person</span>
            <h1>{personData.name}</h1>
            {personData.birth_year && <p className="birth-year">Born: {personData.birth_year}</p>}

            <section className="filmography">
              <h3>Highlighted Movies</h3>
              <div className="film-list">
                {[...personData.movies_acted, ...personData.movies_directed]
                  .sort((a, b) => (b.release_year || 0) - (a.release_year || 0))
                  .slice(0, 8)
                  .map(movie => (
                    <div 
                      key={movie.id} 
                      className="mini-card clickable"
                      onClick={() => onMovieClick(movie.id)}
                    >
                      <span className="title">{movie.title}</span>
                      <span className="year">{movie.release_year}</span>
                    </div>
                  ))
                }
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
};

export default NodeDetailPanel;
