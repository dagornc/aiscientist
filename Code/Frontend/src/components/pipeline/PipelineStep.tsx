import { Handle, Position, type NodeProps } from "@xyflow/react";
import { cn } from "../../lib/utils";
import { CheckCircle, Circle, Loader2, XCircle } from "lucide-react";

interface PipelineStepData {
  label: string;
  status: "pending" | "in_progress" | "completed" | "failed";
  description: string;
  [key: string]: unknown;
}

function PipelineStep({ data }: NodeProps) {
  const stepData = data as PipelineStepData;
  const status = stepData.status || "pending";

  const statusIcons: Record<string, React.ReactNode> = {
    completed: <CheckCircle className="h-4 w-4 text-[var(--success)]" />,
    in_progress: (
      <Loader2 className="h-4 w-4 text-[var(--warning)] animate-spin" />
    ),
    failed: <XCircle className="h-4 w-4 text-[var(--error)]" />,
    pending: <Circle className="h-4 w-4 text-[var(--text-dim)]" />,
  };

  const statusStyles: Record<string, string> = {
    pending: "ghost-border",
    in_progress: "border-[var(--warning)] border-2",
    completed: "border-[var(--success)] border",
    failed: "border-[var(--error)] border",
  };

  const glowClass: Record<string, string> = {
    in_progress: "",
    completed: "",
    failed: "",
    pending: "",
  };

  return (
    <div
      className={cn(
        "rounded-xl bg-[var(--surface)] px-4 py-3 min-w-[180px]",
        "transition-shadow duration-300",
        statusStyles[status] || statusStyles.pending,
        glowClass[status],
      )}
      style={
        status === "in_progress"
          ? { animation: " 2.5s ease-in-out infinite" }
          : status === "completed"
            ? { boxShadow: "0 0 12px -2px var(--glow-success)" }
            : undefined
      }
    >
      <Handle type="target" position={Position.Left} className="!bg-[var(--accent)] !w-2 !h-2" />
      <div className="flex items-center gap-2">
        {statusIcons[status] || statusIcons.pending}
        <span className="text-sm font-medium text-[var(--text)]">
          {stepData.label}
        </span>
      </div>
      <p className="mt-1 text-xs text-[var(--text-dim)]">{stepData.description}</p>
      <Handle type="source" position={Position.Right} className="!bg-[var(--accent)] !w-2 !h-2" />
    </div>
  );
}

export { PipelineStep };
export type { PipelineStepData };
