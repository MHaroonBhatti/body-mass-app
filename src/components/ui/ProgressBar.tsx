export function ProgressBar({
  current,
  total,
  label,
}: {
  current: number;
  total: number;
  label?: string;
}) {
  const percent = Math.min(100, Math.max(0, (current / total) * 100));

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs font-medium text-[var(--muted)]">
        <span>{label ?? `Step ${current} of ${total}`}</span>
        <span aria-hidden="true">
          {current}/{total}
        </span>
      </div>
      <div
        className="h-1.5 overflow-hidden rounded-full bg-[var(--surface-muted)]"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={current}
        aria-label={label ?? `Step ${current} of ${total}`}
      >
        <div
          className="h-full rounded-full bg-[var(--accent)] transition-[width] duration-300"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
