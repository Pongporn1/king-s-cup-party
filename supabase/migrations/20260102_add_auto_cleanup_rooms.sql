-- Add function to automatically delete old rooms (older than 3 hours)
CREATE OR REPLACE FUNCTION cleanup_old_rooms()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Delete rooms older than 3 hours
  DELETE FROM public.rooms
  WHERE created_at < NOW() - INTERVAL '3 hours';
  
  RAISE NOTICE 'Cleaned up old rooms';
END;
$$;

-- Create a function that can be called periodically
-- This will be triggered by client-side or cron job
COMMENT ON FUNCTION cleanup_old_rooms() IS 'Deletes rooms that are older than 3 hours to save database space';

-- Optional: Add index on created_at for better performance
CREATE INDEX IF NOT EXISTS idx_rooms_created_at ON public.rooms(created_at);
