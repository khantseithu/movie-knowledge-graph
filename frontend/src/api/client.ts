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

export async function searchPersons(query: string): Promise<{ results: PersonBase[]; total: number }> {
  const res = await fetch(`${API_BASE}/persons?q=${encodeURIComponent(query)}`);
  if (!res.ok) throw new Error("Failed to search persons");
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
