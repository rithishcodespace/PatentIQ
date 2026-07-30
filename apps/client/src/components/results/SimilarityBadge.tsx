import { formatScore } from '../../utils/formatScore'

type SimilarityBadgeProps = {
  score: number
}

export function SimilarityBadge({ score }: SimilarityBadgeProps) {
  return <span className="similarity-badge">{formatScore(score)}</span>
}