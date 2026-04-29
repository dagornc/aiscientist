import { cn } from "../../lib/utils";

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
}

const Progress = ({ value, className, ...props }: ProgressProps) => {
  const pct = Math.min(100, Math.max(0, value));
  return (
    <div
      className={cn(
        "relative h-1.5 w-full overflow-hidden rounded-full bg-[var(--surface-raised)]",
        className,
      )}
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
      {...props}
    >
      <div
        className="h-full rounded-full transition-[width] duration-300 ease-out"
        style={{
          width: `${pct}%`,
          background: "linear-gradient(90deg, var(--accent), var(--accent-hover))",
          boxShadow: pct > 0 ? "0 0 12px 1px var(--glow-accent)" : "none",
        }}
      />
      {/* Shimmer overlay */}
      {pct > 0 && pct < 100 && (
        <div
          className="absolute inset-0 rounded-full"
          style={{
            width: `${pct}%`,
            background:
              "linear-gradient(90deg, transparent 0%, oklch(1 0 0 / 0.15) 50%, transparent 100%)",
            backgroundSize: "200% 100%",
            animation: "progress-shimmer 2s ease-in-out infinite",
          }}
        />
      )}
    </div>
  );
};

export { Progress };
