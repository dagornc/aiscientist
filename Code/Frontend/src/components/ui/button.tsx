import { forwardRef } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "../../lib/utils";

type ButtonVariant = "default" | "secondary" | "outline" | "ghost" | "link";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  asChild?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  default: [
    "text-white shadow-none",
    " from-[var(--accent)] to-[var(--accent-hover)]",
    "hover:shadow-[0_0_20px_-2px_var(--glow-accent)]",
    "hover:brightness-110",
  ].join(" "),
  secondary:
    "ghost-border bg-[var(--surface-raised)] text-[var(--text-muted)] hover:bg-[var(--surface)] hover:text-[var(--text)]",
  outline:
    "ghost-border text-[var(--text-muted)] hover:bg-[var(--surface)] hover:text-[var(--text)]",
  ghost:
    "text-[var(--text-muted)] hover:bg-[var(--surface)] hover:text-[var(--text)]",
  link: "text-[var(--accent)] underline-offset-4 hover:underline",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-7 rounded-md px-2.5 text-xs",
  md: "h-9 rounded-lg px-3 text-sm",
  lg: "h-10 rounded-lg px-4 text-sm",
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "md", loading, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap font-medium",
          "transition-all duration-150 ease-out",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-1 focus-visible:ring-offset-[var(--bg)]",
          "active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50",
          variantClasses[variant],
          sizeClasses[size],
          className,
        )}
        disabled={disabled || loading}
        {...props}
      >
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  },
);

Button.displayName = "Button";
export { Button };
