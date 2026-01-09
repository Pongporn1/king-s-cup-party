/**
 * Undercover Game Logic
 * Game-specific logic for Undercover game
 */

import type { GameType } from "@/lib/types/rooms";

export const GAME_TYPE: GameType = "undercover";

export type UndercoverPhase =
  | "WAITING"
  | "DESCRIBE"
  | "VOTING"
  | "REVEAL"
  | "GAME_OVER";
export type UndercoverRole = "CIVILIAN" | "UNDERCOVER" | "MR_WHITE";

export interface UndercoverGameState {
  phase: UndercoverPhase;
  currentTurnIndex: number;
  vocabulary: { civilian: string; undercover: string } | null;
  round: number;
  timerSeconds: number;
  includeMrWhite: boolean;
  selectedCategory: string;
}

/**
 * Initialize Undercover game state
 */
export function initializeGame(): UndercoverGameState {
  return {
    phase: "WAITING",
    currentTurnIndex: 0,
    vocabulary: null,
    round: 1,
    timerSeconds: 30,
    includeMrWhite: false,
    selectedCategory: "ทั้งหมด",
  };
}

/**
 * Assign roles to players
 */
export function assignRoles(
  playerCount: number,
  includeMrWhite: boolean = false
): { role: UndercoverRole; word: string }[] {
  if (playerCount < 3) {
    throw new Error("Need at least 3 players");
  }

  const roles: UndercoverRole[] = [];
  const undercoverCount = Math.floor(playerCount / 3);

  // Add undercovers
  for (let i = 0; i < undercoverCount; i++) {
    roles.push("UNDERCOVER");
  }

  // Add Mr. White if enabled
  if (includeMrWhite) {
    roles.push("MR_WHITE");
  }

  // Fill rest with civilians
  while (roles.length < playerCount) {
    roles.push("CIVILIAN");
  }

  // Shuffle roles
  return roles
    .sort(() => Math.random() - 0.5)
    .map((role) => ({ role, word: "" }));
}

/**
 * Check if game is over
 */
export function checkGameOver(
  alivePlayers: { role: UndercoverRole; is_alive: boolean }[]
): { isOver: boolean; winner: "CIVILIAN" | "UNDERCOVER" | null } {
  const aliveUndercovers = alivePlayers.filter(
    (p) => p.is_alive && p.role === "UNDERCOVER"
  ).length;
  const aliveCivilians = alivePlayers.filter(
    (p) => p.is_alive && p.role === "CIVILIAN"
  ).length;

  if (aliveUndercovers === 0) {
    return { isOver: true, winner: "CIVILIAN" };
  }

  if (aliveUndercovers >= aliveCivilians) {
    return { isOver: true, winner: "UNDERCOVER" };
  }

  return { isOver: false, winner: null };
}
