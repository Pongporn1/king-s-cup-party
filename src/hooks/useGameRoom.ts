import { useState, useEffect, useCallback } from "react";
import socketClient from "@/lib/socketClient";
import { PlayingCard } from "@/lib/cardRules";
import { useToast } from "@/hooks/use-toast";
import { cleanupOnCreate } from "@/lib/roomCleanup";
import {
  createRoom as apiCreateRoom,
  getRoomByCode,
  deleteRoom,
  updateRoom,
} from "@/lib/api/roomsApi";
import {
  createPlayer as apiCreatePlayer,
  getPlayersByRoomId,
  deletePlayer,
} from "@/lib/api/playersApi";
import {
  createRoomCode,
  getRandomAvatar,
  generatePlayerId,
  removeDuplicatePlayers,
} from "@/lib/utils/roomHelpers";
import { initializeGame } from "@/lib/games/kingscup";
import {
  getUserFriendlyErrorMessage,
  logError,
} from "@/lib/utils/errorHandler";

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
        await fetch(`${API_URL}/api/players/${currentPlayerId}`, {
          method: "DELETE",
        });
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
        prev
          ? {
              ...prev,
              deck: data.deck
                ? typeof data.deck === "string"
                  ? JSON.parse(data.deck)
                  : data.deck
                : prev.deck,
              current_card:
                data.current_card !== undefined
                  ? typeof data.current_card === "string"
                    ? JSON.parse(data.current_card)
                    : data.current_card
                  : prev.current_card,
              cards_remaining: data.cards_remaining ?? prev.cards_remaining,
              game_started: data.game_started ?? prev.game_started,
              is_active: data.is_active ?? prev.is_active,
            }
          : null
      );
    });

    const unsubPlayerJoined = socketClient.on("player-joined", (data: any) => {
      setPlayers((prev) =>
        prev.some((p) => p.id === data.id) ? prev : [...prev, data as Player]
      );
    });

    const unsubPlayerLeft = socketClient.on("player-left", (data: any) => {
      setPlayers((prev) => prev.filter((p) => p.id !== data.playerId));
    });

    const unsubPlayerChanged = socketClient.on(
      "player-changed",
      (data: any) => {
        setPlayers((prev) =>
          prev.map((p) => (p.id === data.playerId ? { ...p, ...data } : p))
        );
      }
    );

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

  const createRoom = useCallback(
    async (hostName: string) => {
      setIsLoading(true);
      try {
        await cleanupOnCreate();

        // Initialize game
        const gameState = initializeGame();
        let attempts = 0;
        const maxAttempts = 5;

        while (attempts < maxAttempts) {
          attempts++;
          const code = createRoomCode();

          try {
            // Create room using API service
            const roomResult = await apiCreateRoom({
              code,
              host_name: hostName,
              game_type: "kingscup",
              deck: gameState.deck,
              cards_remaining: gameState.cardsRemaining,
            });

            // Create player using API service
            const playerId = generatePlayerId();
            await apiCreatePlayer({
              room_id: roomResult.id,
              name: hostName,
              is_host: true,
              avatar: getRandomAvatar([]),
              player_order: 0,
            });

            const roomData: Room = {
              id: roomResult.id,
              code: roomResult.code,
              host_name: hostName,
              is_active: true,
              deck: gameState.deck,
              current_card: null,
              cards_remaining: gameState.cardsRemaining,
              game_started: false,
            };

            const playerData: Player = {
              id: playerId,
              room_id: roomResult.id,
              name: hostName,
              is_host: true,
              is_active: true,
              avatar: getRandomAvatar([]),
            };

            setRoom(roomData);
            setPlayers([playerData]);
            setCurrentPlayerId(playerId);
            toast({
              title: "สร้างห้องสำเร็จ! 🎉",
              description: `รหัสห้อง: ${roomResult.code}`,
            });

            return { ...roomData, playerId };
          } catch (error: any) {
            if (
              error.errorCode === "DUPLICATE_CODE" &&
              attempts < maxAttempts
            ) {
              console.log(`🔄 Retrying... (${attempts}/${maxAttempts})`);
              continue;
            }
            throw error;
          }
        }

        throw new Error("ไม่สามารถสร้างห้องได้หลังจากพยายามหลายครั้ง");
      } catch (error: any) {
        logError("CreateRoom", error);
        const message = getUserFriendlyErrorMessage(error);
        toast({
          title: "เกิดข้อผิดพลาด",
          description: message,
          variant: "destructive",
        });
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [toast]
  );

  const joinRoom = useCallback(
    async (code: string, playerName: string, savedPlayerId?: string) => {
      setIsLoading(true);
      try {
        // Get room data using API service
        const roomData = await getRoomByCode(code.toUpperCase());
        if (!roomData) {
          throw new Error("ไม่พบห้อง หรือห้องถูกปิดแล้ว");
        }

        // Get existing players using API service
        const existingPlayers = await getPlayersByRoomId(roomData.id);

        // Check if player already exists
        let existingPlayer = savedPlayerId
          ? existingPlayers.find((p) => p.id === savedPlayerId)
          : null;
        if (!existingPlayer) {
          existingPlayer = existingPlayers.find((p) => p.name === playerName);
        }

        let playerData: Player;
        if (existingPlayer) {
          playerData = existingPlayer;
        } else {
          // Create new player using API service
          const usedAvatars = existingPlayers
            .map((p) => p.avatar)
            .filter(Boolean) as number[];
          const playerId = generatePlayerId();
          const newPlayer = await apiCreatePlayer({
            room_id: roomData.id,
            name: playerName,
            is_host: false,
            avatar: getRandomAvatar(usedAvatars),
          });
          playerData = {
            id: newPlayer.id || playerId,
            room_id: roomData.id,
            name: playerName,
            is_host: false,
            is_active: true,
            avatar: newPlayer.avatar || getRandomAvatar(usedAvatars),
          };
        }

        setRoom({
          ...roomData,
          deck:
            typeof roomData.deck === "string"
              ? JSON.parse(roomData.deck)
              : roomData.deck || [],
          current_card:
            typeof roomData.current_card === "string"
              ? JSON.parse(roomData.current_card)
              : roomData.current_card,
        });

        // Remove duplicates using utility function
        const allPlayers = removeDuplicatePlayers([
          ...existingPlayers,
          playerData,
        ]);
        setPlayers(allPlayers);
        setCurrentPlayerId(playerData.id);

        toast({
          title: "เข้าร่วมห้องสำเร็จ! 🎮",
          description: `ยินดีต้อนรับ ${playerName}`,
        });
        return { room: roomData, playerId: playerData.id };
      } catch (error: any) {
        toast({
          title: "เกิดข้อผิดพลาด",
          description: error.message,
          variant: "destructive",
        });
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [toast]
  );

  const startGame = useCallback(async () => {
    if (!room) return;
    const gameState = initializeGame();
    await updateRoom(room.id, {
      game_started: true,
      deck: gameState.deck,
      cards_remaining: gameState.cardsRemaining,
      current_card: null,
    });
  }, [room]);

  const drawCard = useCallback(async () => {
    if (!room || room.cards_remaining === 0) return;
    const deck = [...(room.deck || [])];
    const drawnCard = deck.pop();
    if (!drawnCard) return;
    await updateRoom(room.id, {
      deck,
      current_card: drawnCard,
      cards_remaining: deck.length,
    });
  }, [room]);

  const reshuffleDeck = useCallback(async () => {
    if (!room) return;
    const gameState = initializeGame();
    await updateRoom(room.id, {
      deck: gameState.deck,
      cards_remaining: gameState.cardsRemaining,
      current_card: null,
    });
    toast({ title: "สับไพ่ใหม่แล้ว! 🎴", description: "พร้อมเล่นรอบใหม่" });
  }, [room, toast]);

  const leaveRoom = useCallback(async () => {
    if (!currentPlayerId || !room) return;
    await deletePlayer(currentPlayerId);
    const remaining = await getPlayersByRoomId(room.id);
    if (!remaining || remaining.length === 0) {
      await deleteRoom(room.id);
    }
    setRoom(null);
    setPlayers([]);
    setCurrentPlayerId(null);
  }, [currentPlayerId, room]);

  const quickStart = useCallback(
    async (hostName: string) => {
      setIsLoading(true);
      try {
        const code = createRoomCode();
        const gameState = initializeGame();

        const roomResult = await apiCreateRoom({
          code,
          host_name: hostName,
          game_type: "kingscup",
          deck: gameState.deck,
          cards_remaining: gameState.cardsRemaining,
          game_started: true,
        });

        const playerId = generatePlayerId();
        await apiCreatePlayer({
          room_id: roomResult.id,
          name: hostName,
          is_host: true,
          avatar: 1,
          player_order: 0,
        });

        const roomData: Room = {
          id: roomResult.id,
          code: roomResult.code,
          host_name: hostName,
          is_active: true,
          deck: gameState.deck,
          current_card: null,
          cards_remaining: gameState.cardsRemaining,
          game_started: true,
        };
        setRoom(roomData);
        setPlayers([
          {
            id: playerId,
            room_id: roomResult.id,
            name: hostName,
            is_host: true,
            is_active: true,
            avatar: 1,
          },
        ]);
        setCurrentPlayerId(playerId);
        toast({
          title: "🚀 Quick Start!",
          description: `ห้อง ${code} พร้อมเล่น`,
        });
        return roomData;
      } catch (error: any) {
        toast({
          title: "เกิดข้อผิดพลาด",
          description: error.message,
          variant: "destructive",
        });
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [toast]
  );

  return {
    room,
    players,
    currentPlayerId,
    isLoading,
    createRoom,
    joinRoom,
    startGame,
    drawCard,
    reshuffleDeck,
    leaveRoom,
    quickStart,
  };
}
