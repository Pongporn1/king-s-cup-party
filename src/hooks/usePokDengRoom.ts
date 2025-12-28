/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  PokDengCard,
  createDeck,
  shuffleDeck,
  calculateTotalPoints,
  compareHands,
} from "@/lib/pokDengRules";
import { useToast } from "@/hooks/use-toast";

// Generate 6-character room code
function generateRoomCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export interface PokDengRoom {
  id: string;
  code: string;
  host_name: string;
  is_active: boolean;
  deck: PokDengCard[];
  game_started: boolean;
  game_phase: "waiting" | "dealing" | "drawing" | "showdown" | "ended";
  current_player_index: number;
}

export interface PokDengPlayer {
  id: string;
  room_id: string;
  name: string;
  is_host: boolean;
  is_active: boolean;
  avatar?: number;
  cards: PokDengCard[];
  points: number;
  bet: number;
  has_drawn: boolean;
  is_dealer: boolean;
  result?: "player_win" | "dealer_win" | null;
  multiplier: number;
  player_order: number;
}

// Available avatar images
const TOTAL_AVATARS = 11;

function getRandomAvatar(usedAvatars: number[]): number {
  const availableAvatars = Array.from(
    { length: TOTAL_AVATARS },
    (_, i) => i + 1
  ).filter((num) => !usedAvatars.includes(num));

  if (availableAvatars.length === 0) {
    return Math.floor(Math.random() * TOTAL_AVATARS) + 1;
  }

  return availableAvatars[Math.floor(Math.random() * availableAvatars.length)];
}

