import { cn } from "../../lib/utils";

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
}

const Progress = ({ value, className, ...props }: ProgressProps) => {
  const pct = Math.min(100, Math.max(0, value));
  return (
    <div
      className={cn("relative h-1.5 w-full overflow-hidden rounded-full bg-[var(--surface-raised)]", className)}
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
      {...props}
    >
      <div
        className="h-full rounded-full bg-[var(--accent)] transition-[width] duration-200 ease-out"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
};

export { Progress };
