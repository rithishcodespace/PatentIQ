import { clamp } from './helpers';

export function formatScore(score?: number): string {
  const num = Number(score ?? 0);
  const normalized = clamp(isNaN(num) ? 0 : num, 0, 100);
  return `${normalized.toFixed(0)}% match`;
}