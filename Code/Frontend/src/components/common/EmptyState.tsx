import { Button } from "../ui/button";
import { cn } from "../../lib/utils";

interface EmptyStateProps {
  icon?: React.ComponentType<{ className?: string; size?: number }>;
  title: string;
  description: string;
  primaryAction?: {
    label: string;
    onClick: () => void;
    icon?: React.ComponentType<{ className?: string; size?: number }>;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

const EmptyState = ({
  icon: Icon,
  title,
  description,
  primaryAction,
  secondaryAction,
  className,
}: EmptyStateProps) => {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface)] p-8 text-center",
        className,
      )}
    >
      {Icon && (
        <div className="mb-4 rounded-full bg-[var(--surface-raised)] p-3">
          <Icon className="h-8 w-8 text-[var(--text-muted)]" />
        </div>
      )}
      <h3 className="text-sm font-semibold text-[var(--text)]">{title}</h3>
      <p className="mt-1 text-sm text-[var(--text-muted)]">{description}</p>
      {primaryAction && (
        <div className="mt-4 flex gap-2">
          <Button onClick={primaryAction.onClick} className="gap-2">
            {primaryAction.icon && <primaryAction.icon className="h-4 w-4" />}
            {primaryAction.label}
          </Button>
          {secondaryAction && (
            <Button variant="outline" onClick={secondaryAction.onClick}>
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export { EmptyState };
