/**
 * Player Types
 * Shared type definitions for all player-related functionality
 */

export interface BasePlayer {
  id: string;
  room_id: string;
  name: string;
  is_host: boolean;
  is_active: boolean;
  avatar?: number;
  player_order?: number;
  joined_at?: string;
}

export interface KingsCupPlayer extends BasePlayer {
  // King's Cup specific fields can be added here if needed
  cards_drawn?: number;
}

export interface PokDengCard {
  suit: string;
  rank: string;
  value: number;
}

export interface PokDengPlayer extends BasePlayer {
  cards: PokDengCard[];
  points: number;
  bet: number;
  is_dealer: boolean;
  has_drawn: boolean;
  result?: string;
  multiplier?: number;
}

export interface UndercoverPlayer extends BasePlayer {
  role: string;
  word: string;
  is_alive: boolean;
  vote_count: number;
  has_voted: boolean;
  voted_for?: string;
}

export interface ParanoiaPlayer extends BasePlayer {
  points?: number;
}

export interface FiveSecPlayer extends BasePlayer {
  points: number;
}

export type Player =
  | KingsCupPlayer
  | PokDengPlayer
  | UndercoverPlayer
  | ParanoiaPlayer
  | FiveSecPlayer;

export interface CreatePlayerParams {
  room_id: string;
  name: string;
  is_host: boolean;
  avatar?: number;
  player_order?: number;
  // PokDeng specific
  cards?: PokDengCard[];
  points?: number;
  bet?: number;
  is_dealer?: boolean;
  has_drawn?: boolean;
  // Undercover specific
  role?: string;
  word?: string;
  is_alive?: boolean;
  vote_count?: number;
  has_voted?: boolean;
  voted_for?: string;
}

export interface CreatePlayerResponse {
  success: boolean;
  id: string;
}
