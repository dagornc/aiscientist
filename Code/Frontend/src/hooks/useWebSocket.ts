import { useEffect, useRef, useCallback, useState } from "react";
import { MockWebSocketService } from "../api/websocket";

interface UseWebSocketOptions {
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
  const { autoConnect = true } = options;
  const wsRef = useRef<MockWebSocketService | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<Record<string, unknown> | null>(null);

  const connect = useCallback(() => {
    if (wsRef.current) return;
    const ws = new MockWebSocketService();
    ws.on("message", (data: Record<string, unknown>) => setLastMessage(data));
    ws.on("status", (data: Record<string, unknown>) => setLastMessage(data));
    ws.connect();
    wsRef.current = ws;
    setIsConnected(true);
  }, []);

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
