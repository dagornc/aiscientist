import { cn } from "../../lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  asChild?: boolean;
}

const Input = ({ className, type = "text", ...props }: InputProps) => {
  return (
    <input
      type={type}
      className={cn(
        "flex h-9 w-full rounded-lg bg-[oklch(0.12_0.015_270)] px-3 py-2 text-sm text-[var(--text)]",
        "ghost-border",
        "file:border-0 file:bg-transparent file:text-sm file:font-medium",
        "placeholder:text-[var(--text-dim)]",
        "focus-visible:outline-none focus-visible:border-[var(--accent)]",
        "focus-visible:shadow-[0_0_0_2px_var(--glow-accent)]",
        "transition-all duration-200",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
};

export { Input };
