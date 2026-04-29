import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "../../lib/utils";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  options: SelectOption[];
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
  disabled?: boolean;
}

const Select = ({ options, placeholder, value, onChange, className, disabled }: SelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState(value || "");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value !== undefined) setSelectedValue(value);
  }, [value]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleSelect = (val: string) => {
    setSelectedValue(val);
    onChange?.(val);
    setIsOpen(false);
  };

  const displayLabel = options.find((o) => o.value === selectedValue)?.label || placeholder || "Select...";

  return (
    <div className={cn("relative", className)} ref={ref}>
      <button
        type="button"
        disabled={disabled}
        className={cn(
          "flex w-full items-center justify-between rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text)]",
          "hover:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]",
          "disabled:cursor-not-allowed disabled:opacity-50",
        )}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <span className={selectedValue ? "" : "text-[var(--text-dim)]"}>{displayLabel}</span>
        <ChevronDown className={cn("ml-2 h-4 w-4 transition-transform", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <div className="absolute top-full z-50 mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--surface-raised)] shadow-none max-h-60 overflow-auto">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              className={cn(
                "flex w-full items-center justify-between px-3 py-2 text-sm text-[var(--text)] hover:bg-[var(--surface)]",
                selectedValue === option.value && "font-medium",
              )}
              onClick={() => handleSelect(option.value)}
            >
              <span>{option.label}</span>
              {selectedValue === option.value && <Check className="h-4 w-4 text-[var(--accent)]" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export { Select };
