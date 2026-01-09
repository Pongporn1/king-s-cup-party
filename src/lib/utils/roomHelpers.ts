/**
 * Room Helper Utilities
 * Shared utility functions for room management
 */

import { generateRoomCode } from "@/lib/cardRules";

/**
 * Generate a unique player ID
 * Uses timestamp + random string for compatibility
 */
export function generatePlayerId(): string {
  // Use timestamp + random string instead of crypto.randomUUID for better compatibility
  return `${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}

/**
 * Generate a unique room ID
 */
export function generateRoomId(): string {
  return `${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}

/**
 * Generate room code with optional custom generator
 */
export function createRoomCode(): string {
  return generateRoomCode();
}

/**
 * Get random avatar from available avatars
 */
const TOTAL_AVATARS = 11;

export function getRandomAvatar(usedAvatars: number[] = []): number {
  const availableAvatars = Array.from(
    { length: TOTAL_AVATARS },
    (_, i) => i + 1
  ).filter((num) => !usedAvatars.includes(num));

  if (availableAvatars.length === 0) {
    return Math.floor(Math.random() * TOTAL_AVATARS) + 1;
  }

  return availableAvatars[Math.floor(Math.random() * availableAvatars.length)];
}

/**
 * Validate room code format
 */
export function isValidRoomCode(code: string): boolean {
  return /^[A-Z0-9]{4,8}$/.test(code);
}

/**
 * Validate player name
 */
export function isValidPlayerName(name: string): boolean {
  return name.trim().length >= 2 && name.trim().length <= 20;
}

/**
 * Remove duplicate players by ID
 */
export function removeDuplicatePlayers<T extends { id: string }>(
  players: T[]
): T[] {
  const uniqueMap = new Map<string, T>();
  for (const player of players) {
    uniqueMap.set(player.id, player);
  }
  return Array.from(uniqueMap.values());
}

/**
 * Sort players by join order
 */
export function sortPlayersByOrder<T extends { player_order?: number }>(
  players: T[]
): T[] {
  return [...players].sort((a, b) => {
    const orderA = a.player_order ?? Infinity;
    const orderB = b.player_order ?? Infinity;
    return orderA - orderB;
  });
}
