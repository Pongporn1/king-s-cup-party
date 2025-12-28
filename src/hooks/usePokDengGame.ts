import { useState, useCallback } from "react";
import {
  PokDengCard,
  createDeck,
  shuffleDeck,
  calculateTotalPoints,
  isPok,
  getSpecialHand,
  compareHands,
  GameResult,
} from "@/lib/pokDengRules";

export interface PokDengPlayer {
  id: string;
  name: string;
  cards: PokDengCard[];
  points: number;
  bet: number;
  isDealer: boolean;
  hasDrawn: boolean;
  result?: GameResult;
  multiplier?: number;
}

export interface PokDengGameState {
  deck: PokDengCard[];
  players: PokDengPlayer[];
  dealerId: string | null;
  phase: "betting" | "dealing" | "drawing" | "showdown" | "ended";
  currentPlayerIndex: number;
  roundNumber: number;
}

export function usePokDengGame() {
  const [gameState, setGameState] = useState<PokDengGameState>({
    deck: [],
    players: [],
    dealerId: null,
    phase: "betting",
    currentPlayerIndex: 0,
    roundNumber: 1,
  });

  // เริ่มเกมใหม่
  const initGame = useCallback((playerNames: string[]) => {
    const deck = createDeck();
    const players: PokDengPlayer[] = playerNames.map((name, index) => ({
      id: `player-${index}`,
      name,
      cards: [],
      points: 0,
      bet: 0,
      isDealer: index === 0, // คนแรกเป็นเจ้ามือ
      hasDrawn: false,
    }));

    setGameState({
      deck,
      players,
      dealerId: players[0].id,
      phase: "betting",
      currentPlayerIndex: 0,
      roundNumber: 1,
    });
  }, []);

  // วางเดิมพัน
  const placeBet = useCallback((playerId: string, amount: number) => {
    setGameState((prev) => ({
      ...prev,
      players: prev.players.map((p) =>
        p.id === playerId ? { ...p, bet: amount } : p
      ),
    }));
  }, []);

  // แจกไพ่
  const dealCards = useCallback(() => {
    setGameState((prev) => {
      const newDeck = [...prev.deck];
      const newPlayers = prev.players.map((player) => {
        const cards = [newDeck.pop()!, newDeck.pop()!];
        return {
          ...player,
          cards,
          points: calculateTotalPoints(cards),
          hasDrawn: false,
        };
      });

      // ตรวจสอบป๊อก
      const hasPok = newPlayers.some((p) => isPok(p.cards).isPok);

      return {
        ...prev,
        deck: newDeck,
        players: newPlayers,
        phase: hasPok ? "showdown" : "drawing",
        currentPlayerIndex: hasPok ? -1 : 1, // ข้ามเจ้ามือ เริ่มที่ผู้เล่นคนแรก
      };
    });
  }, []);

  // จั่วไพ่เพิ่ม
  const drawCard = useCallback((playerId: string) => {
    setGameState((prev) => {
      const playerIndex = prev.players.findIndex((p) => p.id === playerId);
      if (playerIndex === -1) return prev;

      const player = prev.players[playerIndex];
      if (player.hasDrawn || player.cards.length >= 3) return prev;

      const newDeck = [...prev.deck];
      const newCard = newDeck.pop()!;
      const newCards = [...player.cards, newCard];

      const newPlayers = prev.players.map((p, i) =>
        i === playerIndex
          ? {
              ...p,
              cards: newCards,
              points: calculateTotalPoints(newCards),
              hasDrawn: true,
            }
          : p
      );

      // ไปผู้เล่นคนถัดไป หรือถ้าครบแล้วไปเจ้ามือ
      let nextIndex = prev.currentPlayerIndex + 1;
      let nextPhase = prev.phase;

      if (nextIndex >= prev.players.length) {
        // ทุกคนจั่วแล้ว ไปตัดสินผล
        nextPhase = "showdown";
        nextIndex = -1;
      }

      return {
        ...prev,
        deck: newDeck,
        players: newPlayers,
        currentPlayerIndex: nextIndex,
        phase: nextPhase,
      };
    });
  }, []);

  // ไม่จั่วไพ่ (หยุด)
  const standCard = useCallback((playerId: string) => {
    setGameState((prev) => {
      const playerIndex = prev.players.findIndex((p) => p.id === playerId);
      if (playerIndex === -1) return prev;

      const newPlayers = prev.players.map((p, i) =>
        i === playerIndex ? { ...p, hasDrawn: true } : p
      );

      // ไปผู้เล่นคนถัดไป
      let nextIndex = prev.currentPlayerIndex + 1;
      let nextPhase = prev.phase;

      if (nextIndex >= prev.players.length) {
        nextPhase = "showdown";
        nextIndex = -1;
      }

      return {
        ...prev,
        players: newPlayers,
        currentPlayerIndex: nextIndex,
        phase: nextPhase,
      };
    });
  }, []);

  // ตัดสินผล
  const showdown = useCallback(() => {
    setGameState((prev) => {
      const dealer = prev.players.find((p) => p.isDealer);
      if (!dealer) return prev;

      const newPlayers = prev.players.map((player) => {
        if (player.isDealer) return player;

        const { result, playerMultiplier } = compareHands(
          player.cards,
          dealer.cards
        );
        return {
          ...player,
          result,
          multiplier: playerMultiplier,
        };
      });

      return {
        ...prev,
        players: newPlayers,
        phase: "ended",
      };
    });
  }, []);

  // เริ่มรอบใหม่
  const nextRound = useCallback(() => {
    setGameState((prev) => {
      // สับไพ่ใหม่ถ้าเหลือน้อยกว่า 10 ใบ
      const newDeck = prev.deck.length < 10 ? createDeck() : prev.deck;

      // หมุนเจ้ามือ
      const currentDealerIndex = prev.players.findIndex((p) => p.isDealer);
      const nextDealerIndex = (currentDealerIndex + 1) % prev.players.length;

      const newPlayers = prev.players.map((p, i) => ({
        ...p,
        cards: [],
        points: 0,
        bet: 0,
        isDealer: i === nextDealerIndex,
        hasDrawn: false,
        result: undefined,
        multiplier: undefined,
      }));

      return {
        deck: newDeck,
        players: newPlayers,
        dealerId: newPlayers[nextDealerIndex].id,
        phase: "betting",
        currentPlayerIndex: 0,
        roundNumber: prev.roundNumber + 1,
      };
    });
  }, []);

  // รีเซ็ตเกม
  const resetGame = useCallback(() => {
    setGameState({
      deck: [],
      players: [],
      dealerId: null,
      phase: "betting",
      currentPlayerIndex: 0,
      roundNumber: 1,
    });
  }, []);

  return {
    gameState,
    initGame,
    placeBet,
    dealCards,
    drawCard,
    standCard,
    showdown,
    nextRound,
    resetGame,
  };
}
