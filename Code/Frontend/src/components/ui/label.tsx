import { cn } from "../../lib/utils";

const Label = ({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) => {
  return (
    <label
      className={cn("text-xs font-medium leading-none text-[var(--text-muted)]", "peer-disabled:cursor-not-allowed peer-disabled:opacity-70", className)}
      {...props}
    />
  );
};

export { Label };
