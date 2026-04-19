function HomePage() {
  return (
    <div className="page home-page">
      <div className="hero">
        <h1>🎬 Movie Knowledge Graph</h1>
        <p className="hero-subtitle">
          Explore movie relationships, find connections between actors, and
          discover new films through the power of graph data.
        </p>
        <div className="hero-cards">
          <a href="/explore" className="hero-card">
            <span className="hero-card-icon">🔍</span>
            <h3>Explore</h3>
            <p>Search movies and actors. Visualize their connections as an interactive graph.</p>
          </a>
          <a href="/connections" className="hero-card">
            <span className="hero-card-icon">🔗</span>
            <h3>Six Degrees</h3>
            <p>Find the shortest path between any two actors through shared movies.</p>
          </a>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
