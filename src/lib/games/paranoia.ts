/**
 * Paranoia Game Logic
 * Game-specific logic for Paranoia game
 */

import type { GameType } from "@/lib/types/rooms";

export const GAME_TYPE: GameType = "paranoia";

export type ParanoiaPhase = "ASKING" | "SELECTING" | "REVEALING";

export interface ParanoiaGameState {
  phase: ParanoiaPhase;
  askerId: string | null;
  victimId: string | null;
  question: string | null;
  questionId: number | null;
  isRevealed: boolean;
  usedQuestionIds: number[];
}

/**
 * Initialize Paranoia game state
 */
export function initializeGame(): ParanoiaGameState {
  return {
    phase: "ASKING",
    askerId: null,
    victimId: null,
    question: null,
    questionId: null,
    isRevealed: false,
    usedQuestionIds: [],
  };
}

/**
 * Get next asker in round-robin order
 */
export function getNextAskerId(
  players: { id: string; player_order: number }[],
  currentPlayerIndex: number
): string | null {
  if (players.length === 0) return null;
  const sortedPlayers = [...players].sort(
    (a, b) => a.player_order - b.player_order
  );
  const nextIndex = (currentPlayerIndex + 1) % sortedPlayers.length;
  return sortedPlayers[nextIndex]?.id || null;
}

/**
 * Select random question
 */
export function selectRandomQuestion<T extends { id: number }>(
  questions: T[],
  usedQuestionIds: number[] = []
): T | null {
  if (questions.length === 0) return null;

  // Filter unused questions
  const availableQuestions = questions.filter(
    (q) => !usedQuestionIds.includes(q.id)
  );

  // If all used, reset
  const pool = availableQuestions.length > 0 ? availableQuestions : questions;

  return pool[Math.floor(Math.random() * pool.length)];
}
