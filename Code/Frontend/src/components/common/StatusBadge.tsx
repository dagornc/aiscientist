import { getStatusColor, getStatusDisplay, cn } from "../../lib/utils";

interface StatusBadgeProps {
  status: string;
  className?: string;
  size?: "sm" | "md";
}

const StatusBadge = ({ status, className, size = "md" }: StatusBadgeProps) => (
  <span
    className={cn(
      "inline-flex items-center rounded-full px-2 py-0.5 font-medium",
      size === "sm" ? "text-[10px]" : "text-xs",
      getStatusColor(status),
      className,
    )}
  >
    {getStatusDisplay(status)}
  </span>
);

export { StatusBadge };
