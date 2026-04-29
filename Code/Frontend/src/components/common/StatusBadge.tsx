import { getStatusColor, getStatusDisplay, cn } from "../../lib/utils";

interface StatusBadgeProps {
  status: string;
  className?: string;
  size?: "sm" | "md";
}

const isActiveStatus = (status: string) =>
  ["running", "in_progress", "generating", "experimenting", "validating"].includes(status);

const StatusBadge = ({ status, className, size = "md" }: StatusBadgeProps) => (
  <span
    className={cn(
      "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 font-medium",
      size === "sm" ? "text-[10px]" : "text-xs",
      getStatusColor(status),
      className,
    )}
  >
    {isActiveStatus(status) && (
      <span
        className="status-dot-pulse inline-block h-1.5 w-1.5 rounded-full"
        style={{ background: "currentColor" }}
      />
    )}
    {getStatusDisplay(status)}
  </span>
);

export { StatusBadge };
