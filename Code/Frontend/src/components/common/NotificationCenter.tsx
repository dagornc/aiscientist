import { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bell, CheckCircle, AlertCircle, Info, X } from "lucide-react";
import { cn } from "../../lib/utils";

interface Notification {
  id: string;
  type: "success" | "error" | "info" | "warning";
  title: string;
  description?: string;
  timestamp: string;
  read: boolean;
}

const typeIcons: Record<string, React.ReactNode> = {
  success: <CheckCircle className="h-4 w-4 text-[var(--success)]" />,
  error: <AlertCircle className="h-4 w-4 text-[var(--error)]" />,
  info: <Info className="h-4 w-4 text-[var(--info)]" />,
  warning: <AlertCircle className="h-4 w-4 text-[var(--warning)]" />,
};

function formatTime(ts: string): string {
  const d = Math.floor((Date.now() - new Date(ts).getTime()) / 1000);
  if (d < 60) return "now";
  if (d < 3600) return `${Math.floor(d / 60)}m`;
  if (d < 86400) return `${Math.floor(d / 3600)}h`;
  return `${Math.floor(d / 86400)}d`;
}

function sampleNotifs(): Notification[] {
  const n = Date.now();
  return [
    { id: "n1", type: "success", title: "Pipeline completed", description: "All 4 phases finished", timestamp: new Date(n - 180_000).toISOString(), read: false },
    { id: "n2", type: "info", title: "3 new ideas generated", description: "Domain: Transformer architectures", timestamp: new Date(n - 900_000).toISOString(), read: false },
    { id: "n3", type: "error", title: "Experiment failed", description: "CUDA out of memory", timestamp: new Date(n - 3_600_000).toISOString(), read: true },
    { id: "n4", type: "success", title: "Paper accepted", description: "Score: 8.5/10", timestamp: new Date(n - 7_200_000).toISOString(), read: true },
  ];
}

const NotificationCenter = () => {
  const [open, setOpen] = useState(false);
  const [notifs, setNotifs] = useState(sampleNotifs);
  const ref = useRef<HTMLDivElement>(null);
  const unread = notifs.filter((n) => !n.read).length;

  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    if (open) document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen((v) => !v)} className="relative rounded-lg p-2 text-[var(--text-dim)] hover:text-[var(--text)] hover:bg-[var(--surface-raised)] transition-colors" aria-label="Notifications">
        <Bell className="h-4 w-4" />
        {unread > 0 && <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--accent)] text-[9px] font-bold text-white">{unread}</span>}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.15 }} className="absolute right-0 top-full mt-2 w-80 rounded-xl ghost-border bg-[var(--surface)] shadow-[0_0_40px_-8px_var(--glow-accent)] overflow-hidden z-50">
            <div className="flex items-center justify-between border-b border-[oklch(0.28_0.015_270/0.3)] px-4 py-3">
              <h3 className="text-sm font-semibold text-[var(--text)]">Notifications</h3>
              {unread > 0 && <button onClick={() => setNotifs((p) => p.map((n) => ({ ...n, read: true })))} className="text-[10px] text-[var(--accent)] hover:underline">Mark all read</button>}
            </div>
            <div className="max-h-[320px] overflow-y-auto">
              {notifs.length === 0 ? (
                <p className="px-4 py-8 text-center text-sm text-[var(--text-dim)]">No notifications</p>
              ) : notifs.map((n, i) => (
                <motion.div key={n.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }} className={cn("group flex items-start gap-3 px-4 py-3 hover:bg-[var(--surface-raised)] transition-colors", !n.read && "border-l-2 border-[var(--accent)]")}>
                  <span className="mt-0.5 flex-shrink-0">{typeIcons[n.type]}</span>
                  <div className="flex-1 min-w-0">
                    <p className={cn("text-xs", n.read ? "text-[var(--text-muted)]" : "font-medium text-[var(--text)]")}>{n.title}</p>
                    {n.description && <p className="text-[11px] text-[var(--text-dim)] truncate">{n.description}</p>}
                    <span className="text-[10px] text-[var(--text-dim)] tabular-nums">{formatTime(n.timestamp)}</span>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); setNotifs((p) => p.filter((x) => x.id !== n.id)); }} className="flex-shrink-0 rounded p-0.5 text-[var(--text-dim)] opacity-0 group-hover:opacity-100 hover:text-[var(--text)]"><X className="h-3 w-3" /></button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export { NotificationCenter };
