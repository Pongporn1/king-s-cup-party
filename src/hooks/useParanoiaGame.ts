import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ParanoiaState, ParanoiaQuestion } from "@/lib/partyGameTypes";
import { useToast } from "@/hooks/use-toast";

interface Player {
  id: string;
  name: string;
  room_id: string;
  is_host: boolean;
  player_order: number;
}

interface Room {
  id: string;
  code: string;
  host_name: string;
  game_type: string;
  game_started: boolean;
  game_state: any;
  current_player_index: number;
}

export function useParanoiaGame() {
  const [room, setRoom] = useState<Room | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentPlayerId, setCurrentPlayerId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<ParanoiaQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Clean up when leaving page
  useEffect(() => {
    const handleBeforeUnload = async () => {
      if (currentPlayerId && room) {
        await supabase.from("players").delete().eq("id", currentPlayerId);

        const { data: remainingPlayers } = await supabase
          .from("players")
          .select("id")
          .eq("room_id", room.id);

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

  // Fetch paranoia questions - only custom questions (written by user)
  const fetchQuestions = useCallback(async () => {
    const { data, error } = await supabase
      .from("paranoia_questions")
      .select("*")
      .eq("is_default", false);

    if (error) {
      console.error("Error fetching questions:", error);
      return;
    }
    setQuestions(data || []);
  }, []);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  // Get random question (excluding already used ones)
  const getRandomQuestion = useCallback(
    (usedQuestionIds: number[] = []) => {
      if (questions.length === 0) return null;

      // Filter out used questions
      const availableQuestions = questions.filter(
        (q) => !usedQuestionIds.includes(q.id)
      );

      // If all questions used, reset and use all questions
      if (availableQuestions.length === 0) {
        return questions[Math.floor(Math.random() * questions.length)];
      }

      return availableQuestions[
        Math.floor(Math.random() * availableQuestions.length)
      ];
    },
    [questions]
  );

  // Get next asker (round-robin)
  const getNextAskerId = useCallback(() => {
    if (players.length === 0) return null;
    const currentIndex = room?.current_player_index || 0;
    const nextIndex = (currentIndex + 1) % players.length;
    const sortedPlayers = [...players].sort(
      (a, b) => a.player_order - b.player_order
    );
    return sortedPlayers[nextIndex]?.id || null;
  }, [players, room?.current_player_index]);

  // Start new round
  const startRound = useCallback(async () => {
    if (!room) return;

    // Get used question IDs from current game state
    const currentState = room.game_state as ParanoiaState | null;
    const usedQuestionIds = currentState?.used_question_ids || [];

    const question = getRandomQuestion(usedQuestionIds);
    if (!question) {
      toast({ title: "Error", description: "No questions available" });
      return;
    }

    const nextAskerId = getNextAskerId();
    if (!nextAskerId) return;

    // Add current question ID to used list
    const newUsedQuestionIds = [...usedQuestionIds, question.id];

    const newState: ParanoiaState = {
      phase: "ASKING",
      asker_id: nextAskerId,
      victim_id: null,
      question: question.question,
      question_id: question.id,
      is_revealed: false,
      used_question_ids: newUsedQuestionIds,
    };

    const { error } = await supabase
      .from("rooms")
      .update({
        game_state: newState as any,
        current_player_index: (room.current_player_index + 1) % players.length,
      })
      .eq("id", room.id);

    if (error) {
      console.error("Error starting round:", error);
      toast({ title: "Error", description: "Failed to start round" });
    }
  }, [room, players, getRandomQuestion, getNextAskerId, toast]);

  // Select victim
  const selectVictim = useCallback(
    async (victimId: string) => {
      if (!room || !room.game_state) {
        console.error("❌ Cannot select victim: No room or game state");
        toast({
          title: "Error",
          description: "ไม่มีห้องหรือเกมยังไม่เริ่ม",
          variant: "destructive",
        });
        return;
      }

      console.log("🎯 Selecting victim:", victimId);

      const currentState = room.game_state as ParanoiaState;

      if (currentState.phase !== "ASKING") {
        console.error(
          "❌ Cannot select victim: Wrong phase",
          currentState.phase
        );
        toast({
          title: "Error",
          description: "ไม่ใช่ช่วงเวลาเลือกเหยื่อ",
          variant: "destructive",
        });
        return;
      }

      const newState: ParanoiaState = {
        ...currentState,
        phase: "REVEALING",
        victim_id: victimId,
      };

      console.log("💾 Updating game state to REVEALING with victim:", victimId);

      const { error } = await supabase
        .from("rooms")
        .update({ game_state: newState as any })
        .eq("id", room.id);

      if (error) {
        console.error("❌ Error selecting victim:", error);
        toast({
          title: "Error",
          description: `Failed to select victim: ${error.message}`,
          variant: "destructive",
        });
      } else {
        console.log("✅ Victim selected successfully");
      }
    },
    [room, toast]
  );

  // Reveal question (victim drinks)
  const revealQuestion = useCallback(async () => {
    if (!room || !room.game_state) return;

    const currentState = room.game_state as ParanoiaState;
    const newState: ParanoiaState = {
      ...currentState,
      is_revealed: true,
    };

    const { error } = await supabase
      .from("rooms")
      .update({ game_state: newState as any })
      .eq("id", room.id);

    if (error) {
      console.error("Error revealing question:", error);
      toast({ title: "Error", description: "Failed to reveal question" });
    }
  }, [room, toast]);

  // Skip question (no reveal)
  const skipQuestion = useCallback(async () => {
    await startRound();
  }, [startRound]);

  // Create room
  const createRoom = useCallback(
    async (hostName: string) => {
      setIsLoading(true);
      try {
        const code = Math.random().toString(36).substring(2, 8).toUpperCase();

        const { data: roomData, error: roomError } = await supabase
          .from("rooms")
          .insert({
            code,
            host_name: hostName,
            game_type: "paranoia",
            game_started: false,
            game_state: null,
            current_player_index: 0,
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
            player_order: 0,
          })
          .select()
          .single();

        if (playerError) throw playerError;

        setRoom(roomData);
        setCurrentPlayerId(playerData.id);
        setPlayers([playerData]);

        // Return room code with playerId for session recovery
        return { code: roomData.code, playerId: playerData.id };
      } catch (error) {
        console.error("Error creating room:", error);
        toast({ title: "Error", description: "Failed to create room" });
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [toast]
  );

  // Join room
  const joinRoom = useCallback(
    async (code: string, playerName: string, savedPlayerId?: string) => {
      setIsLoading(true);
      try {
        const { data: roomData, error: roomError } = await supabase
          .from("rooms")
          .select("*")
          .eq("code", code.toUpperCase())
          .eq("game_type", "paranoia")
          .single();

        if (roomError) throw roomError;

        const { data: existingPlayers } = await supabase
          .from("players")
          .select("*")
          .eq("room_id", roomData.id);

        // Check if player with same ID already exists (session recovery with ID)
        // Then fall back to name check for backward compatibility
        let existingPlayer = savedPlayerId
          ? (existingPlayers || []).find((p: any) => p.id === savedPlayerId)
          : null;

        // If not found by ID, try by name (for users without saved ID)
        // This also prevents duplicate names in the same room
        if (!existingPlayer) {
          const playersWithSameName = (existingPlayers || []).filter(
            (p: any) => p.name === playerName
          );
          if (playersWithSameName.length > 0) {
            existingPlayer = playersWithSameName[0];
            console.log(
              "Found player with same name, reusing:",
              existingPlayer.id
            );

            // Clean up duplicates
            if (playersWithSameName.length > 1) {
              const duplicateIds = playersWithSameName
                .slice(1)
                .map((p: any) => p.id);
              await supabase.from("players").delete().in("id", duplicateIds);
            }
          }
        }

        let playerData;

        if (existingPlayer) {
          // Rejoin as existing player
          playerData = existingPlayer;
          console.log("Session recovery: found existing player", playerData.id);
        } else {
          const { data: newPlayerData, error: playerError } = await supabase
            .from("players")
            .insert({
              room_id: roomData.id,
              name: playerName,
              is_host: false,
              player_order: existingPlayers?.length || 0,
            })
            .select()
            .single();

          if (playerError) throw playerError;
          playerData = newPlayerData;
        }

        setRoom(roomData);
        setCurrentPlayerId(playerData.id);

        // Deduplicate players
        const uniquePlayersMap = new Map();
        for (const p of existingPlayers || []) {
          uniquePlayersMap.set(p.id, p);
        }
        if (!uniquePlayersMap.has(playerData.id)) {
          uniquePlayersMap.set(playerData.id, playerData);
        }
        setPlayers(Array.from(uniquePlayersMap.values()));

        // Return room data with playerId for session recovery
        return { room: roomData, playerId: playerData.id };
      } catch (error) {
        console.error("Error joining room:", error);
        toast({ title: "Error", description: "Failed to join room" });
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [toast]
  );

  // Start game
  const startGame = useCallback(async () => {
    if (!room) return;

    const { error } = await supabase
      .from("rooms")
      .update({ game_started: true })
      .eq("id", room.id);

    if (error) {
      console.error("Error starting game:", error);
      toast({ title: "Error", description: "Failed to start game" });
      return;
    }

    await startRound();
  }, [room, startRound, toast]);

  // Leave room
  const leaveRoom = useCallback(async () => {
    if (!currentPlayerId) return;

    await supabase.from("players").delete().eq("id", currentPlayerId);

    setRoom(null);
    setCurrentPlayerId(null);
    setPlayers([]);
  }, [currentPlayerId]);

  // Subscribe to realtime updates
  useEffect(() => {
    if (!room) return;

    const roomChannel = supabase
      .channel(`paranoia-room-${room.id}`)
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
            setRoom(payload.new as Room);
          }
        }
      )
      .subscribe();

    const playersChannel = supabase
      .channel(`paranoia-players-${room.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "players",
          filter: `room_id=eq.${room.id}`,
        },
        async () => {
          const { data } = await supabase
            .from("players")
            .select("*")
            .eq("room_id", room.id)
            .order("player_order");
          setPlayers(data || []);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(roomChannel);
      supabase.removeChannel(playersChannel);
    };
  }, [room?.id]);

  return {
    room,
    players,
    currentPlayerId,
    isLoading,
    createRoom,
    joinRoom,
    startGame,
    startRound,
    selectVictim,
    revealQuestion,
    skipQuestion,
    leaveRoom,
  };
}
