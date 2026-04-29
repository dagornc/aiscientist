"""WebSocket routes for real-time pipeline updates."""

from __future__ import annotations

from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.api.ws_manager import manager

ws_router = APIRouter(prefix="/pipeline", tags=["websocket"])


@ws_router.websocket("/ws/{run_id}")
async def websocket_endpoint(websocket: WebSocket, run_id: str):
    """WebSocket endpoint for real-time pipeline updates.
    
    Args:
        websocket: The WebSocket connection
        run_id: The pipeline run ID to subscribe to
    """
    # Connect the WebSocket for this run_id
    await manager.connect(run_id, websocket)
    
    try:
        # Listen for messages from the client (for keepalive/ping-pong)
        while True:
            try:
                # Receive message from client (we expect client to send keepalive messages)  
                data = await websocket.receive_text()
                
                # Simple echo keepalive - send back a pong
                await websocket.send_json({"type": "pong", "run_id": run_id})
                
            except WebSocketDisconnect:
                break
                
    except Exception as exc:
        # Handle disconnections and exceptions
        pass
        
    finally:
        # Ensure the connection is cleaned up when the WebSocket closes
        manager.disconnect(run_id, websocket)