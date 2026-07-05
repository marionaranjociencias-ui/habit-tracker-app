type ProgressBarProps = {
  percentage: number;
};

export function ProgressBar({ percentage }: ProgressBarProps) {
  return (
    <div className="progress-bar">
      <div className="progress-bar__fill" style={{ width: `${Math.min(percentage, 100)}%` }} />
    </div>
  );
}
