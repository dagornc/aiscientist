"""WebSocket manager for real-time pipeline updates."""

from typing import Dict, List
from fastapi import WebSocket


class ConnectionManager:
    """Manages active WebSocket connections for pipeline runs."""
    
    def __init__(self) -> None:
        # Dictionary mapping pipeline run IDs to lists of connected WebSockets
        self.active_connections: Dict[str, List[WebSocket]] = {}
    
    async def connect(self, run_id: str, websocket: WebSocket) -> None:
        """Add a WebSocket connection for a pipeline run."""
        await websocket.accept()
        
        if run_id not in self.active_connections:
            self.active_connections[run_id] = []
        
        self.active_connections[run_id].append(websocket)
    
    def disconnect(self, run_id: str, websocket: WebSocket) -> None:
        """Remove a WebSocket connection for a pipeline run."""
        if run_id in self.active_connections:
            if websocket in self.active_connections[run_id]:
                self.active_connections[run_id].remove(websocket)
                
                # Clean up the run_id key if no connections remain
                if len(self.active_connections[run_id]) == 0:
                    del self.active_connections[run_id]
    
    async def broadcast(self, run_id: str, message: dict) -> None:
        """Send a message to all WebSocket connections for a pipeline run."""
        if run_id in self.active_connections:
            disconnected_websockets = []
            
            for websocket in self.active_connections[run_id]:
                try:
                    await websocket.send_json(message)
                except Exception:
                    # Mark for disconnection if sending fails
                    disconnected_websockets.append(websocket)
            
            # Remove all disconnected websockets
            for websocket in disconnected_websockets:
                self.disconnect(run_id, websocket)


# Global instance of the connection manager
manager = ConnectionManager()