/**
 * King's Cup Game Logic
 * Game-specific logic for King's Cup game
 */

import { createDeck, shuffleDeck, type PlayingCard } from "@/lib/cardRules";
import type { GameType } from "@/lib/types/rooms";

export const GAME_TYPE: GameType = "kingscup";

export interface KingsCupGameState {
  deck: PlayingCard[];
  currentCard: PlayingCard | null;
  cardsRemaining: number;
}

/**
 * Initialize King's Cup game state
 */
export function initializeGame(): KingsCupGameState {
  const deck = shuffleDeck(createDeck());
  return {
    deck,
    currentCard: null,
    cardsRemaining: 52,
  };
}

/**
 * Draw a card from the deck
 */
export function drawCard(state: KingsCupGameState): {
  newState: KingsCupGameState;
  drawnCard: PlayingCard | null;
} {
  if (state.deck.length === 0) {
    return { newState: state, drawnCard: null };
  }

  const [drawnCard, ...remainingDeck] = state.deck;

  return {
    newState: {
      deck: remainingDeck,
      currentCard: drawnCard,
      cardsRemaining: remainingDeck.length,
    },
    drawnCard,
  };
}

/**
 * Check if game is over
 */
export function isGameOver(state: KingsCupGameState): boolean {
  return state.cardsRemaining === 0;
}