export function usePokDengRoom() {
  const [room, setRoom] = useState<PokDengRoom | null>(null);
  const [players, setPlayers] = useState<PokDengPlayer[]>([]);
  const [currentPlayerId, setCurrentPlayerId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Subscribe to room and player changes
  useEffect(() => {
    if (!room?.id) return;

    const channel = supabase
      .channel(`pokdeng-room-${room.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "rooms",
          filter: `id=eq.${room.id}`,
        },
        (payload) => {
          if (payload.eventType === "UPDATE") {
            const newData = payload.new as any;
            setRoom((prev) =>
              prev
                ? {
                    ...prev,
                    deck: (newData.deck || []) as PokDengCard[],
                    game_started: newData.game_started,
                    game_phase: newData.game_phase || "waiting",
                    current_player_index: newData.current_player_index || 0,
                    is_active: newData.is_active,
                  }
                : null
            );
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "players",
          filter: `room_id=eq.${room.id}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            const newPlayer = payload.new as any;
            setPlayers((prev) => [
              ...prev,
              {
                ...newPlayer,
                cards: (newPlayer.cards || []) as PokDengCard[],
              } as PokDengPlayer,
            ]);
          } else if (payload.eventType === "DELETE") {
            setPlayers((prev) =>
              prev.filter((p) => p.id !== (payload.old as any).id)
            );
          } else if (payload.eventType === "UPDATE") {
            const updatedPlayer = payload.new as any;
            setPlayers((prev) =>
              prev.map((p) =>
                p.id === updatedPlayer.id
                  ? ({
                      ...updatedPlayer,
                      cards: (updatedPlayer.cards || []) as PokDengCard[],
                    } as PokDengPlayer)
                  : p
              )
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [room?.id]);

  const createRoom = useCallback(
    async (hostName: string) => {
      setIsLoading(true);
      try {
        const code = generateRoomCode();
        const deck = shuffleDeck(createDeck());
        const hostAvatar = getRandomAvatar([]);

        const { data: roomData, error: roomError } = await supabase
          .from("rooms")
          .insert({
            code,
            host_name: hostName,
            deck: deck as any,
            cards_remaining: 52,
            game_type: "pokdeng",
            game_phase: "waiting",
          })
          .select()
          .single();

        if (roomError) throw roomError;

        const { data: playerData, error: playerError } = await supabase
          .from("players")
          .insert({
            room_id: roomData.id,
            name: hostName,
            is_host: true,
            is_dealer: true, // Host เป็นเจ้ามือคนแรก
            avatar: hostAvatar,
            player_order: 0,
            cards: [] as any,
            points: 0,
            bet: 0,
            has_drawn: false,
          })
          .select()
          .single();

        if (playerError) throw playerError;

        setRoom({
          id: roomData.id,
          code: roomData.code,
          host_name: roomData.host_name,
          is_active: roomData.is_active,
          deck: roomData.deck as unknown as PokDengCard[],
          game_started: roomData.game_started,
          game_phase: (roomData.game_phase as any) || "waiting",
          current_player_index: roomData.current_player_index || 0,
        });
        setPlayers([
          {
            ...playerData,
            cards: [] as PokDengCard[],
          } as PokDengPlayer,
        ]);
        setCurrentPlayerId(playerData.id);

        toast({
          title: "สร้างห้องสำเร็จ! 🎰",
          description: `รหัสห้อง: ${code}`,
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

  const joinRoom = useCallback(
    async (code: string, playerName: string) => {
      setIsLoading(true);
      try {
        const { data: roomData, error: roomError } = await supabase
          .from("rooms")
          .select()
          .eq("code", code.toUpperCase())
          .eq("is_active", true)
          .eq("game_type", "pokdeng")
          .single();

        if (roomError || !roomData) {
          throw new Error("ไม่พบห้อง หรือห้องถูกปิดแล้ว");
        }

        if (roomData.game_started) {
          throw new Error("เกมเริ่มไปแล้ว ไม่สามารถเข้าร่วมได้");
        }

        const { data: existingPlayers } = await supabase
          .from("players")
          .select()
          .eq("room_id", roomData.id)
          .eq("is_active", true);

        if ((existingPlayers?.length || 0) >= 8) {
          throw new Error("ห้องเต็มแล้ว (สูงสุด 8 คน)");
        }

        const usedAvatars = (existingPlayers || [])
          .map((p: any) => p.avatar)
          .filter(Boolean) as number[];
        const playerAvatar = getRandomAvatar(usedAvatars);

        const { data: playerData, error: playerError } = await supabase
          .from("players")
          .insert({
            room_id: roomData.id,
            name: playerName,
            is_host: false,
            avatar: playerAvatar,
            is_dealer: false,
            player_order: existingPlayers?.length || 0,
            cards: [] as any,
            points: 0,
            bet: 0,
            has_drawn: false,
          })
          .select()
          .single();

        if (playerError) throw playerError;

        setRoom({
          id: roomData.id,
          code: roomData.code,
          host_name: roomData.host_name,
          is_active: roomData.is_active,
          deck: roomData.deck as unknown as PokDengCard[],
          game_started: roomData.game_started,
          game_phase: (roomData.game_phase as any) || "waiting",
          current_player_index: roomData.current_player_index || 0,
        });
        setPlayers(
          [...(existingPlayers || []), playerData].map((p: any) => ({
            ...p,
            cards: (p.cards || []) as PokDengCard[],
          })) as PokDengPlayer[]
        );
        setCurrentPlayerId(playerData.id);

        toast({
          title: "เข้าร่วมห้องสำเร็จ! 🎮",
          description: `ยินดีต้อนรับ ${playerName}`,
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

  // เริ่มเกม - แจกไพ่ให้ทุกคน
  const startGame = useCallback(async () => {
    if (!room || players.length < 2) return;

    const deck = shuffleDeck(createDeck());
    const newDeck = [...deck];

    // แจกไพ่ 2 ใบให้ทุกคน
    const playerUpdates = players.map((player) => {
      const cards = [newDeck.pop()!, newDeck.pop()!];
      const points = calculateTotalPoints(cards);
      return {
        id: player.id,
        cards,
        points,
        has_drawn: false,
        result: null,
        multiplier: 1,
      };
    });

    // Update room
    const { error: roomError } = await supabase
      .from("rooms")
      .update({
        game_started: true,
        deck: newDeck as any,
        game_phase: "drawing",
        current_player_index: 0,
      })
      .eq("id", room.id);

    if (roomError) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: roomError.message,
        variant: "destructive",
      });
      return;
    }

    // Update all players
    for (const update of playerUpdates) {
      await supabase
        .from("players")
        .update({
          cards: update.cards as any,
          points: update.points,
          has_drawn: update.has_drawn,
          result: update.result,
          multiplier: update.multiplier,
        })
        .eq("id", update.id);
    }

    toast({
      title: "🎴 เริ่มเกม!",
      description: "แจกไพ่เรียบร้อย",
    });
  }, [room, players, toast]);

  // จั่วไพ่
  const drawCard = useCallback(async () => {
    if (!room || !currentPlayerId) return;

    const currentPlayer = players.find((p) => p.id === currentPlayerId);
    if (
      !currentPlayer ||
      currentPlayer.has_drawn ||
      currentPlayer.cards.length >= 3
    )
      return;

    const deck = [...room.deck];
    if (deck.length === 0) return;

    const newCard = deck.pop()!;
    const newCards = [...currentPlayer.cards, newCard];
    const newPoints = calculateTotalPoints(newCards);

    // Update room deck
    await supabase
      .from("rooms")
      .update({ deck: deck as any })
      .eq("id", room.id);

    // Update player
    await supabase
      .from("players")
      .update({
        cards: newCards as any,
        points: newPoints,
        has_drawn: true,
      })
      .eq("id", currentPlayerId);

    // Move to next player or showdown
    const nonDealerPlayers = players.filter((p) => !p.is_dealer);
    const currentIndex = nonDealerPlayers.findIndex(
      (p) => p.id === currentPlayerId
    );

    if (currentIndex < nonDealerPlayers.length - 1) {
      await supabase
        .from("rooms")
        .update({ current_player_index: currentIndex + 1 })
        .eq("id", room.id);
    } else {
      // ทุกคนเล่นแล้ว ให้เจ้ามือจั่ว
      await supabase
        .from("rooms")
        .update({ game_phase: "showdown" })
        .eq("id", room.id);
    }
  }, [room, currentPlayerId, players]);

  // หยุด (ไม่จั่ว)
  const standCard = useCallback(async () => {
    if (!room || !currentPlayerId) return;

    const currentPlayer = players.find((p) => p.id === currentPlayerId);
    if (!currentPlayer || currentPlayer.has_drawn) return;

    // Update player
    await supabase
      .from("players")
      .update({ has_drawn: true })
      .eq("id", currentPlayerId);

    // Move to next player or showdown
    const nonDealerPlayers = players.filter((p) => !p.is_dealer);
    const currentIndex = nonDealerPlayers.findIndex(
      (p) => p.id === currentPlayerId
    );

    if (currentIndex < nonDealerPlayers.length - 1) {
      await supabase
        .from("rooms")
        .update({ current_player_index: currentIndex + 1 })
        .eq("id", room.id);
    } else {
      await supabase
        .from("rooms")
        .update({ game_phase: "showdown" })
        .eq("id", room.id);
    }
  }, [room, currentPlayerId, players]);

  // เจ้ามือจั่วไพ่
  const dealerDraw = useCallback(async () => {
    if (!room || !currentPlayerId) return;

    const dealer = players.find((p) => p.is_dealer);
    if (!dealer || dealer.id !== currentPlayerId) return;

    const deck = [...room.deck];
    if (deck.length === 0 || dealer.cards.length >= 3) return;

    const newCard = deck.pop()!;
    const newCards = [...dealer.cards, newCard];
    const newPoints = calculateTotalPoints(newCards);

    await supabase
      .from("rooms")
      .update({ deck: deck as any })
      .eq("id", room.id);

    await supabase
      .from("players")
      .update({
        cards: newCards as any,
        points: newPoints,
        has_drawn: true,
      })
      .eq("id", dealer.id);
  }, [room, currentPlayerId, players]);

  // เจ้ามือไม่จั่ว (หยุด)
  const dealerStand = useCallback(async () => {
    if (!room || !currentPlayerId) return;

    const dealer = players.find((p) => p.is_dealer);
    if (!dealer || dealer.id !== currentPlayerId) return;
    if (dealer.has_drawn) return;

    // Mark dealer as done without drawing
    await supabase
      .from("players")
      .update({ has_drawn: true })
      .eq("id", dealer.id);
  }, [room, currentPlayerId, players]);

  // เปิดไพ่ - คำนวณผลแพ้ชนะ
  const showdown = useCallback(async () => {
    if (!room) return;

    const dealer = players.find((p) => p.is_dealer);
    if (!dealer) return;

    // คำนวณผลสำหรับแต่ละผู้เล่น
    const updates = players.map((player) => {
      if (player.is_dealer) {
        return { id: player.id, result: null, multiplier: 1 };
      }

      // ใช้ compareHands โดยส่ง cards โดยตรง
      const comparison = compareHands(player.cards, dealer.cards);

      return {
        id: player.id,
        result:
          comparison.result === "player_win" ? "player_win" : "dealer_win",
        multiplier: comparison.playerMultiplier,
      };
    });

    // Update all players
    for (const update of updates) {
      await supabase
        .from("players")
        .update({
          result: update.result,
          multiplier: update.multiplier,
        })
        .eq("id", update.id);
    }

    await supabase
      .from("rooms")
      .update({ game_phase: "ended" })
      .eq("id", room.id);

    toast({
      title: "🎉 เปิดไพ่แล้ว!",
      description: "ดูผลลัพธ์ได้เลย",
    });
  }, [room, players, toast]);

  // เล่นรอบใหม่
  const nextRound = useCallback(async () => {
    if (!room) return;

    const deck = shuffleDeck(createDeck());
    const newDeck = [...deck];

    // หมุนเจ้ามือ
    const sortedPlayers = [...players].sort(
      (a, b) => a.player_order - b.player_order
    );
    const currentDealerIndex = sortedPlayers.findIndex((p) => p.is_dealer);
    const nextDealerIndex = (currentDealerIndex + 1) % sortedPlayers.length;

    // แจกไพ่ใหม่
    const playerUpdates = players.map((player) => {
      const cards = [newDeck.pop()!, newDeck.pop()!];
      const points = calculateTotalPoints(cards);
      const isNewDealer = player.id === sortedPlayers[nextDealerIndex].id;
      return {
        id: player.id,
        cards,
        points,
        has_drawn: false,
        result: null,
        multiplier: 1,
        is_dealer: isNewDealer,
      };
    });

    // Update room
    await supabase
      .from("rooms")
      .update({
        deck: newDeck as any,
        game_phase: "drawing",
        current_player_index: 0,
      })
      .eq("id", room.id);

    // Update all players
    for (const update of playerUpdates) {
      await supabase
        .from("players")
        .update({
          cards: update.cards as any,
          points: update.points,
          has_drawn: update.has_drawn,
          result: update.result,
          multiplier: update.multiplier,
          is_dealer: update.is_dealer,
        })
        .eq("id", update.id);
    }

    toast({
      title: "🎴 รอบใหม่!",
      description: "แจกไพ่เรียบร้อย",
    });
  }, [room, players, toast]);

  const leaveRoom = useCallback(async () => {
    if (!currentPlayerId || !room) return;

    // ลบ player ออกจากห้อง
    await supabase.from("players").delete().eq("id", currentPlayerId);

    // เช็คว่ายังมีผู้เล่นเหลืออยู่ไหม ถ้าไม่มีให้ลบห้อง
    const { data: remainingPlayers } = await supabase
      .from("players")
      .select("id")
      .eq("room_id", room.id)
      .eq("is_active", true);

    if (!remainingPlayers || remainingPlayers.length === 0) {
      // ลบห้องเมื่อไม่มีผู้เล่นเหลือ
      await supabase.from("rooms").delete().eq("id", room.id);
    }

    setRoom(null);
    setPlayers([]);
    setCurrentPlayerId(null);
  }, [currentPlayerId, room]);

  // Quick start
  const quickStart = useCallback(
    async (hostName: string) => {
      setIsLoading(true);
      try {
        const code = generateRoomCode();
        const deck = shuffleDeck(createDeck());

        const { data: roomData, error: roomError } = await supabase
          .from("rooms")
          .insert({
            code,
            host_name: hostName,
            deck: deck as any,
            cards_remaining: 52,
            game_type: "pokdeng",
            game_phase: "waiting",
            game_started: false,
          })
          .select()
          .single();

        if (roomError) throw roomError;

        const { data: playerData, error: playerError } = await supabase
          .from("players")
          .insert({
            room_id: roomData.id,
            name: hostName,
            is_host: true,
            is_dealer: true,
            player_order: 0,
            cards: [] as any,
          })
          .select()
          .single();

        if (playerError) throw playerError;

        setRoom({
          id: roomData.id,
          code: roomData.code,
          host_name: roomData.host_name,
          is_active: roomData.is_active,
          deck: roomData.deck as unknown as PokDengCard[],
          game_started: roomData.game_started,
          game_phase: (roomData.game_phase as any) || "waiting",
          current_player_index: 0,
        });
        setPlayers([
          {
            ...playerData,
            cards: [] as PokDengCard[],
          } as PokDengPlayer,
        ]);
        setCurrentPlayerId(playerData.id);

        toast({
          title: "🚀 Quick Start!",
          description: `ห้อง ${code} พร้อมแล้ว`,
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
    standCard,
    dealerDraw,
    dealerStand,
    showdown,
    nextRound,
    leaveRoom,
    quickStart,
  };
}
