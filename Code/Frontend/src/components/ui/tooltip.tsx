import { cn } from "../../lib/utils";

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  side?: "top" | "bottom" | "left" | "right";
  className?: string;
}

const Tooltip = ({ content, children, side = "top", className }: TooltipProps) => {
  const sideClasses: Record<string, string> = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  };

  return (
    <div className="group relative inline-flex">
      {children}
      <div
        role="tooltip"
        className={cn(
          "pointer-events-none absolute z-50 whitespace-nowrap rounded-lg px-2.5 py-1.5",
          "bg-[var(--surface-raised)] text-xs text-[var(--text-muted)] ghost-border",
          "opacity-0 transition-all duration-150 ease-out",
          "group-hover:opacity-100 group-hover:translate-y-0",
          "shadow-[0_0_16px_-4px_var(--glow-accent)]",
          side === "top" && "translate-y-1",
          side === "bottom" && "-translate-y-1",
          sideClasses[side],
          className,
        )}
      >
        {content}
      </div>
    </div>
  );
};

export { Tooltip };
