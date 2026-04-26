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
  default: "bg-[var(--accent)] text-white shadow-sm hover:bg-[var(--accent-hover)]",
  secondary: "border border-[var(--border)] bg-[var(--surface-raised)] text-[var(--text-muted)] hover:bg-[var(--surface)]",
  outline: "border border-[var(--border)] text-[var(--text-muted)] hover:bg-[var(--surface)]",
  ghost: "text-[var(--text-muted)] hover:bg-[var(--surface)] hover:text-[var(--text)]",
  link: "text-[var(--accent)] underline-offset-4 hover:underline",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-7 rounded px-2 text-xs",
  md: "h-9 rounded-md px-3 text-sm",
  lg: "h-10 rounded-md px-4 text-sm",
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "md", loading, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap font-medium transition-[background,color,transform] duration-150 ease-out",
          "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)]",
          "active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50",
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
