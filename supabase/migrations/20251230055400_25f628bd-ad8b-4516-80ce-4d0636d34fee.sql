-- 1. สร้างตารางคำถาม Paranoia
CREATE TABLE IF NOT EXISTS public.paranoia_questions (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  question text NOT NULL,
  level text DEFAULT 'NORMAL'
);

-- 2. สร้างตารางคำถาม 5 Second Rule
CREATE TABLE IF NOT EXISTS public.five_sec_questions (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  topic text NOT NULL,
  category text DEFAULT 'GENERAL'
);

-- 3. Enable RLS on paranoia_questions
ALTER TABLE public.paranoia_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read paranoia questions" ON public.paranoia_questions
FOR SELECT USING (true);

-- 4. Enable RLS on five_sec_questions
ALTER TABLE public.five_sec_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read five sec questions" ON public.five_sec_questions
FOR SELECT USING (true);

-- 5. ใส่ข้อมูลตัวอย่าง Paranoia
INSERT INTO public.paranoia_questions (question, level) VALUES 
('ใครในวงนี้น่าจะแอบชอบแฟนเพื่อน?', 'SPICY'),
('ใครน่าจะตายก่อนเพื่อน?', 'NORMAL'),
('ใครหน้าตาดีแต่ซกมกที่สุด?', 'NORMAL'),
('ใครน่าจะเคยมี Sex ในที่สาธารณะ?', 'SPICY'),
('ใครพูดเก่งแต่ไม่เคยทำจริง?', 'NORMAL'),
('ใครน่าจะเป็นสายเหงา?', 'NORMAL'),
('ใครแต่งตัวเห่ยที่สุดวันนี้?', 'NORMAL'),
('ใครน่าจะโกหกเก่งที่สุด?', 'NORMAL'),
('ใครน่าจะมีความลับมากที่สุด?', 'SPICY'),
('ใครน่าจะร้องไห้ง่ายที่สุด?', 'NORMAL');

-- 6. ใส่ข้อมูลตัวอย่าง 5 Second Rule
INSERT INTO public.five_sec_questions (topic, category) VALUES 
('บอกชื่อยี่ห้อเบียร์ 3 ยี่ห้อ', 'DRINKS'),
('บอกท่า Sex 3 ท่า', '18+'),
('บอกชื่อจังหวัดที่ลงท้ายด้วยธานี 3 ชื่อ', 'GENERAL'),
('บอกสัตว์ที่มี 4 ขา 3 ชนิด', 'GENERAL'),
('บอกชื่อยี่ห้อถุงยาง 3 ยี่ห้อ', '18+'),
('บอกชื่อนักร้องหญิงไทย 3 คน', 'GENERAL'),
('บอกชื่อประเทศในเอเชีย 3 ประเทศ', 'GENERAL'),
('บอกชื่ออาหารเผ็ด 3 อย่าง', 'FOOD'),
('บอกชื่อเพลงรัก 3 เพลง', 'GENERAL'),
('บอกชื่อแอพ Dating 3 แอพ', '18+');

-- 7. Enable realtime for these tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.paranoia_questions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.five_sec_questions;