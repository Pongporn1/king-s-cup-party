/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  UndercoverPlayer,
  GamePhase,
  VocabularyPair,
  assignRoles,
  getRandomVocabulary,
  checkGameResult,
  getEliminatedPlayer,
  getCategories,
} from "@/lib/undercoverRules";
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

export interface UndercoverRoom {
  id: string;
  code: string;
  host_name: string;
  is_active: boolean;
  game_phase: GamePhase;
  current_turn_index: number;
  vocabulary: VocabularyPair | null;
  round: number;
  timer_seconds: number;
  include_mr_white: boolean;
  selected_category: string;
}

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

export function useUndercoverRoom() {
  const [room, setRoom] = useState<UndercoverRoom | null>(null);
  const [players, setPlayers] = useState<UndercoverPlayer[]>([]);
  const [currentPlayerId, setCurrentPlayerId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // ออกจากห้องเมื่อปิดหน้าเว็บ
  useEffect(() => {
    const handleBeforeUnload = async () => {
      if (currentPlayerId && room) {
        await supabase.from("players").delete().eq("id", currentPlayerId);
        const { data: remainingPlayers } = await supabase
          .from("players")
          .select("id")
          .eq("room_id", room.id)
          .eq("is_active", true);

        if (!remainingPlayers || remainingPlayers.length === 0) {
          await supabase.from("rooms").delete().eq("id", room.id);
        }
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [currentPlayerId, room]);

  // Subscribe to room and player changes
  useEffect(() => {
    if (!room?.id) return;

    const channel = supabase
      .channel(`undercover-room-${room.id}`)
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
                    game_phase: newData.game_phase || "WAITING",
                    current_turn_index: newData.current_player_index || 0,
                    is_active: newData.is_active,
                    vocabulary: newData.current_card || null,
                    round: newData.cards_remaining || 1,
                    timer_seconds: newData.timer_seconds || 30,
                    include_mr_white: newData.include_mr_white || false,
                    selected_category: newData.selected_category || "ทั้งหมด",
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
                id: newPlayer.id,
                name: newPlayer.name,
                avatar: newPlayer.avatar,
                role: newPlayer.role || "CIVILIAN",
                word: newPlayer.word || "",
                is_alive: newPlayer.is_alive ?? true,
                vote_count: newPlayer.vote_count || 0,
                has_voted: newPlayer.has_voted || false,
                voted_for: newPlayer.voted_for,
                is_host: newPlayer.is_host,
              } as UndercoverPlayer,
            ]);
            toast({
              title: "👋 ผู้เล่นใหม่เข้ามา",
              description: `${newPlayer.name} เข้าห้องแล้ว`,
              duration: 3000,
            });
          } else if (payload.eventType === "DELETE") {
            const oldPlayer = payload.old as any;
            setPlayers((prev) => {
              const leavingPlayer = prev.find((p) => p.id === oldPlayer.id);
              if (leavingPlayer) {
                toast({
                  title: "ผู้เล่นออกห้อง",
                  description: `${leavingPlayer.name} ออกไปแล้ว`,
                  duration: 3000,
                });
              }
              return prev.filter((p) => p.id !== oldPlayer.id);
            });
          } else if (payload.eventType === "UPDATE") {
            const updatedPlayer = payload.new as any;
            setPlayers((prev) =>
              prev.map((p) =>
                p.id === updatedPlayer.id
                  ? {
                      ...p,
                      role: updatedPlayer.role || p.role,
                      word: updatedPlayer.word || p.word,
                      is_alive: updatedPlayer.is_alive ?? p.is_alive,
                      vote_count: updatedPlayer.vote_count ?? p.vote_count,
                      has_voted: updatedPlayer.has_voted ?? p.has_voted,
                      voted_for: updatedPlayer.voted_for,
                    }
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
  }, [room?.id, toast]);

  const createRoom = useCallback(
    async (hostName: string) => {
      setIsLoading(true);
      try {
        const code = generateRoomCode();
        const hostAvatar = getRandomAvatar([]);

        const { data: roomData, error: roomError } = await supabase
          .from("rooms")
          .insert({
            code,
            host_name: hostName,
            game_type: "undercover",
            game_phase: "WAITING",
            cards_remaining: 1, // round number
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
            avatar: hostAvatar,
            is_alive: true,
            vote_count: 0,
            has_voted: false,
          })
          .select()
          .single();

        if (playerError) throw playerError;

        setRoom({
          id: roomData.id,
          code: roomData.code,
          host_name: roomData.host_name,
          is_active: roomData.is_active,
          game_phase: "WAITING",
          current_turn_index: 0,
          vocabulary: null,
          round: 1,
          timer_seconds: 30,
          include_mr_white: false,
          selected_category: "ทั้งหมด",
        });
        setPlayers([
          {
            id: playerData.id,
            name: playerData.name,
            avatar: playerData.avatar,
            role: "CIVILIAN",
            word: "",
            is_alive: true,
            vote_count: 0,
            has_voted: false,
            is_host: true,
          },
        ]);
        setCurrentPlayerId(playerData.id);

        toast({
          title: "สร้างห้องสำเร็จ!",
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
    async (roomCode: string, playerName: string) => {
      setIsLoading(true);
      try {
        const { data: roomData, error: roomError } = await supabase
          .from("rooms")
          .select("*")
          .eq("code", roomCode.toUpperCase())
          .eq("is_active", true)
          .single();

        if (roomError) throw new Error("ไม่พบห้องนี้");
        if (roomData.game_phase !== "WAITING") {
          throw new Error("เกมเริ่มไปแล้ว ไม่สามารถเข้าร่วมได้");
        }

        const { data: existingPlayers } = await supabase
          .from("players")
          .select("*")
          .eq("room_id", roomData.id)
          .eq("is_active", true);

        const usedAvatars = (existingPlayers || []).map((p: any) => p.avatar);
        const playerAvatar = getRandomAvatar(usedAvatars);

        const { data: playerData, error: playerError } = await supabase
          .from("players")
          .insert({
            room_id: roomData.id,
            name: playerName,
            is_host: false,
            avatar: playerAvatar,
            is_alive: true,
            vote_count: 0,
            has_voted: false,
          })
          .select()
          .single();

        if (playerError) throw playerError;

        setRoom({
          id: roomData.id,
          code: roomData.code,
          host_name: roomData.host_name,
          is_active: roomData.is_active,
          game_phase: "WAITING",
          current_turn_index: 0,
          vocabulary: null,
          round: 1,
          timer_seconds: 30,
          include_mr_white: false,
          selected_category: "ทั้งหมด",
        });

        const allPlayers = [...(existingPlayers || []), playerData].map(
          (p: any) => ({
            id: p.id,
            name: p.name,
            avatar: p.avatar,
            role: "CIVILIAN" as const,
            word: "",
            is_alive: true,
            vote_count: 0,
            has_voted: false,
            is_host: p.is_host,
          })
        );

        setPlayers(allPlayers);
        setCurrentPlayerId(playerData.id);

        toast({
          title: "เข้าร่วมห้องสำเร็จ!",
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

  // เริ่มเกม - แจกบทบาท
  const startGame = useCallback(
    async (category: string = "ทั้งหมด", includeMrWhite: boolean = false) => {
      if (!room || players.length < 4) {
        toast({
          title: "ไม่สามารถเริ่มเกมได้",
          description: "ต้องมีผู้เล่นอย่างน้อย 4 คน",
          variant: "destructive",
        });
        return;
      }

      // สุ่มคำศัพท์
      const vocabulary = getRandomVocabulary(category);

      // กำหนดบทบาท
      const assignedPlayers = assignRoles(
        players.map((p) => ({
          id: p.id,
          name: p.name,
          avatar: p.avatar,
          is_host: p.is_host,
        })),
        vocabulary,
        includeMrWhite
      );

      // อัพเดท players ใน database
      for (const player of assignedPlayers) {
        await supabase
          .from("players")
          .update({
            role: player.role,
            word: player.word,
            is_alive: true,
            vote_count: 0,
            has_voted: false,
          })
          .eq("id", player.id);
      }

      // อัพเดท room
      await supabase
        .from("rooms")
        .update({
          game_phase: "REVEAL_WORD",
          current_card: vocabulary as any,
          current_player_index: 0,
          cards_remaining: 1,
          game_started: true,
        })
        .eq("id", room.id);

      setPlayers(assignedPlayers);

      toast({
        title: "🎮 เกมเริ่มแล้ว!",
        description: "แตะค้างเพื่อดูคำศัพท์ของคุณ",
      });
    },
    [room, players, toast]
  );

  // เปลี่ยน phase เป็น DESCRIBE
  const startDescribePhase = useCallback(async () => {
    if (!room) return;

    await supabase
      .from("rooms")
      .update({
        game_phase: "DESCRIBE",
        current_player_index: 0,
      })
      .eq("id", room.id);
  }, [room]);

  // เปลี่ยนตาพูด
  const nextTurn = useCallback(async () => {
    if (!room) return;

    const alivePlayers = players.filter((p) => p.is_alive);
    const nextIndex = (room.current_turn_index + 1) % alivePlayers.length;

    await supabase
      .from("rooms")
      .update({
        current_player_index: nextIndex,
      })
      .eq("id", room.id);
  }, [room, players]);

  // เริ่มโหวต
  const startVoting = useCallback(async () => {
    if (!room) return;

    // รีเซ็ตโหวต
    for (const player of players) {
      await supabase
        .from("players")
        .update({
          vote_count: 0,
          has_voted: false,
          voted_for: null,
        })
        .eq("id", player.id);
    }

    await supabase
      .from("rooms")
      .update({
        game_phase: "VOTING",
      })
      .eq("id", room.id);
  }, [room, players]);

  // จบการโหวต
  const endVoting = useCallback(async () => {
    if (!room) return;

    // Refetch players to get latest vote counts
    const { data: latestPlayers } = await supabase
      .from("players")
      .select("*")
      .eq("room_id", room.id);

    if (!latestPlayers) return;

    const playersWithVotes = latestPlayers.map((p: any) => ({
      id: p.id,
      name: p.name,
      avatar: p.avatar,
      role: p.role as any,
      word: p.word || "",
      is_alive: p.is_alive,
      vote_count: p.vote_count || 0,
      has_voted: p.has_voted || false,
      voted_for: p.voted_for,
      is_host: p.is_host,
    }));

    const eliminated = getEliminatedPlayer(playersWithVotes);

    if (eliminated) {
      await supabase
        .from("players")
        .update({ is_alive: false })
        .eq("id", eliminated.id);

      toast({
        title: `😵 ${eliminated.name} ถูกโหวตออก!`,
        description:
          eliminated.role === "UNDERCOVER"
            ? "เป็นสายลับ!"
            : eliminated.role === "MR_WHITE"
            ? "เป็นคนบ้า! 🤪"
            : "เป็นพลเมืองดี 😢",
      });
    }

    await supabase
      .from("rooms")
      .update({
        game_phase: "VOTE_RESULT",
      })
      .eq("id", room.id);
  }, [room, toast]);

  // โหวตผู้เล่น
  const votePlayer = useCallback(
    async (targetPlayerId: string) => {
      if (!currentPlayerId || !room) return;

      const currentPlayer = players.find((p) => p.id === currentPlayerId);
      if (!currentPlayer || currentPlayer.has_voted || !currentPlayer.is_alive)
        return;

      // อัพเดทว่าโหวตแล้ว
      await supabase
        .from("players")
        .update({
          has_voted: true,
          voted_for: targetPlayerId,
        })
        .eq("id", currentPlayerId);

      // เพิ่มคะแนนโหวตให้คนถูกโหวต
      const targetPlayer = players.find((p) => p.id === targetPlayerId);
      if (targetPlayer) {
        await supabase
          .from("players")
          .update({
            vote_count: (targetPlayer.vote_count || 0) + 1,
          })
          .eq("id", targetPlayerId);
      }

      toast({
        title: "✅ โหวตแล้ว",
        description: `คุณโหวตให้ ${targetPlayer?.name}`,
      });

      // เช็คว่าโหวตครบทุกคนยัง
      const alivePlayers = players.filter((p) => p.is_alive);
      const votedCount = alivePlayers.filter((p) => p.has_voted).length + 1; // +1 สำหรับตัวเอง

      if (votedCount >= alivePlayers.length) {
        // โหวตครบแล้ว
        await endVoting();
      }
    },
    [currentPlayerId, players, room, toast, endVoting]
  );

  // เช็คผลเกมและเริ่มรอบใหม่
  const checkResultAndContinue = useCallback(async () => {
    if (!room) return;

    // Refetch players
    const { data: latestPlayers } = await supabase
      .from("players")
      .select("*")
      .eq("room_id", room.id);

    if (!latestPlayers) return;

    const playersData = latestPlayers.map((p: any) => ({
      id: p.id,
      name: p.name,
      avatar: p.avatar,
      role: p.role as any,
      word: p.word || "",
      is_alive: p.is_alive,
      vote_count: p.vote_count || 0,
      has_voted: p.has_voted || false,
      voted_for: p.voted_for,
      is_host: p.is_host,
    }));

    const result = checkGameResult(playersData);

    if (result.isGameOver) {
      await supabase
        .from("rooms")
        .update({
          game_phase: "FINISHED",
        })
        .eq("id", room.id);

      toast({
        title:
          result.winner === "CIVILIAN" ? "👥 พลเมืองดีชนะ!" : "สายลับชนะ!",
        description: result.reason,
      });
    } else {
      // รอบใหม่
      await supabase
        .from("rooms")
        .update({
          game_phase: "DESCRIBE",
          current_player_index: 0,
          cards_remaining: (room.round || 1) + 1,
        })
        .eq("id", room.id);

      // รีเซ็ตโหวต
      for (const player of playersData) {
        await supabase
          .from("players")
          .update({
            vote_count: 0,
            has_voted: false,
            voted_for: null,
          })
          .eq("id", player.id);
      }
    }
  }, [room, toast]);

  // เริ่มเกมใหม่
  const restartGame = useCallback(async () => {
    if (!room) return;

    // รีเซ็ต players
    for (const player of players) {
      await supabase
        .from("players")
        .update({
          role: "CIVILIAN",
          word: "",
          is_alive: true,
          vote_count: 0,
          has_voted: false,
          voted_for: null,
        })
        .eq("id", player.id);
    }

    await supabase
      .from("rooms")
      .update({
        game_phase: "WAITING",
        current_player_index: 0,
        current_card: null,
        cards_remaining: 1,
        game_started: false,
      })
      .eq("id", room.id);

    toast({
      title: "🔄 เริ่มเกมใหม่",
      description: "พร้อมเล่นรอบใหม่แล้ว!",
    });
  }, [room, players, toast]);

  // ออกจากห้อง
  const leaveRoom = useCallback(async () => {
    if (!currentPlayerId || !room) return;

    await supabase.from("players").delete().eq("id", currentPlayerId);

    const { data: remainingPlayers } = await supabase
      .from("players")
      .select("id")
      .eq("room_id", room.id)
      .eq("is_active", true);

    if (!remainingPlayers || remainingPlayers.length === 0) {
      await supabase.from("rooms").delete().eq("id", room.id);
    }

    setRoom(null);
    setPlayers([]);
    setCurrentPlayerId(null);

    toast({
      title: "👋 ออกจากห้องแล้ว",
    });
  }, [currentPlayerId, room, toast]);

  return {
    room,
    players,
    currentPlayerId,
    isLoading,
    categories: getCategories(),
    createRoom,
    joinRoom,
    startGame,
    startDescribePhase,
    nextTurn,
    startVoting,
    votePlayer,
    endVoting,
    checkResultAndContinue,
    restartGame,
    leaveRoom,
  };
}
