-- ========================================================
-- SweetJourney - Database Schema for Supabase (NeungandNine)
-- ========================================================

-- 1. Profiles Table (เก็บข้อมูลผู้ใช้และโค้ดคู่รัก)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  avatar TEXT,
  couple_code TEXT UNIQUE NOT NULL,
  partner_id UUID REFERENCES public.profiles(id),
  partner_name TEXT,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_login_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Trips Table (เก็บทริปและแพลนรายวัน)
CREATE TABLE IF NOT EXISTS public.trips (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  destination TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  emoji TEXT DEFAULT '🌸',
  notes TEXT,
  cover_image TEXT,
  created_by UUID REFERENCES public.profiles(id),
  created_by_name TEXT,
  partner_id UUID REFERENCES public.profiles(id),
  partner_name TEXT,
  days JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Login Audit Logs Table (เก็บสถิติการล็อกอินสำหรับหลังบ้าน)
CREATE TABLE IF NOT EXISTS public.login_logs (
  id TEXT PRIMARY KEY,
  user_id UUID,
  user_name TEXT,
  user_email TEXT,
  date_str DATE DEFAULT CURRENT_DATE,
  time_str TEXT,
  device TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.login_logs ENABLE ROW LEVEL SECURITY;

-- Allow read/write for all authenticated users
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR ALL USING (true);

CREATE POLICY "Trips viewable by creators and partners" ON public.trips FOR ALL USING (true);

CREATE POLICY "Login logs viewable by all" ON public.login_logs FOR ALL USING (true);

-- Enable Realtime for Trips so partners see edits instantly
ALTER PUBLICATION supabase_realtime ADD TABLE public.trips;
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
