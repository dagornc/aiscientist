import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Settings, Lightbulb, Activity, X, CheckCircle, Circle } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "../../lib/utils";

interface Step { id: string; label: string; href: string; icon: React.ReactNode; done: boolean }

const STORAGE_KEY = "onboarding_dismissed";

const OnboardingCard = () => {
  const [dismissed, setDismissed] = useState(() => localStorage.getItem(STORAGE_KEY) === "true");
  const [steps] = useState<Step[]>([
    { id: "config", label: "Configure your LLM provider", href: "/settings", icon: <Settings className="h-4 w-4" />, done: !!localStorage.getItem("llm_config") },
    { id: "ideas", label: "Generate your first ideas", href: "/ideas", icon: <Lightbulb className="h-4 w-4" />, done: false },
    { id: "pipeline", label: "Launch a research pipeline", href: "/pipeline", icon: <Activity className="h-4 w-4" />, done: false },
  ]);

  const dismiss = () => { localStorage.setItem(STORAGE_KEY, "true"); setDismissed(true); };

  if (dismissed) return null;

  const completedCount = steps.filter((s) => s.done).length;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, height: 0 }}
        transition={{ duration: 0.3 }}
        className="rounded-xl ghost-border bg-[var(--surface)] p-5 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, oklch(0.18 0.015 270) 0%, oklch(0.65 0.18 290 / 0.06) 100%)" }}
      >
        <button onClick={dismiss} className="absolute top-3 right-3 rounded-md p-1 text-[var(--text-dim)] hover:text-[var(--text)] hover:bg-[var(--surface-raised)]">
          <X className="h-3.5 w-3.5" />
        </button>

        <h3 className="text-sm font-semibold text-[var(--text)]">Getting Started</h3>
        <p className="mt-1 text-xs text-[var(--text-muted)]">{completedCount}/{steps.length} steps completed</p>

        {/* Progress */}
        <div className="mt-3 h-1 rounded-full bg-[var(--surface-raised)] overflow-hidden">
          <div className="h-full rounded-full transition-[width] duration-300" style={{ width: `${(completedCount / steps.length) * 100}%`, background: "linear-gradient(90deg, var(--accent), var(--accent-hover))", boxShadow: "0 0 8px var(--glow-accent)" }} />
        </div>

        <div className="mt-4 space-y-2">
          {steps.map((step) => (
            <Link key={step.id} to={step.href} className={cn("flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors", step.done ? "text-[var(--success)]" : "text-[var(--text-muted)] hover:bg-[var(--surface-raised)] hover:text-[var(--text)]")}>
              {step.done ? <CheckCircle className="h-4 w-4 text-[var(--success)]" /> : <Circle className="h-4 w-4 text-[var(--text-dim)]" />}
              <span className="flex items-center gap-2">{step.icon} {step.label}</span>
            </Link>
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export { OnboardingCard };
