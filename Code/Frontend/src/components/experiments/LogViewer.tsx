import { useEffect, useRef, useState } from "react";
import { Terminal, Play, RotateCcw } from "lucide-react";
import { Button } from "../ui/button";
import { cn } from "../../lib/utils";
import { useWebSocket } from "../../hooks/useWebSocket";

interface LogViewerProps {
  experimentId: string;
}

const LogViewer = ({ experimentId }: LogViewerProps) => {
  const [logs, setLogs] = useState<string[]>([]);
  const termRef = useRef<HTMLDivElement>(null);
  const { isConnected } = useWebSocket({ autoConnect: false });

  useEffect(() => {
    setLogs([`[${new Date().toLocaleTimeString()}] Watching experiment ${experimentId}`]);
  }, [experimentId]);

  useEffect(() => {
    if (termRef.current) termRef.current.scrollTop = termRef.current.scrollHeight;
  }, [logs]);

  return (
    <div className="flex flex-col rounded-lg border border-[var(--border)] bg-[var(--surface)]">
      <div className="flex items-center justify-between border-b border-[var(--border)] p-3">
        <div className="flex items-center gap-2">
          <Terminal className="h-4 w-4 text-[var(--accent)]" />
          <span className="text-sm font-medium text-[var(--text)]">Logs</span>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="secondary" className="gap-1 text-xs">
            <Play className="h-3 w-3" />
            Run
          </Button>
          <Button size="sm" variant="ghost" className="gap-1 text-xs" onClick={() => setLogs([])}>
            <RotateCcw className="h-3 w-3" />
            Clear
          </Button>
        </div>
      </div>

      <div
        ref={termRef}
        className={cn(
          "min-h-[300px] flex-1 overflow-y-auto p-4 font-mono text-xs",
          "bg-[oklch(0.10_0.01_270)] text-[oklch(0.80_0.005_270)]",
        )}
      >
        {logs.length === 0 ? (
          <p className="text-[var(--text-dim)]">No logs yet.</p>
        ) : (
          logs.map((log, i) => (
            <div key={i} className="border-b border-[oklch(0.15_0.01_270)] py-1">{log}</div>
          ))
        )}
      </div>

      <div className="flex justify-between border-t border-[var(--border)] p-2">
        <span className={cn("text-xs", isConnected ? "text-[var(--success)]" : "text-[var(--text-dim)]")}>
          {isConnected ? "Connected" : "Disconnected"}
        </span>
        <span className="text-xs text-[var(--text-dim)]">{logs.length} lines</span>
      </div>
    </div>
  );
};

export { LogViewer };
