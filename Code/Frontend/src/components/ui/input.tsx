import { cn } from "../../lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  asChild?: boolean;
}

const Input = ({ className, type = "text", ...props }: InputProps) => {
  return (
    <input
      type={type}
      className={cn(
        "flex h-9 w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text)]",
        "file:border-0 file:bg-transparent file:text-sm file:font-medium",
        "placeholder:text-[var(--text-dim)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)]",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
};

export { Input };
