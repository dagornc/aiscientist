import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Keyboard, X } from "lucide-react";
import { useHotkeys } from "../../hooks/useHotkeys";

const ShortcutsHelp = () => {
  const [open, setOpen] = useState(false);
  const shortcuts = useHotkeys();

  // Group shortcuts
  const groups = shortcuts.reduce<Record<string, typeof shortcuts>>(
    (acc, shortcut) => {
      if (!acc[shortcut.group]) acc[shortcut.group] = [];
      acc[shortcut.group].push(shortcut);
      return acc;
    },
    {},
  );

  // Open with ?
  useState(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.key === "?") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  });

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100]">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50"
            onClick={() => setOpen(false)}
          />
          <div className="flex justify-center items-center min-h-full p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-md rounded-xl ghost-border bg-[var(--surface)] p-6 shadow-[0_0_40px_-8px_var(--glow-accent)]"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Keyboard className="h-4 w-4 text-[var(--accent)]" />
                  <h2 className="text-sm font-semibold text-[var(--text)]">
                    Keyboard Shortcuts
                  </h2>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="rounded-md p-1 text-[var(--text-dim)] hover:text-[var(--text)] hover:bg-[var(--surface-raised)]"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {Object.entries(groups).map(([group, items]) => (
                <div key={group} className="mb-4 last:mb-0">
                  <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-[var(--text-dim)]">
                    {group}
                  </h3>
                  <div className="space-y-1">
                    {items.map((shortcut) => (
                      <div
                        key={shortcut.label}
                        className="flex items-center justify-between rounded-lg px-2 py-1.5"
                      >
                        <span className="text-sm text-[var(--text-muted)]">
                          {shortcut.label}
                        </span>
                        <div className="flex gap-1">
                          {shortcut.keys.map((key) => (
                            <kbd
                              key={key}
                              className="min-w-[22px] rounded bg-[var(--surface-raised)] px-1.5 py-0.5 text-center text-[10px] font-mono text-[var(--text-dim)]"
                            >
                              {key.toUpperCase()}
                            </kbd>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              <div className="mt-4 border-t border-[oklch(0.28_0.015_270/0.3)] pt-3">
                <div className="flex items-center justify-between text-xs text-[var(--text-dim)]">
                  <span>Open Command Palette</span>
                  <div className="flex gap-1">
                    <kbd className="rounded bg-[var(--surface-raised)] px-1.5 py-0.5 text-[10px] font-mono">⌘</kbd>
                    <kbd className="rounded bg-[var(--surface-raised)] px-1.5 py-0.5 text-[10px] font-mono">K</kbd>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};

export { ShortcutsHelp };
