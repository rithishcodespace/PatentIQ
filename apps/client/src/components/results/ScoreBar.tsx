type ScoreBarProps = {
  value: number
  label: string
}

export function ScoreBar({ value, label }: ScoreBarProps) {
  return (
    <div className="score-bar">
      <div className="score-bar-track">
        <span className="score-bar-fill" style={{ width: `${value}%` }} />
      </div>
      <span>{label}</span>
    </div>
  )
}