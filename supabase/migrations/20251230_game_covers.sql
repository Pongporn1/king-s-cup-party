-- สร้างตาราง games สำหรับเก็บข้อมูลเกมและลิงก์รูปปก
CREATE TABLE IF NOT EXISTS public.game_covers (
    id text PRIMARY KEY,
    title text NOT NULL,
    cover_url text,
    emoji text,
    gradient text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- เพิ่มข้อมูลเกมเริ่มต้น
INSERT INTO public.game_covers (id, title, emoji, gradient) VALUES
('doraemon', 'King''s Cup', '🎴', 'from-red-500 to-orange-600'),
('5-sec', '5 Second Rule', '⏱️', 'from-amber-500 to-yellow-600'),
('pokdeng', 'Pok Deng', '🃏', 'from-green-500 to-emerald-600'),
('undercover', 'Undercover', '🕵️', 'from-purple-500 to-indigo-600'),
('paranoia', 'Paranoia', '🤫', 'from-pink-500 to-rose-600')
ON CONFLICT (id) DO NOTHING;

-- เปิดสิทธิ์ให้ทุกคนอ่านได้
ALTER TABLE public.game_covers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access" ON public.game_covers
    FOR SELECT USING (true);

CREATE POLICY "Allow authenticated update" ON public.game_covers
    FOR UPDATE USING (true);

CREATE POLICY "Allow authenticated insert" ON public.game_covers
    FOR INSERT WITH CHECK (true);
