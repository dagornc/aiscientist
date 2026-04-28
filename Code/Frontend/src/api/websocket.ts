type MessageHandler = (data: Record<string, unknown>) => void;

const WS_BASE_URL = import.meta.env?.VITE_WS_URL || "ws://localhost:8000";

class WebSocketService {
  private ws: WebSocket | null = null;
  private listeners: Map<string, Set<MessageHandler>> = new Map();
  private runId: string | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private url: string;

  constructor(runId?: string) {
    this.runId = runId ?? null;
    this.url = runId
      ? `${WS_BASE_URL}/api/pipeline/ws/${runId}`
      : `${WS_BASE_URL}/api/pipeline/ws`;
  }

  connect(): void {
    if (this.ws?.readyState === WebSocket.OPEN) return;

    try {
      this.ws = new WebSocket(this.url);
    } catch {
      return;
    }

    this.ws.onopen = () => {
      this.emit("status", { type: "status", data: { message: "connected" }, timestamp: new Date().toISOString() });
    };

    this.ws.onmessage = (event: MessageEvent) => {
      try {
        const parsed = JSON.parse(event.data);
        this.emit(parsed.type || "message", parsed);
      } catch {
        this.emit("message", { raw: event.data, timestamp: new Date().toISOString() });
      }
    };

    this.ws.onclose = () => {
      this.emit("status", { type: "status", data: { message: "disconnected" }, timestamp: new Date().toISOString() });
      this.scheduleReconnect();
    };

    this.ws.onerror = () => {
      // onclose will fire after this
    };
  }

  disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.ws) {
      this.ws.onclose = null; // prevent reconnect
      this.ws.close();
      this.ws = null;
    }
    this.listeners.clear();
  }

  send(data: Record<string, unknown>): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    }
  }

  on(event: string, handler: MessageHandler): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(handler);
  }

  off(event: string, handler: MessageHandler): void {
    this.listeners.get(event)?.delete(handler);
  }

  private emit(event: string, data: Record<string, unknown>): void {
    this.listeners.get(event)?.forEach((handler) => handler(data));
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer) return;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, 3000);
  }
}

export { WebSocketService };