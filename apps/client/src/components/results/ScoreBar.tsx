type ScoreBarProps = {
  value: number;
  label: string;
};

export function ScoreBar({ value, label }: ScoreBarProps) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between font-body text-sm text-slate">
        <span>{label}</span>
        <span className="font-mono text-ink">{Math.round(value)}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
        <span
          className="block h-2 rounded-full bg-indigo transition-[width] duration-700 ease-out"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}
