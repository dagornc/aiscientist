import toast from "react-hot-toast";
import { CheckCircle, AlertTriangle, XCircle, Info, X } from "lucide-react";

const iconMap = {
  success: <CheckCircle className="h-4 w-4 text-[var(--success)]" />,
  error: <XCircle className="h-4 w-4 text-[var(--error)]" />,
  warning: <AlertTriangle className="h-4 w-4 text-[var(--warning)]" />,
  info: <Info className="h-4 w-4 text-[var(--info)]" />,
};

const glowMap: Record<string, string> = {
  success: "shadow-[0_0_20px_-6px_var(--glow-success)]",
  error: "shadow-[0_0_20px_-6px_var(--glow-error)]",
  warning: "shadow-[0_0_20px_-6px_var(--glow-warning)]",
  info: "shadow-[0_0_20px_-6px_var(--glow-accent)]",
};

type ToastType = "success" | "error" | "warning" | "info";

function showToast(message: string, type: ToastType = "info") {
  toast.custom(
    (t) => (
      <div
        className={`
           ghost-border rounded-xl px-4 py-3 flex items-start gap-3
          max-w-sm transition-all duration-200
          ${glowMap[type] || ""}
          ${t.visible ? "animate-in fade-in slide-in-" : "animate-out fade-out slide-out-"}
        `}
        style={{
          background: "oklch(0.18 0.015 270 / 0.85)",
        }}
      >
        <span className="mt-0.5 flex-shrink-0">{iconMap[type]}</span>
        <p className="flex-1 text-sm text-[var(--text)]">{message}</p>
        <button
          onClick={() => toast.dismiss(t.id)}
          className="flex-shrink-0 rounded-md p-0.5 text-[var(--text-dim)] transition-colors hover:text-[var(--text)] hover:bg-[var(--surface-raised)]"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    ),
    { duration: 4000 },
  );
}

export { showToast };
