-- FocusForge Database Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  balance INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  best_streak INTEGER DEFAULT 0
);

-- Friendships table
CREATE TABLE public.friendships (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  friend_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  status TEXT CHECK (status IN ('pending', 'accepted', 'rejected')) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, friend_id)
);

-- Daily logs table
CREATE TABLE public.daily_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  wake_time TIME NOT NULL,
  study_hours NUMERIC(4,2) DEFAULT 0,
  break_hours NUMERIC(4,2) DEFAULT 0,
  wasted_time NUMERIC(4,2) DEFAULT 0,
  tasks_assigned INTEGER DEFAULT 0,
  tasks_completed INTEGER DEFAULT 0,
  extra_tasks INTEGER DEFAULT 0,
  notes TEXT,
  task_score INTEGER DEFAULT 0,
  hour_score INTEGER DEFAULT 0,
  wake_score INTEGER DEFAULT 0,
  penalties INTEGER DEFAULT 0,
  total_points INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Tasks table
CREATE TABLE public.tasks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  title TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  category TEXT CHECK (category IN ('core', 'elective', 'stretch')) DEFAULT 'core',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Purchases table
CREATE TABLE public.purchases (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  reward_name TEXT NOT NULL,
  points_spent INTEGER NOT NULL,
  date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Streaks table
CREATE TABLE public.streaks (
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE PRIMARY KEY,
  current_streak INTEGER DEFAULT 0,
  best_streak INTEGER DEFAULT 0,
  wake_streak INTEGER DEFAULT 0,
  task_streak INTEGER DEFAULT 0,
  study_streak INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_daily_logs_user_date ON public.daily_logs(user_id, date DESC);
CREATE INDEX idx_friendships_user ON public.friendships(user_id);
CREATE INDEX idx_friendships_friend ON public.friendships(friend_id);
CREATE INDEX idx_tasks_user_date ON public.tasks(user_id, date DESC);
CREATE INDEX idx_purchases_user ON public.purchases(user_id);

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.streaks ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view all profiles"
  ON public.users FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.users FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Friendships policies
CREATE POLICY "Users can view their friendships"
  ON public.friendships FOR SELECT
  USING (auth.uid() = user_id OR auth.uid() = friend_id);

CREATE POLICY "Users can create friendships"
  ON public.friendships FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update friendships they're part of"
  ON public.friendships FOR UPDATE
  USING (auth.uid() = user_id OR auth.uid() = friend_id);

CREATE POLICY "Users can delete their friendships"
  ON public.friendships FOR DELETE
  USING (auth.uid() = user_id);

-- Daily logs policies
CREATE POLICY "Users can view own logs and friends' logs"
  ON public.daily_logs FOR SELECT
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM public.friendships
      WHERE (user_id = auth.uid() AND friend_id = daily_logs.user_id AND status = 'accepted')
         OR (friend_id = auth.uid() AND user_id = daily_logs.user_id AND status = 'accepted')
    )
  );

CREATE POLICY "Users can insert own logs"
  ON public.daily_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own logs"
  ON public.daily_logs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own logs"
  ON public.daily_logs FOR DELETE
  USING (auth.uid() = user_id);

-- Tasks policies
CREATE POLICY "Users can view own tasks and friends' tasks"
  ON public.tasks FOR SELECT
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM public.friendships
      WHERE (user_id = auth.uid() AND friend_id = tasks.user_id AND status = 'accepted')
         OR (friend_id = auth.uid() AND user_id = tasks.user_id AND status = 'accepted')
    )
  );

CREATE POLICY "Users can insert own tasks"
  ON public.tasks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tasks"
  ON public.tasks FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own tasks"
  ON public.tasks FOR DELETE
  USING (auth.uid() = user_id);

-- Purchases policies
CREATE POLICY "Users can view own purchases and friends' purchases"
  ON public.purchases FOR SELECT
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM public.friendships
      WHERE (user_id = auth.uid() AND friend_id = purchases.user_id AND status = 'accepted')
         OR (friend_id = auth.uid() AND user_id = purchases.user_id AND status = 'accepted')
    )
  );

CREATE POLICY "Users can insert own purchases"
  ON public.purchases FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Streaks policies
CREATE POLICY "Users can view all streaks"
  ON public.streaks FOR SELECT
  USING (true);

CREATE POLICY "Users can insert own streaks"
  ON public.streaks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own streaks"
  ON public.streaks FOR UPDATE
  USING (auth.uid() = user_id);

-- Function to auto-create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, username, email, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', SPLIT_PART(NEW.email, '@', 1)),
    NEW.email,
    NEW.raw_user_meta_data->>'avatar_url'
  );

  INSERT INTO public.streaks (user_id)
  VALUES (NEW.id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to calculate daily points (called by Edge Function or client)
CREATE OR REPLACE FUNCTION public.calculate_daily_points(
  p_study_hours NUMERIC,
  p_wasted_time NUMERIC,
  p_wake_time TIME,
  p_tasks_assigned INTEGER,
  p_tasks_completed INTEGER
) RETURNS JSON AS $$
DECLARE
  v_study_points INTEGER := 0;
  v_task_points INTEGER := 0;
  v_wake_points INTEGER := 0;
  v_waste_penalty INTEGER := 0;
  v_total INTEGER := 0;
  v_percentage NUMERIC;
  v_wake_decimal NUMERIC;
BEGIN
  -- 1. Study Hours (5 points per hour)
  v_study_points := ROUND(p_study_hours * 5);

  -- 2. Task Completion Bracket
  IF p_tasks_assigned > 0 THEN
    v_percentage := p_tasks_completed::NUMERIC / p_tasks_assigned::NUMERIC;
    IF v_percentage >= 1 THEN
      v_task_points := 20;
    ELSIF v_percentage >= 0.8 THEN
      v_task_points := 10;
    ELSIF v_percentage >= 0.5 THEN
      v_task_points := 0;
    ELSE
      v_task_points := -10;
    END IF;
  END IF;

  -- 3. Wake Up Time Bonus
  v_wake_decimal := EXTRACT(HOUR FROM p_wake_time) + (EXTRACT(MINUTE FROM p_wake_time) / 60.0);
  IF v_wake_decimal <= 6 THEN
    v_wake_points := 15;
  ELSIF v_wake_decimal <= 7 THEN
    v_wake_points := 10;
  ELSIF v_wake_decimal <= 8 THEN
    v_wake_points := 5;
  ELSE
    v_wake_points := 0;
  END IF;

  -- 4. Wasted Time Penalty (-5 per hour)
  v_waste_penalty := ROUND(p_wasted_time * 5);

  v_total := v_study_points + v_task_points + v_wake_points - v_waste_penalty;

  RETURN json_build_object(
    'total', v_total,
    'breakdown', json_build_object(
      'study', v_study_points,
      'tasks', v_task_points,
      'wake', v_wake_points,
      'waste', -v_waste_penalty
    )
  );
END;
$$ LANGUAGE plpgsql;
