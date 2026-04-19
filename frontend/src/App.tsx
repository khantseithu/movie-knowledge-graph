import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import HomePage from "./pages/HomePage";
import ExplorePage from "./pages/ExplorePage";
import ConnectionFinder from "./pages/ConnectionFinder";
import "./styles/index.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div className="app">
          <nav className="navbar">
            <a href="/" className="nav-logo">
              🎬 PMKG
            </a>
            <div className="nav-links">
              <a href="/">Home</a>
              <a href="/explore">Explore</a>
              <a href="/connections">Six Degrees</a>
            </div>
          </nav>
          <main className="main-content">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/explore" element={<ExplorePage />} />
              <Route path="/connections" element={<ConnectionFinder />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
