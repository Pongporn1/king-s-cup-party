/**
 * Five Seconds Game Logic
 * Game-specific logic for Five Seconds game
 */

import type { GameType } from "@/lib/types/rooms";

export const GAME_TYPE: GameType = "fivesec";

export type FiveSecPhase = "PLAYING" | "JUDGING" | "RESULTS";

export interface FiveSecGameState {
  phase: FiveSecPhase;
  playerId: string | null;
  topic: string | null;
  endTime: string | null;
  votes: Record<string, boolean>; // playerId -> passed (true) or failed (false)
  timeLimit: number;
}

/**
 * Initialize Five Seconds game state
 */
export function initializeGame(timeLimit: number = 5): FiveSecGameState {
  return {
    phase: "PLAYING",
    playerId: null,
    topic: null,
    endTime: null,
    votes: {},
    timeLimit,
  };
}

/**
 * Get next player in round-robin order
 */
export function getNextPlayerId(
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
 * Select random topic
 */
export function selectRandomTopic<T extends { topic: string }>(
  topics: T[]
): T | null {
  if (topics.length === 0) return null;
  return topics[Math.floor(Math.random() * topics.length)];
}

/**
 * Calculate voting results
 */
export function calculateVoteResults(
  votes: Record<string, boolean>,
  totalPlayers: number
): { passed: boolean; passCount: number; failCount: number } {
  const voteCount = Object.keys(votes).length;
  const passCount = Object.values(votes).filter((v) => v).length;
  const failCount = voteCount - passCount;

  // Need majority to pass
  const passed = passCount > failCount;

  return { passed, passCount, failCount };
}

/**
 * Check if time is up
 */
export function isTimeUp(endTime: string | null): boolean {
  if (!endTime) return false;
  return new Date() >= new Date(endTime);
}
