from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from sqlalchemy.orm import Session
from typing import List
import json
from datetime import datetime
from app.database import get_db

router = APIRouter(tags=["websocket"])


class ConnectionManager:
    """Manages WebSocket connections for real-time updates"""
    
    def __init__(self):
        self.active_connections: List[WebSocket] = []
    
    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        print(f"Client connected. Total connections: {len(self.active_connections)}")
    
    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)
        print(f"Client disconnected. Total connections: {len(self.active_connections)}")
    
    async def send_personal_message(self, message: dict, websocket: WebSocket):
        await websocket.send_text(json.dumps(message))
    
    async def broadcast(self, message: dict):
        """Send message to all connected clients"""
        disconnected = []
        for connection in self.active_connections:
            try:
                await connection.send_text(json.dumps(message))
            except:
                disconnected.append(connection)
        
        # Remove disconnected clients
        for conn in disconnected:
            if conn in self.active_connections:
                self.active_connections.remove(conn)


manager = ConnectionManager()


@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """
    WebSocket endpoint for real-time updates to mobile app
    
    Messages sent to client:
    - {"type": "alert", "data": {...}}
    - {"type": "reading", "data": {...}}
    - {"type": "sensor_status", "data": {...}}
    """
    await manager.connect(websocket)
    
    try:
        # Send welcome message
        await manager.send_personal_message({
            "type": "connected",
            "message": "Connected to SafeHouse real-time updates",
            "timestamp": datetime.utcnow().isoformat()
        }, websocket)
        
        while True:
            # Receive messages from client (if any)
            data = await websocket.receive_text()
            
            # Echo back or handle specific commands
            message = json.loads(data)
            if message.get("type") == "ping":
                await manager.send_personal_message({
                    "type": "pong",
                    "timestamp": datetime.utcnow().isoformat()
                }, websocket)
            
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        print(f"WebSocket error: {e}")
        manager.disconnect(websocket)


async def broadcast_alert(alert_data: dict):
    """Helper function to broadcast new alerts to all connected clients"""
    await manager.broadcast({
        "type": "alert",
        "data": alert_data,
        "timestamp": datetime.utcnow().isoformat()
    })


async def broadcast_reading(reading_data: dict):
    """Helper function to broadcast new readings to all connected clients"""
    await manager.broadcast({
        "type": "reading",
        "data": reading_data,
        "timestamp": datetime.utcnow().isoformat()
    })

