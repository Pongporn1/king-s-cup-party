import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { createDeck, shuffleDeck, generateRoomCode, PlayingCard } from '@/lib/cardRules';
import { useToast } from '@/hooks/use-toast';

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
}

export function useGameRoom() {
  const [room, setRoom] = useState<Room | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentPlayerId, setCurrentPlayerId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Subscribe to room changes
  useEffect(() => {
    if (!room?.id) return;

    const channel = supabase
      .channel(`room-${room.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'rooms',
          filter: `id=eq.${room.id}`
        },
        (payload) => {
          if (payload.eventType === 'UPDATE') {
            const newData = payload.new as any;
            setRoom(prev => prev ? {
              ...prev,
              deck: newData.deck || [],
              current_card: newData.current_card,
              cards_remaining: newData.cards_remaining,
              game_started: newData.game_started,
              is_active: newData.is_active
            } : null);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'players',
          filter: `room_id=eq.${room.id}`
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setPlayers(prev => [...prev, payload.new as Player]);
          } else if (payload.eventType === 'DELETE') {
            setPlayers(prev => prev.filter(p => p.id !== (payload.old as Player).id));
          } else if (payload.eventType === 'UPDATE') {
            setPlayers(prev => prev.map(p => 
              p.id === (payload.new as Player).id ? payload.new as Player : p
            ));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [room?.id]);

  const createRoom = useCallback(async (hostName: string) => {
    setIsLoading(true);
    try {
      const code = generateRoomCode();
      const deck = shuffleDeck(createDeck());

      const { data: roomData, error: roomError } = await supabase
        .from('rooms')
        .insert({
          code,
          host_name: hostName,
          deck: deck as any,
          cards_remaining: 52
        })
        .select()
        .single();

      if (roomError) throw roomError;

      const { data: playerData, error: playerError } = await supabase
        .from('players')
        .insert({
          room_id: roomData.id,
          name: hostName,
          is_host: true
        })
        .select()
        .single();

      if (playerError) throw playerError;

      setRoom({
        ...roomData,
        deck: roomData.deck as PlayingCard[],
        current_card: roomData.current_card as PlayingCard | null
      });
      setPlayers([playerData]);
      setCurrentPlayerId(playerData.id);

      toast({
        title: 'สร้างห้องสำเร็จ! 🎉',
        description: `รหัสห้อง: ${code}`
      });

      return roomData;
    } catch (error: any) {
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: error.message,
        variant: 'destructive'
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const joinRoom = useCallback(async (code: string, playerName: string) => {
    setIsLoading(true);
    try {
      const { data: roomData, error: roomError } = await supabase
        .from('rooms')
        .select()
        .eq('code', code.toUpperCase())
        .eq('is_active', true)
        .single();

      if (roomError || !roomData) {
        throw new Error('ไม่พบห้อง หรือห้องถูกปิดแล้ว');
      }

      const { data: existingPlayers } = await supabase
        .from('players')
        .select()
        .eq('room_id', roomData.id)
        .eq('is_active', true);

      const { data: playerData, error: playerError } = await supabase
        .from('players')
        .insert({
          room_id: roomData.id,
          name: playerName,
          is_host: false
        })
        .select()
        .single();

      if (playerError) throw playerError;

      setRoom({
        ...roomData,
        deck: roomData.deck as PlayingCard[],
        current_card: roomData.current_card as PlayingCard | null
      });
      setPlayers([...(existingPlayers || []), playerData]);
      setCurrentPlayerId(playerData.id);

      toast({
        title: 'เข้าร่วมห้องสำเร็จ! 🎮',
        description: `ยินดีต้อนรับ ${playerName}`
      });

      return roomData;
    } catch (error: any) {
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: error.message,
        variant: 'destructive'
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const startGame = useCallback(async () => {
    if (!room) return;

    const deck = shuffleDeck(createDeck());
    
    const { error } = await supabase
      .from('rooms')
      .update({
        game_started: true,
        deck: deck as any,
        cards_remaining: 52,
        current_card: null
      })
      .eq('id', room.id);

    if (error) {
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: error.message,
        variant: 'destructive'
      });
    }
  }, [room, toast]);

  const drawCard = useCallback(async () => {
    if (!room || room.cards_remaining === 0) return;

    const deck = [...(room.deck || [])];
    const drawnCard = deck.pop();

    if (!drawnCard) return;

    const { error } = await supabase
      .from('rooms')
      .update({
        deck: deck as any,
        current_card: drawnCard as any,
        cards_remaining: deck.length
      })
      .eq('id', room.id);

    if (error) {
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: error.message,
        variant: 'destructive'
      });
    }
  }, [room, toast]);

  const reshuffleDeck = useCallback(async () => {
    if (!room) return;

    const deck = shuffleDeck(createDeck());

    const { error } = await supabase
      .from('rooms')
      .update({
        deck: deck as any,
        cards_remaining: 52,
        current_card: null
      })
      .eq('id', room.id);

    if (error) {
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: error.message,
        variant: 'destructive'
      });
    } else {
      toast({
        title: 'สับไพ่ใหม่แล้ว! 🎴',
        description: 'พร้อมเล่นรอบใหม่'
      });
    }
  }, [room, toast]);

  const leaveRoom = useCallback(async () => {
    if (!currentPlayerId) return;

    await supabase
      .from('players')
      .delete()
      .eq('id', currentPlayerId);

    setRoom(null);
    setPlayers([]);
    setCurrentPlayerId(null);
  }, [currentPlayerId]);

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
    leaveRoom
  };
}
