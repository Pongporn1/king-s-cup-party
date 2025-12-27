-- Create floating_names table for admin's floating names feature
CREATE TABLE IF NOT EXISTS floating_names (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS but allow public access (for simplicity)
ALTER TABLE floating_names ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read
CREATE POLICY "Allow public read" ON floating_names
  FOR SELECT USING (true);

-- Allow anyone to insert (in production, you'd want auth)
CREATE POLICY "Allow public insert" ON floating_names
  FOR INSERT WITH CHECK (true);

-- Allow anyone to delete (in production, you'd want auth)
CREATE POLICY "Allow public delete" ON floating_names
  FOR DELETE USING (true);
