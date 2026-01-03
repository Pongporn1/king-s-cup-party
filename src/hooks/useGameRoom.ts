import { useState, useEffect, useCallback } from "react";
import socketClient from "@/lib/socketClient";
import {
  createDeck,
  shuffleDeck,
  generateRoomCode,
  PlayingCard,
} from "@/lib/cardRules";
import { useToast } from "@/hooks/use-toast";
import { cleanupOnCreate } from "@/lib/roomCleanup";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

interface Room {
  id: string;
  code: string;
  host_name: string;
  is_active: boolean;
  deck: PlayingCard[];
  current_card: PlayingCard | null;
  cards_remaining: number;
  game_started: boolean;
}

interface Player {
  id: string;
  room_id: string;
  name: string;
  is_host: boolean;
  is_active: boolean;
  avatar?: number;
}

const TOTAL_AVATARS = 11;

function getRandomAvatar(usedAvatars: number[]): number {
  const availableAvatars = Array.from({ length: TOTAL_AVATARS }, (_, i) => i + 1).filter(
    (num) => !usedAvatars.includes(num)
  );
  if (availableAvatars.length === 0) {
    return Math.floor(Math.random() * TOTAL_AVATARS) + 1;
  }
  return availableAvatars[Math.floor(Math.random() * availableAvatars.length)];
}

