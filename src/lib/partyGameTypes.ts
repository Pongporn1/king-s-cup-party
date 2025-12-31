// Types for Party Games (Paranoia & 5 Second Rule)

export type PartyGameMode = 'LOBBY' | 'PARANOIA' | 'FIVE_SEC';

// Paranoia Game State
export interface ParanoiaState {
  phase: 'ASKING' | 'REVEALING';
  asker_id: string;
  victim_id: string | null;
  question: string;
  is_revealed: boolean;
}

// 5 Second Rule Game State
export interface FiveSecState {
  phase: 'PLAYING' | 'JUDGING';
  player_id: string;
  topic: string;
  end_time: string; // ISO timestamp
  votes: { [playerId: string]: boolean }; // true = pass, false = drink
  timeLimit?: number; // Time limit in seconds (default 5)
}

// Question types from database
export interface ParanoiaQuestion {
  id: number;
  question: string;
  level: string;
}

export interface FiveSecQuestion {
  id: number;
  topic: string;
  category: string;
}
