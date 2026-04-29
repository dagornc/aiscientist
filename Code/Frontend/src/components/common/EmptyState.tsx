import { motion } from "framer-motion";
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
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
      className={cn(
        "flex flex-col items-center justify-center rounded-xl ghost-border bg-[var(--surface)] p-12 text-center",
        className,
      )}
    >
      {Icon && (
        <div className="relative mb-5">
          <div className="rounded-2xl bg-[var(--surface-raised)] p-4">
            <Icon className="h-8 w-8 text-[var(--text-muted)]" />
          </div>
          {/* Ambient glow behind icon */}
          <div
            className="absolute inset-0 -z-10 rounded-2xl blur-xl"
            style={{
              background: "var(--accent)",
              opacity: 0.06,
            }}
          />
        </div>
      )}
      <h3 className="text-sm font-semibold text-[var(--text)]">{title}</h3>
      <p className="mt-1.5 max-w-xs text-sm text-[var(--text-muted)]">{description}</p>
      {primaryAction && (
        <div className="mt-5 flex gap-2">
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
    </motion.div>
  );
};

export { EmptyState };
