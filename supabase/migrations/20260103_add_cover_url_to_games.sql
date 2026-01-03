-- Add cover_url (background) alongside image_url (icon)
-- This migration prefers an existing public.games table; otherwise it ensures legacy game_covers stays compatible.

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'games'
  ) THEN
    IF NOT EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'games'
        AND column_name = 'cover_url'
    ) THEN
      ALTER TABLE public.games ADD COLUMN cover_url TEXT;
    END IF;

    IF NOT EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'games'
        AND column_name = 'image_url'
    ) THEN
      ALTER TABLE public.games ADD COLUMN image_url TEXT;
    END IF;

    IF NOT EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'games'
        AND column_name = 'updated_at'
    ) THEN
      ALTER TABLE public.games ADD COLUMN updated_at TIMESTAMPTZ DEFAULT now();
    END IF;
  ELSE
    -- Fallback: create minimal games table to store icon/cover if it doesn't exist
    CREATE TABLE IF NOT EXISTS public.games (
      id TEXT PRIMARY KEY,
      title TEXT,
      image_url TEXT,
      cover_url TEXT,
      emoji TEXT,
      gradient TEXT,
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now()
    );

    ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Allow public read access" ON public.games;
    DROP POLICY IF EXISTS "Allow public insert" ON public.games;
    DROP POLICY IF EXISTS "Allow public update" ON public.games;
    CREATE POLICY "Allow public read access" ON public.games FOR SELECT USING (true);
    CREATE POLICY "Allow public insert" ON public.games FOR INSERT WITH CHECK (true);
    CREATE POLICY "Allow public update" ON public.games FOR UPDATE USING (true);
  END IF;
END$$;

-- Keep legacy table compatible for deployments still using game_covers
ALTER TABLE public.game_covers ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE public.game_covers ADD COLUMN IF NOT EXISTS cover_url TEXT;
