import { useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";

type ShortcutCallback = () => void;

interface ShortcutDef {
  keys: string[];
  label: string;
  action: ShortcutCallback;
  group: string;
}

export function useHotkeys() {
  const navigate = useNavigate();
  const bufferRef = useRef("");
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const shortcuts: ShortcutDef[] = [
    { keys: ["g", "d"], label: "Go to Dashboard", action: () => navigate("/dashboard"), group: "Navigation" },
    { keys: ["g", "i"], label: "Go to Ideas", action: () => navigate("/ideas"), group: "Navigation" },
    { keys: ["g", "e"], label: "Go to Experiments", action: () => navigate("/experiments"), group: "Navigation" },
    { keys: ["g", "p"], label: "Go to Papers", action: () => navigate("/papers"), group: "Navigation" },
    { keys: ["g", "r"], label: "Go to Reviews", action: () => navigate("/reviews"), group: "Navigation" },
    { keys: ["g", "l"], label: "Go to Pipeline", action: () => navigate("/pipeline"), group: "Navigation" },
    { keys: ["g", "s"], label: "Go to Settings", action: () => navigate("/settings"), group: "Navigation" },
  ];

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Ignore when typing in inputs
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      // Clear buffer after 800ms of inactivity
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        bufferRef.current = "";
      }, 800);

      bufferRef.current += e.key.toLowerCase();

      // Check for matching shortcuts
      for (const shortcut of shortcuts) {
        const sequence = shortcut.keys.join("");
        if (bufferRef.current === sequence) {
          e.preventDefault();
          shortcut.action();
          bufferRef.current = "";
          return;
        }
      }

      // If buffer is too long, reset
      if (bufferRef.current.length > 3) {
        bufferRef.current = "";
      }
    },
    [shortcuts],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return shortcuts;
}
