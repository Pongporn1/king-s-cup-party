/**
 * Pok Deng Game Logic
 * Game-specific logic for Pok Deng game
 */

import { createDeck, shuffleDeck, PlayingCard } from "@/lib/cardRules";
import type { GameType } from "@/lib/types/rooms";
import type { PokDengCard } from "@/lib/types/players";

export const GAME_TYPE: GameType = "pokdeng";

export type PokDengPhase =
  | "waiting"
  | "betting"
  | "dealing"
  | "playing"
  | "scoring";

export interface PokDengGameState {
  deck: PlayingCard[];
  phase: PokDengPhase;
  currentPlayerIndex: number;
}

/**
 * Convert PlayingCard to PokDengCard format
 */
function toPokDengCard(card: PlayingCard): PokDengCard {
  const rankValue: { [key: string]: number } = {
    A: 1,
    "2": 2,
    "3": 3,
    "4": 4,
    "5": 5,
    "6": 6,
    "7": 7,
    "8": 8,
    "9": 9,
    "10": 10,
    J: 10,
    Q: 10,
    K: 10,
  };

  return {
    suit: card.suit,
    rank: card.value,
    value: rankValue[card.value] || 0,
  };
}

/**
 * Initialize Pok Deng game state
 */
export function initializeGame(): PokDengGameState {
  const deck = shuffleDeck(createDeck());
  return {
    deck,
    phase: "waiting",
    currentPlayerIndex: 0,
  };
}

/**
 * Start new round
 */
export function startNewRound(playerCount: number): PokDengGameState {
  const deck = shuffleDeck(createDeck());
  return {
    deck,
    phase: "betting",
    currentPlayerIndex: 0,
  };
}

/**
 * Calculate Pok Deng score
 */
export function calculateScore(cards: PokDengCard[]): number {
  // Simplified scoring logic
  return cards.reduce((sum, card) => sum + Math.min(card.value, 10), 0) % 10;
}

/**
 * Check if hand is Pok (natural 8 or 9)
 */
export function isPok(cards: PokDengCard[]): boolean {
  if (cards.length !== 2) return false;
  const score = calculateScore(cards);
  return score === 8 || score === 9;
}
