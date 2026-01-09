/* eslint-disable @typescript-eslint/no-explicit-any */
// Socket.IO Client for realtime communication (replaces Supabase Realtime)
import { io, Socket } from "socket.io-client";
import { API_CONFIG } from "@/lib/api/config";

class SocketClient {
  private socket: Socket | null = null;
  private listeners: Map<string, Set<(data: any) => void>> = new Map();
  private currentRoom: string | null = null;

  connect(): Socket {
    if (this.socket?.connected) return this.socket;

    this.socket = io(API_CONFIG.BASE_URL, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    this.socket.on("connect", () => {
      console.log("Socket.IO connected:", this.socket?.id);
      if (this.currentRoom) {
        this.socket?.emit("join-room", {
          roomCode: this.currentRoom,
          playerId: "",
        });
      }
    });

    this.socket.on("disconnect", (reason) => {
      console.log("Socket.IO disconnected:", reason);
    });

    // Forward events to listeners
    [
      "room-changed",
      "player-joined",
      "player-left",
      "player-changed",
      "room-deleted",
      "game-action",
    ].forEach((event) => {
      this.socket?.on(event, (data: any) => {
        const callbacks = this.listeners.get(event);
        callbacks?.forEach((cb) => cb(data));
      });
    });

    return this.socket;
  }

  disconnect(): void {
    if (this.currentRoom) {
      this.socket?.emit("leave-room", {
        roomCode: this.currentRoom,
        playerId: "",
      });
    }
    this.socket?.disconnect();
    this.socket = null;
    this.currentRoom = null;
  }

  joinRoom(roomCode: string, playerId: string = ""): void {
    this.connect();
    if (this.currentRoom && this.currentRoom !== roomCode) {
      this.socket?.emit("leave-room", { roomCode: this.currentRoom, playerId });
    }
    this.currentRoom = roomCode;
    this.socket?.emit("join-room", { roomCode, playerId });
  }

  leaveRoom(roomCode: string, playerId: string = ""): void {
    this.socket?.emit("leave-room", { roomCode, playerId });
    if (this.currentRoom === roomCode) {
      this.currentRoom = null;
    }
  }

  emitRoomUpdate(roomCode: string, update: any): void {
    this.socket?.emit("room-update", { roomCode, update });
  }

  emitPlayerUpdate(roomCode: string, playerId: string, update: any): void {
    this.socket?.emit("player-update", { roomCode, playerId, update });
  }

  emitGameAction(roomCode: string, action: string, payload: any): void {
    this.socket?.emit("game-action", { roomCode, action, payload });
  }

  on(event: string, callback: (data: any) => void): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);

    return () => {
      this.listeners.get(event)?.delete(callback);
    };
  }

  off(event: string, callback?: (data: any) => void): void {
    if (callback) {
      this.listeners.get(event)?.delete(callback);
    } else {
      this.listeners.delete(event);
    }
  }

  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  getSocket(): Socket | null {
    return this.socket;
  }
}

export const socketClient = new SocketClient();
export default socketClient;
