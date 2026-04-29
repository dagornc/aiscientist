import { cn } from "../../lib/utils";

interface TimelineStep {
  name: string;
  status: "pending" | "in_progress" | "completed" | "failed";
}

interface PipelineTimelineProps {
  steps: TimelineStep[];
  className?: string;
}

const PipelineTimeline = ({ steps, className }: PipelineTimelineProps) => {
  return (
    <div className={cn("flex items-center gap-1", className)}>
      {steps.map((step, index) => (
        <div key={step.name} className="flex items-center">
          <div
            className={cn(
              "flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all duration-200",
              step.status === "completed" &&
                "bg-[oklch(0.72_0.17_155/0.1)] text-[var(--success)]",
              step.status === "in_progress" &&
                "bg-[oklch(0.78_0.15_75/0.1)] text-[var(--warning)]",
              step.status === "failed" &&
                "bg-[oklch(0.62_0.20_25/0.1)] text-[var(--error)]",
              step.status === "pending" &&
                "bg-[var(--surface-raised)] text-[var(--text-dim)]",
            )}
          >
            {step.status === "completed" && "✓"}
            {step.status === "in_progress" && (
              <span className="status-dot-pulse">●</span>
            )}
            {step.status === "failed" && "✗"}
            {step.status === "pending" && "○"}
            <span>{step.name}</span>
          </div>
          {index < steps.length - 1 && (
            <div
              className={cn(
                "mx-1.5 h-px w-6 transition-colors duration-300",
                step.status === "completed"
                  ? "bg-[var(--success)]"
                  : "bg-[var(--border)]",
              )}
              style={
                step.status === "completed"
                  ? { boxShadow: "0 0 4px var(--glow-success)" }
                  : undefined
              }
            />
          )}
        </div>
      ))}
    </div>
  );
};

export { PipelineTimeline };
