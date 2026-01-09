/**
 * Room Types
 * Shared type definitions for all room-related functionality
 */

import { PlayingCard } from "@/lib/cardRules";

export type GameType =
  | "kingscup"
  | "pokdeng"
  | "undercover"
  | "paranoia"
  | "fivesec";

export interface BaseRoom {
  id: string;
  code: string;
  host_name: string;
  is_active: boolean;
  game_type: GameType;
  game_started: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface KingsCupRoom extends BaseRoom {
  game_type: "kingscup";
  deck: PlayingCard[];
  current_card: PlayingCard | null;
  cards_remaining: number;
}

export interface PokDengCard {
  suit: string;
  rank: string;
  value: number;
}

export interface PokDengRoom extends BaseRoom {
  game_type: "pokdeng";
  deck: PokDengCard[];
  game_phase: string;
  current_player_index: number;
}

export interface UndercoverVocabulary {
  civilian: string;
  undercover: string;
}

export interface UndercoverRoom extends BaseRoom {
  game_type: "undercover";
  game_phase: string;
  current_turn_index: number;
  vocabulary: UndercoverVocabulary | null;
  round: number;
  timer_seconds: number;
  include_mr_white: boolean;
  selected_category: string;
}

export interface ParanoiaGameState {
  phase: string;
  askerId: string | null;
  victimId: string | null;
  question: string | null;
  questionId: number | null;
  isRevealed: boolean;
  usedQuestionIds: number[];
}

export interface FiveSecGameState {
  phase: string;
  playerId: string | null;
  topic: string | null;
  endTime: string | null;
  votes: Record<string, boolean>;
  timeLimit: number;
}

export interface ParanoiaRoom extends BaseRoom {
  game_type: "paranoia";
  game_state: ParanoiaGameState | null;
  current_player_index: number;
}

export interface FiveSecRoom extends BaseRoom {
  game_type: "fivesec";
  game_state: FiveSecGameState | null;
  current_player_index: number;
}

export type Room =
  | KingsCupRoom
  | PokDengRoom
  | UndercoverRoom
  | ParanoiaRoom
  | FiveSecRoom;

export interface CreateRoomParams {
  code: string;
  host_name: string;
  game_type: GameType;
  deck?: PlayingCard[] | PokDengCard[];
  current_card?: PlayingCard | null;
  cards_remaining?: number;
  game_phase?: string;
  game_state?: ParanoiaGameState | FiveSecGameState | null;
  current_player_index?: number;
}

export interface CreateRoomResponse {
  success: boolean;
  id: string;
  code: string;
}
