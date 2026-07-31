import { clamp } from './helpers'

export function formatScore(score: number) {
  const normalized = clamp(score, 0, 100)
  return `${normalized.toFixed(0)}% match`
}