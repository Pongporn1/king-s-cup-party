-- Enable full replica identity for players table to support DELETE events in Realtime
-- This ensures DELETE events include all column data, not just the primary key
ALTER TABLE public.players REPLICA IDENTITY FULL;
ALTER TABLE public.rooms REPLICA IDENTITY FULL;

-- Ensure realtime publication includes the tables (idempotent operation)
-- Note: This is a no-op if tables are already in the publication
DO $$
BEGIN
  -- Check and add rooms if not exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND tablename = 'rooms'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.rooms;
  END IF;

  -- Check and add players if not exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND tablename = 'players'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.players;
  END IF;
END $$;
