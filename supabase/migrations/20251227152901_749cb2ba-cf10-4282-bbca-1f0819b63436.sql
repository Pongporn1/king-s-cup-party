-- Create rooms table for game lobbies
CREATE TABLE public.rooms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code VARCHAR(6) NOT NULL UNIQUE,
  host_name TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  deck JSONB NOT NULL DEFAULT '[]'::jsonb,
  current_card JSONB,
  cards_remaining INTEGER NOT NULL DEFAULT 52,
  game_started BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create players table
CREATE TABLE public.players (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  is_host BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;

-- Public access policies (no auth required for party game)
CREATE POLICY "Anyone can view rooms" ON public.rooms FOR SELECT USING (true);
CREATE POLICY "Anyone can create rooms" ON public.rooms FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update rooms" ON public.rooms FOR UPDATE USING (true);

CREATE POLICY "Anyone can view players" ON public.players FOR SELECT USING (true);
CREATE POLICY "Anyone can join rooms" ON public.players FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update players" ON public.players FOR UPDATE USING (true);
CREATE POLICY "Anyone can leave rooms" ON public.players FOR DELETE USING (true);

-- Enable realtime for both tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE public.players;

-- Create index for room code lookup
CREATE INDEX idx_rooms_code ON public.rooms(code);
CREATE INDEX idx_players_room_id ON public.players(room_id);


ALTER TABLE paranoia_questions 
ADD COLUMN is_default boolean DEFAULT false,
ADD COLUMN created_at timestamptz DEFAULT now();

DROP POLICY IF EXISTS "Anyone can insert paranoia questions" ON paranoia_questions;
DROP POLICY IF EXISTS "Anyone can update non-default paranoia questions" ON paranoia_questions;
DROP POLICY IF EXISTS "Anyone can delete non-default paranoia questions" ON paranoia_questions;

CREATE POLICY "Anyone can insert paranoia questions" ON paranoia_questions
FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update non-default paranoia questions" ON paranoia_questions
FOR UPDATE USING (is_default = false);

CREATE POLICY "Anyone can delete non-default paranoia questions" ON paranoia_questions
FOR DELETE USING (is_default = false);