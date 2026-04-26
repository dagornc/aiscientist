type MessageHandler = (data: Record<string, unknown>) => void;

class MockWebSocketService {
  private listeners: Map<string, Set<MessageHandler>> = new Map();
  private intervalId: ReturnType<typeof setInterval> | null = null;

  connect(): void {
    this.intervalId = setInterval(() => {
      this.emit("status", {
        type: "status",
        timestamp: new Date().toISOString(),
        data: { message: "Pipeline heartbeat" },
      });
    }, 5000);
  }

  disconnect(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.listeners.clear();
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

  send(data: Record<string, unknown>): void {
    // Mock: echo back
    this.emit("message", data);
  }
}

export { MockWebSocketService };
