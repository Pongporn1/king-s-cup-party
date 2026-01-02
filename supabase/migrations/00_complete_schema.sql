-- Complete database schema for King's Cup Party Game
-- Run this in the NEW Supabase SQL Editor

-- =============================================
-- 1. CREATE TABLES
-- =============================================

-- Rooms table for game lobbies
CREATE TABLE IF NOT EXISTS public.rooms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code VARCHAR(6) NOT NULL UNIQUE,
  host_name TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  deck JSONB NOT NULL DEFAULT '[]'::jsonb,
  current_card JSONB,
  cards_remaining INTEGER NOT NULL DEFAULT 52,
  game_started BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  -- Pok Deng columns
  game_type TEXT NOT NULL DEFAULT 'kingscup',
  game_state JSONB DEFAULT NULL,
  current_player_index INTEGER DEFAULT 0,
  game_phase TEXT DEFAULT NULL
);

-- Players table
CREATE TABLE IF NOT EXISTS public.players (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  is_host BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  avatar TEXT DEFAULT NULL,
  -- Pok Deng columns
  cards JSONB DEFAULT '[]'::jsonb,
  points INTEGER DEFAULT 0,
  bet INTEGER DEFAULT 0,
  has_drawn BOOLEAN DEFAULT false,
  is_dealer BOOLEAN DEFAULT false,
  result TEXT DEFAULT NULL,
  multiplier INTEGER DEFAULT 1,
  player_order INTEGER DEFAULT 0
);

-- Paranoia questions table
CREATE TABLE IF NOT EXISTS public.paranoia_questions (
  id SERIAL PRIMARY KEY,
  question TEXT NOT NULL,
  is_default BOOLEAN DEFAULT false,
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Game covers table
CREATE TABLE IF NOT EXISTS public.game_covers (
  id TEXT PRIMARY KEY,
  title TEXT,
  cover_url TEXT,
  emoji TEXT,
  gradient TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- 2. ENABLE RLS
-- =============================================
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.paranoia_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_covers ENABLE ROW LEVEL SECURITY;

-- =============================================
-- 3. CREATE POLICIES
-- =============================================

-- Rooms policies
DROP POLICY IF EXISTS "Anyone can view rooms" ON public.rooms;
DROP POLICY IF EXISTS "Anyone can create rooms" ON public.rooms;
DROP POLICY IF EXISTS "Anyone can update rooms" ON public.rooms;
CREATE POLICY "Anyone can view rooms" ON public.rooms FOR SELECT USING (true);
CREATE POLICY "Anyone can create rooms" ON public.rooms FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update rooms" ON public.rooms FOR UPDATE USING (true);

-- Players policies
DROP POLICY IF EXISTS "Anyone can view players" ON public.players;
DROP POLICY IF EXISTS "Anyone can join rooms" ON public.players;
DROP POLICY IF EXISTS "Anyone can update players" ON public.players;
DROP POLICY IF EXISTS "Anyone can leave rooms" ON public.players;
CREATE POLICY "Anyone can view players" ON public.players FOR SELECT USING (true);
CREATE POLICY "Anyone can join rooms" ON public.players FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update players" ON public.players FOR UPDATE USING (true);
CREATE POLICY "Anyone can leave rooms" ON public.players FOR DELETE USING (true);

-- Paranoia questions policies
DROP POLICY IF EXISTS "Allow public read access" ON public.paranoia_questions;
DROP POLICY IF EXISTS "Allow public insert" ON public.paranoia_questions;
DROP POLICY IF EXISTS "Allow update non-default questions" ON public.paranoia_questions;
DROP POLICY IF EXISTS "Allow delete non-default questions" ON public.paranoia_questions;
CREATE POLICY "Allow public read access" ON public.paranoia_questions FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON public.paranoia_questions FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update non-default questions" ON public.paranoia_questions FOR UPDATE USING (is_default = false);
CREATE POLICY "Allow delete non-default questions" ON public.paranoia_questions FOR DELETE USING (is_default = false);

-- Game covers policies
DROP POLICY IF EXISTS "Allow public read access" ON public.game_covers;
DROP POLICY IF EXISTS "Allow public insert" ON public.game_covers;
DROP POLICY IF EXISTS "Allow public update" ON public.game_covers;
CREATE POLICY "Allow public read access" ON public.game_covers FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON public.game_covers FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON public.game_covers FOR UPDATE USING (true);

-- =============================================
-- 4. CREATE INDEXES
-- =============================================
CREATE INDEX IF NOT EXISTS idx_rooms_code ON public.rooms(code);
CREATE INDEX IF NOT EXISTS idx_players_room_id ON public.players(room_id);
CREATE INDEX IF NOT EXISTS idx_paranoia_questions_created_by ON public.paranoia_questions(created_by);

-- =============================================
-- 5. ENABLE REALTIME
-- =============================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE public.players;
ALTER PUBLICATION supabase_realtime ADD TABLE public.paranoia_questions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.game_covers;