export function useGameRoom() {
  const [room, setRoom] = useState<Room | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentPlayerId, setCurrentPlayerId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Leave room on page close
  useEffect(() => {
    const handleBeforeUnload = async () => {
      if (currentPlayerId && room) {
        await fetch(`${API_URL}/api/players/${currentPlayerId}`, { method: "DELETE" });
        const res = await fetch(`${API_URL}/api/rooms/${room.id}/players`);
        const remaining = await res.json();
        if (!remaining || remaining.length === 0) {
          await fetch(`${API_URL}/api/rooms/${room.id}`, { method: "DELETE" });
        }
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [currentPlayerId, room]);

  // Subscribe to Socket.IO events
  useEffect(() => {
    if (!room?.code) return;
    socketClient.joinRoom(room.code, currentPlayerId || "");

    const unsubRoom = socketClient.on("room-changed", (data: any) => {
      setRoom((prev) =>
        prev ? {
          ...prev,
          deck: data.deck ? (typeof data.deck === "string" ? JSON.parse(data.deck) : data.deck) : prev.deck,
          current_card: data.current_card !== undefined ? (typeof data.current_card === "string" ? JSON.parse(data.current_card) : data.current_card) : prev.current_card,
          cards_remaining: data.cards_remaining ?? prev.cards_remaining,
          game_started: data.game_started ?? prev.game_started,
          is_active: data.is_active ?? prev.is_active,
        } : null
      );
    });

    const unsubPlayerJoined = socketClient.on("player-joined", (data: any) => {
      setPlayers((prev) => prev.some((p) => p.id === data.id) ? prev : [...prev, data as Player]);
    });

    const unsubPlayerLeft = socketClient.on("player-left", (data: any) => {
      setPlayers((prev) => prev.filter((p) => p.id !== data.playerId));
    });

    const unsubPlayerChanged = socketClient.on("player-changed", (data: any) => {
      setPlayers((prev) => prev.map((p) => (p.id === data.playerId ? { ...p, ...data } : p)));
    });

    const unsubRoomDeleted = socketClient.on("room-deleted", () => {
      setRoom(null);
      setPlayers([]);
      setCurrentPlayerId(null);
    });

    return () => {
      unsubRoom();
      unsubPlayerJoined();
      unsubPlayerLeft();
      unsubPlayerChanged();
      unsubRoomDeleted();
      socketClient.leaveRoom(room.code, currentPlayerId || "");
    };
  }, [room?.code, currentPlayerId]);

  const createRoom = useCallback(async (hostName: string) => {
    setIsLoading(true);
    try {
      await cleanupOnCreate();
      const code = generateRoomCode();
      const deck = shuffleDeck(createDeck());
      const roomId = crypto.randomUUID();

      const roomRes = await fetch(`${API_URL}/api/rooms`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: roomId, code, host_name: hostName, deck, cards_remaining: 52 }),
      });
      if (!roomRes.ok) throw new Error("Failed to create room");

      const playerId = crypto.randomUUID();
      const playerRes = await fetch(`${API_URL}/api/players`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: playerId, room_id: roomId, name: hostName, is_host: true, avatar: getRandomAvatar([]) }),
      });
      if (!playerRes.ok) throw new Error("Failed to create player");

      const roomData: Room = { id: roomId, code, host_name: hostName, is_active: true, deck, current_card: null, cards_remaining: 52, game_started: false };
      const playerData: Player = { id: playerId, room_id: roomId, name: hostName, is_host: true, is_active: true, avatar: 1 };

      setRoom(roomData);
      setPlayers([playerData]);
      setCurrentPlayerId(playerId);
      toast({ title: "สร้างห้องสำเร็จ! 🎉", description: `รหัสห้อง: ${code}` });
      return { ...roomData, playerId };
    } catch (error: any) {
      toast({ title: "เกิดข้อผิดพลาด", description: error.message, variant: "destructive" });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const joinRoom = useCallback(async (code: string, playerName: string, savedPlayerId?: string) => {
    setIsLoading(true);
    try {
      const roomRes = await fetch(`${API_URL}/api/rooms/${code.toUpperCase()}`);
      if (!roomRes.ok) throw new Error("ไม่พบห้อง หรือห้องถูกปิดแล้ว");
      const roomData = await roomRes.json();

      const playersRes = await fetch(`${API_URL}/api/rooms/${roomData.id}/players`);
      const existingPlayers = await playersRes.json();

      let existingPlayer = savedPlayerId ? (existingPlayers || []).find((p: any) => p.id === savedPlayerId) : null;
      if (!existingPlayer) {
        existingPlayer = (existingPlayers || []).find((p: any) => p.name === playerName);
      }

      let playerData: Player;
      if (existingPlayer) {
        playerData = existingPlayer;
      } else {
        const usedAvatars = (existingPlayers || []).map((p: Player) => p.avatar).filter(Boolean) as number[];
        const playerId = crypto.randomUUID();
        await fetch(`${API_URL}/api/players`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: playerId, room_id: roomData.id, name: playerName, is_host: false, avatar: getRandomAvatar(usedAvatars) }),
        });
        playerData = { id: playerId, room_id: roomData.id, name: playerName, is_host: false, is_active: true, avatar: getRandomAvatar(usedAvatars) };
      }

      setRoom({
        ...roomData,
        deck: typeof roomData.deck === "string" ? JSON.parse(roomData.deck) : roomData.deck || [],
        current_card: typeof roomData.current_card === "string" ? JSON.parse(roomData.current_card) : roomData.current_card,
      });
      const uniqueMap = new Map();
      for (const p of existingPlayers || []) uniqueMap.set(p.id, p);
      uniqueMap.set(playerData.id, playerData);
      setPlayers(Array.from(uniqueMap.values()));
      setCurrentPlayerId(playerData.id);
      toast({ title: "เข้าร่วมห้องสำเร็จ! 🎮", description: `ยินดีต้อนรับ ${playerName}` });
      return { room: roomData, playerId: playerData.id };
    } catch (error: any) {
      toast({ title: "เกิดข้อผิดพลาด", description: error.message, variant: "destructive" });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const startGame = useCallback(async () => {
    if (!room) return;
    const deck = shuffleDeck(createDeck());
    await fetch(`${API_URL}/api/rooms/${room.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ game_started: true, deck, cards_remaining: 52, current_card: null }),
    });
  }, [room]);

  const drawCard = useCallback(async () => {
    if (!room || room.cards_remaining === 0) return;
    const deck = [...(room.deck || [])];
    const drawnCard = deck.pop();
    if (!drawnCard) return;
    await fetch(`${API_URL}/api/rooms/${room.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ deck, current_card: drawnCard, cards_remaining: deck.length }),
    });
  }, [room]);

  const reshuffleDeck = useCallback(async () => {
    if (!room) return;
    const deck = shuffleDeck(createDeck());
    await fetch(`${API_URL}/api/rooms/${room.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ deck, cards_remaining: 52, current_card: null }),
    });
    toast({ title: "สับไพ่ใหม่แล้ว! 🎴", description: "พร้อมเล่นรอบใหม่" });
  }, [room, toast]);

  const leaveRoom = useCallback(async () => {
    if (!currentPlayerId || !room) return;
    await fetch(`${API_URL}/api/players/${currentPlayerId}`, { method: "DELETE" });
    const res = await fetch(`${API_URL}/api/rooms/${room.id}/players`);
    const remaining = await res.json();
    if (!remaining || remaining.length === 0) {
      await fetch(`${API_URL}/api/rooms/${room.id}`, { method: "DELETE" });
    }
    setRoom(null);
    setPlayers([]);
    setCurrentPlayerId(null);
  }, [currentPlayerId, room]);

  const quickStart = useCallback(async (hostName: string) => {
    setIsLoading(true);
    try {
      const code = generateRoomCode();
      const deck = shuffleDeck(createDeck());
      const roomId = crypto.randomUUID();

      await fetch(`${API_URL}/api/rooms`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: roomId, code, host_name: hostName, deck, cards_remaining: 52, game_started: true }),
      });

      const playerId = crypto.randomUUID();
      await fetch(`${API_URL}/api/players`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: playerId, room_id: roomId, name: hostName, is_host: true, avatar: 1 }),
      });

      const roomData: Room = { id: roomId, code, host_name: hostName, is_active: true, deck, current_card: null, cards_remaining: 52, game_started: true };
      setRoom(roomData);
      setPlayers([{ id: playerId, room_id: roomId, name: hostName, is_host: true, is_active: true, avatar: 1 }]);
      setCurrentPlayerId(playerId);
      toast({ title: "🚀 Quick Start!", description: `ห้อง ${code} พร้อมเล่น` });
      return roomData;
    } catch (error: any) {
      toast({ title: "เกิดข้อผิดพลาด", description: error.message, variant: "destructive" });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  return { room, players, currentPlayerId, isLoading, createRoom, joinRoom, startGame, drawCard, reshuffleDeck, leaveRoom, quickStart };
}
