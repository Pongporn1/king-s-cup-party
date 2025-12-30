-- Add Undercover game columns to players table
ALTER TABLE public.players
ADD COLUMN IF NOT EXISTS role TEXT,
ADD COLUMN IF NOT EXISTS word TEXT,
ADD COLUMN IF NOT EXISTS is_alive BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS vote_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS has_voted BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS voted_for UUID REFERENCES public.players(id) ON DELETE SET NULL;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_players_is_alive ON public.players(is_alive);
CREATE INDEX IF NOT EXISTS idx_players_role ON public.players(role);
CREATE INDEX IF NOT EXISTS idx_players_voted_for ON public.players(voted_for);

-- Add comment for documentation
COMMENT ON COLUMN public.players.role IS 'Player role for Undercover game: CIVILIAN, UNDERCOVER, or MR_WHITE';
COMMENT ON COLUMN public.players.word IS 'The word assigned to the player in Undercover game';
COMMENT ON COLUMN public.players.is_alive IS 'Whether the player is still alive in Undercover game';
COMMENT ON COLUMN public.players.vote_count IS 'Number of votes the player received in Undercover game';
COMMENT ON COLUMN public.players.has_voted IS 'Whether the player has voted in the current round';
COMMENT ON COLUMN public.players.voted_for IS 'The player ID that this player voted for';