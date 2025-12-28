-- เพิ่ม columns สำหรับเกมป๊อกเด้งในตาราง rooms และ players

-- เพิ่ม game_type column ให้ rooms
ALTER TABLE public.rooms ADD COLUMN IF NOT EXISTS game_type TEXT NOT NULL DEFAULT 'kingscup';

-- เพิ่ม game_state สำหรับเก็บ state ของเกมป๊อกเด้ง
ALTER TABLE public.rooms ADD COLUMN IF NOT EXISTS game_state JSONB DEFAULT NULL;

-- เพิ่ม current_player_index สำหรับเกมป๊อกเด้ง
ALTER TABLE public.rooms ADD COLUMN IF NOT EXISTS current_player_index INTEGER DEFAULT 0;

-- เพิ่ม game_phase สำหรับเกมป๊อกเด้ง
ALTER TABLE public.rooms ADD COLUMN IF NOT EXISTS game_phase TEXT DEFAULT NULL;

-- เพิ่ม columns สำหรับ players ที่ใช้ในเกมป๊อกเด้ง
ALTER TABLE public.players ADD COLUMN IF NOT EXISTS cards JSONB DEFAULT '[]'::jsonb;

ALTER TABLE public.players ADD COLUMN IF NOT EXISTS points INTEGER DEFAULT 0;

ALTER TABLE public.players ADD COLUMN IF NOT EXISTS bet INTEGER DEFAULT 0;

ALTER TABLE public.players ADD COLUMN IF NOT EXISTS has_drawn BOOLEAN DEFAULT false;

ALTER TABLE public.players ADD COLUMN IF NOT EXISTS is_dealer BOOLEAN DEFAULT false;

ALTER TABLE public.players ADD COLUMN IF NOT EXISTS result TEXT DEFAULT NULL;

ALTER TABLE public.players ADD COLUMN IF NOT EXISTS multiplier INTEGER DEFAULT 1;

ALTER TABLE public.players ADD COLUMN IF NOT EXISTS player_order INTEGER DEFAULT 0;