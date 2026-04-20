const API_BASE = "http://localhost:8000/api";

export interface MovieBase {
  id: string;
  title: string;
  release_year: number | null;
  rating: number | null;
}

export interface PersonBase {
  id: string;
  name: string;
  birth_year: number | null;
}

export interface GraphNode {
  id: string;
  label: string;
  name: string;
  properties: Record<string, unknown>;
}

export interface GraphLink {
  source: string;
  target: string;
  type: string;
  properties: Record<string, unknown>;
}

export interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

export interface MovieRef {
  id: string;
  title: string;
  release_year: number | null;
  role?: string;
}

export interface MovieDetail extends MovieBase {
  genres: string[];
  cast: PersonBase[];
  directors: PersonBase[];
}

export interface PersonDetail extends PersonBase {
  movies_acted: MovieRef[];
  movies_directed: MovieRef[];
}

export interface PathResult {
  path: GraphNode[];
  links: GraphLink[];
  length: number;
}

export async function searchMovies(query: string): Promise<{ results: MovieBase[]; total: number }> {
  const res = await fetch(`${API_BASE}/movies?q=${encodeURIComponent(query)}`);
  if (!res.ok) throw new Error("Failed to search movies");
  return res.json();
}

export async function getMovie(id: string): Promise<MovieDetail> {
  const res = await fetch(`${API_BASE}/movies/${encodeURIComponent(id)}`);
  if (!res.ok) throw new Error("Failed to fetch movie details");
  return res.json();
}

export async function searchPersons(query: string): Promise<{ results: PersonBase[]; total: number }> {
  const res = await fetch(`${API_BASE}/persons?q=${encodeURIComponent(query)}`);
  if (!res.ok) throw new Error("Failed to search persons");
  return res.json();
}

export async function getPerson(id: string): Promise<PersonDetail> {
  const res = await fetch(`${API_BASE}/persons/${encodeURIComponent(id)}`);
  if (!res.ok) throw new Error("Failed to fetch person details");
  return res.json();
}

export async function getNeighbors(nodeId: string): Promise<GraphData> {
  const res = await fetch(`${API_BASE}/graph/neighbors/${encodeURIComponent(nodeId)}`);
  if (!res.ok) throw new Error("Failed to fetch graph neighbors");
  return res.json();
}

export async function findShortestPath(fromId: string, toId: string): Promise<PathResult> {
  const res = await fetch(`${API_BASE}/paths?from=${encodeURIComponent(fromId)}&to=${encodeURIComponent(toId)}`);
  if (!res.ok) throw new Error("No path found");
  return res.json();
}

export async function getRecommendations(movieId: string): Promise<MovieBase[]> {
  const res = await fetch(`${API_BASE}/recommendations/${encodeURIComponent(movieId)}`);
  if (!res.ok) throw new Error("Failed to get recommendations");
  return res.json();
}
