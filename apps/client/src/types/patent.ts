export interface Patent {
  id: number;
  title: string;
  similarity: number;
  ipc: string;
  abstract: string;
  claims: string;
}