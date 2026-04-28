import { useEffect, useRef, useCallback, useState } from "react";
import { WebSocketService } from "../api/websocket";

interface UseWebSocketOptions {
  runId?: string;
  autoConnect?: boolean;
}

interface UseWebSocketReturn {
  isConnected: boolean;
  lastMessage: Record<string, unknown> | null;
  send: (data: Record<string, unknown>) => void;
  connect: () => void;
  disconnect: () => void;
}

export function useWebSocket(options: UseWebSocketOptions = {}): UseWebSocketReturn {
  const { runId, autoConnect = true } = options;
  const wsRef = useRef<WebSocketService | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<Record<string, unknown> | null>(null);

  const connect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.disconnect();
    }
    const ws = new WebSocketService(runId);
    ws.on("message", (data: Record<string, unknown>) => setLastMessage(data));
    ws.on("progress", (data: Record<string, unknown>) => setLastMessage(data));
    ws.on("log", (data: Record<string, unknown>) => setLastMessage(data));
    ws.on("error", (data: Record<string, unknown>) => setLastMessage(data));
    ws.on("status", (data: Record<string, unknown>) => {
      const msg = (data as any).data?.message;
      if (msg === "connected") setIsConnected(true);
      if (msg === "disconnected") setIsConnected(false);
    });
    ws.connect();
    wsRef.current = ws;
  }, [runId]);

  const disconnect = useCallback(() => {
    wsRef.current?.disconnect();
    wsRef.current = null;
    setIsConnected(false);
  }, []);

  const send = useCallback((data: Record<string, unknown>) => {
    wsRef.current?.send(data);
  }, []);

  useEffect(() => {
    if (autoConnect) connect();
    return () => disconnect();
  }, [autoConnect, connect, disconnect]);

  return { isConnected, lastMessage, send, connect, disconnect };
}