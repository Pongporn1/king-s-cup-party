import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { FiveSecState, FiveSecQuestion } from "@/lib/partyGameTypes";
import { useToast } from "@/hooks/use-toast";

interface Player {
  id: string;
  name: string;
  room_id: string;
  is_host: boolean;
  player_order: number;
  points: number;
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

export function useFiveSecGame() {
  const [room, setRoom] = useState<Room | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentPlayerId, setCurrentPlayerId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<FiveSecQuestion[]>([]);
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

  // Fetch questions
  const fetchQuestions = useCallback(async () => {
    const { data, error } = await supabase
      .from("five_sec_questions")
      .select("*");

    if (error) {
      console.error("Error fetching questions:", error);
      return;
    }
    setQuestions(data || []);
  }, []);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  // Get random question
  const getRandomQuestion = useCallback(() => {
    if (questions.length === 0) return null;
    return questions[Math.floor(Math.random() * questions.length)];
  }, [questions]);

  // Get next player (round-robin)
  const getNextPlayerId = useCallback(() => {
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

    const question = getRandomQuestion();
    if (!question) {
      toast({ title: "Error", description: "No questions available" });
      return;
    }

    const nextPlayerId = getNextPlayerId();
    if (!nextPlayerId) return;

    // Get time limit from room state (default to 5 seconds)
    const timeLimit = room.game_state?.timeLimit || 5;
    const endTime = new Date(Date.now() + timeLimit * 1000).toISOString();

    const newState: FiveSecState = {
      phase: "PLAYING",
      player_id: nextPlayerId,
      topic: question.topic,
      end_time: endTime,
      votes: {},
      timeLimit: timeLimit,
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
  }, [room, players, getRandomQuestion, getNextPlayerId, toast]);

  // Player finished answering
  const finishAnswering = useCallback(async () => {
    console.log("finishAnswering called", {
      room: room?.id,
      game_state: room?.game_state,
    });
    if (!room || !room.game_state) {
      console.error("Cannot finish answering: no room or game_state");
      return;
    }

    const currentState = room.game_state as FiveSecState;
    const newState: FiveSecState = {
      ...currentState,
      phase: "JUDGING",
    };

    console.log("Updating to JUDGING phase", newState);
    const { error, data } = await supabase
      .from("rooms")
      .update({ game_state: newState as any })
      .eq("id", room.id)
      .select();

    if (error) {
      console.error("Error finishing answering:", error);
      toast({ title: "Error", description: "Failed to finish answering" });
    } else {
      console.log("Successfully updated to JUDGING", data);
    }
  }, [room, toast]);

  // Vote (pass or drink)
  const vote = useCallback(
    async (passed: boolean) => {
      if (!room || !room.game_state || !currentPlayerId) return;

      const currentState = room.game_state as FiveSecState;

      // Don't allow voting for yourself
      if (currentPlayerId === currentState.player_id) return;

      const newVotes = {
        ...currentState.votes,
        [currentPlayerId]: passed,
      };

      const newState: FiveSecState = {
        ...currentState,
        votes: newVotes,
      };

      const { error } = await supabase
        .from("rooms")
        .update({ game_state: newState as any })
        .eq("id", room.id);

      if (error) {
        console.error("Error voting:", error);
        toast({ title: "Error", description: "Failed to vote" });
      }
    },
    [room, currentPlayerId, toast]
  );

  // Create room
  const createRoom = useCallback(
    async (hostName: string, timeLimit: number = 5) => {
      setIsLoading(true);
      try {
        const code = Math.random().toString(36).substring(2, 8).toUpperCase();

        const { data: roomData, error: roomError } = await supabase
          .from("rooms")
          .insert({
            code,
            host_name: hostName,
            game_type: "fivesec",
            game_started: false,
            game_state: { timeLimit },
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
            points: 0,
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
          .eq("game_type", "fivesec")
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
        if (!existingPlayer) {
          existingPlayer = (existingPlayers || []).find(
            (p: any) => p.name === playerName
          );
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
              points: 0,
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
      .channel(`fivesec-room-${room.id}`)
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
      .channel(`fivesec-players-${room.id}`)
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
    finishAnswering,
    vote,
    leaveRoom,
  };
}
