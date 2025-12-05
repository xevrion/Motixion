-- Motixion Database Schema

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
  total_points_earned INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  best_streak INTEGER DEFAULT 0,
  role TEXT DEFAULT 'user'
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
  reward_id TEXT,
  points_spent INTEGER NOT NULL,
  date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Custom rewards table
CREATE TABLE public.custom_rewards (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  cost INTEGER NOT NULL,
  icon TEXT NOT NULL,
  category TEXT DEFAULT 'misc',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
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

-- Notification preferences table
CREATE TABLE public.notification_preferences (
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE PRIMARY KEY,
  enabled BOOLEAN DEFAULT false,
  reminder_time TIME DEFAULT '20:00:00',
  timezone TEXT DEFAULT 'UTC',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Push subscriptions table
CREATE TABLE public.push_subscriptions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  endpoint TEXT UNIQUE NOT NULL,
  p256dh_key TEXT NOT NULL,
  auth_key TEXT NOT NULL,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Roles table
CREATE TABLE public.roles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  emoji TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User roles join table
CREATE TABLE public.user_roles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  role_id UUID REFERENCES public.roles(id) ON DELETE CASCADE NOT NULL,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, role_id)
);

-- Indexes for performance
CREATE INDEX idx_daily_logs_user_date ON public.daily_logs(user_id, date DESC);
CREATE INDEX idx_friendships_user ON public.friendships(user_id);
CREATE INDEX idx_friendships_friend ON public.friendships(friend_id);
CREATE INDEX idx_tasks_user_date ON public.tasks(user_id, date DESC);
CREATE INDEX idx_purchases_user ON public.purchases(user_id);
CREATE INDEX idx_custom_rewards_user ON public.custom_rewards(user_id);
CREATE INDEX idx_notification_preferences_user ON public.notification_preferences(user_id);
CREATE INDEX idx_push_subscriptions_user ON public.push_subscriptions(user_id);
CREATE INDEX idx_push_subscriptions_endpoint ON public.push_subscriptions(endpoint);
CREATE INDEX idx_user_roles_user ON public.user_roles(user_id);
CREATE INDEX idx_user_roles_role ON public.user_roles(role_id);
CREATE INDEX idx_user_roles_assigned_at ON public.user_roles(assigned_at);

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

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

-- Custom rewards policies
CREATE POLICY "Users can view own custom rewards"
  ON public.custom_rewards FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own custom rewards"
  ON public.custom_rewards FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own custom rewards"
  ON public.custom_rewards FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own custom rewards"
  ON public.custom_rewards FOR DELETE
  USING (auth.uid() = user_id);

-- Notification preferences policies
CREATE POLICY "Users can view own notification preferences"
  ON public.notification_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own notification preferences"
  ON public.notification_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notification preferences"
  ON public.notification_preferences FOR UPDATE
  USING (auth.uid() = user_id);

-- Push subscriptions policies
CREATE POLICY "Users can view own push subscriptions"
  ON public.push_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own push subscriptions"
  ON public.push_subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own push subscriptions"
  ON public.push_subscriptions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own push subscriptions"
  ON public.push_subscriptions FOR DELETE
  USING (auth.uid() = user_id);

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

-- Roles policies
CREATE POLICY "Everyone can view roles"
  ON public.roles FOR SELECT
  USING (true);

CREATE POLICY "Owner can create roles"
  ON public.roles FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'owner'
    )
  );

CREATE POLICY "Owner can update roles"
  ON public.roles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'owner'
    )
  );

CREATE POLICY "Owner can delete roles"
  ON public.roles FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'owner'
    )
  );

-- User roles policies
CREATE POLICY "Everyone can view all user roles"
  ON public.user_roles FOR SELECT
  USING (true);

CREATE POLICY "Owner can assign roles"
  ON public.user_roles FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'owner'
    )
  );

CREATE POLICY "Owner can update role assignments"
  ON public.user_roles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'owner'
    )
  );

CREATE POLICY "Owner can remove role assignments"
  ON public.user_roles FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'owner'
    )
  );

-- Function to auto-create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_avatar_url TEXT;
  v_username TEXT;
BEGIN
  -- Extract avatar URL from Google OAuth (check multiple possible locations)
  v_avatar_url := COALESCE(
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.raw_user_meta_data->>'picture',
    NEW.user_metadata->>'avatar_url',
    NEW.user_metadata->>'picture'
  );

  -- Extract username (Google provides 'full_name' or 'name', fallback to email prefix)
  v_username := COALESCE(
    NEW.raw_user_meta_data->>'username',
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name',
    NEW.user_metadata->>'full_name',
    NEW.user_metadata->>'name',
    SPLIT_PART(NEW.email, '@', 1)
  );

  INSERT INTO public.users (id, username, email, avatar_url)
  VALUES (
    NEW.id,
    v_username,
    NEW.email,
    v_avatar_url
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

-- Function to sync user avatar from auth.users on sign-in
CREATE OR REPLACE FUNCTION public.sync_user_avatar()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.users u
  SET avatar_url = COALESCE(
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.raw_user_meta_data->>'picture',
    u.avatar_url  -- Keep existing if no new avatar found
  )
  WHERE u.id = NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to manually sync current user's avatar (callable from client)
CREATE OR REPLACE FUNCTION public.sync_my_avatar()
RETURNS void AS $$
DECLARE
  v_user_id UUID;
  v_avatar_url TEXT;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN;
  END IF;
  
  -- Get avatar from auth.users
  SELECT COALESCE(
    raw_user_meta_data->>'avatar_url',
    raw_user_meta_data->>'picture'
  ) INTO v_avatar_url
  FROM auth.users
  WHERE id = v_user_id;
  
  -- Update public.users if avatar found
  IF v_avatar_url IS NOT NULL THEN
    UPDATE public.users
    SET avatar_url = v_avatar_url
    WHERE id = v_user_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to sync avatar on auth.users update (fires on OAuth sign-in)
CREATE TRIGGER on_auth_user_updated
  AFTER UPDATE ON auth.users
  FOR EACH ROW 
  WHEN (OLD.raw_user_meta_data IS DISTINCT FROM NEW.raw_user_meta_data)
  EXECUTE FUNCTION public.sync_user_avatar();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at for custom_rewards
CREATE TRIGGER update_custom_rewards_updated_at
  BEFORE UPDATE ON public.custom_rewards
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger to update updated_at for notification_preferences
CREATE TRIGGER update_notification_preferences_updated_at
  BEFORE UPDATE ON public.notification_preferences
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger to update updated_at for push_subscriptions
CREATE TRIGGER update_push_subscriptions_updated_at
  BEFORE UPDATE ON public.push_subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

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

  -- 2. Task Completion Bracket (with extra credit for over-achievement)
  IF p_tasks_assigned > 0 THEN
    v_percentage := (p_tasks_completed::NUMERIC / p_tasks_assigned::NUMERIC) * 100;

    IF v_percentage >= 180 THEN
      v_task_points := 30;      -- 180-200%: +30
    ELSIF v_percentage >= 150 THEN
      v_task_points := 25;      -- 150-180%: +25
    ELSIF v_percentage >= 120 THEN
      v_task_points := 20;      -- 120-150%: +20
    ELSIF v_percentage >= 100 THEN
      v_task_points := 15;      -- 100-120%: +15
    ELSIF v_percentage >= 91 THEN
      v_task_points := 10;      -- 91-100%: +10
    ELSIF v_percentage >= 81 THEN
      v_task_points := 0;       -- 81-90%: 0
    ELSE
      v_task_points := -10;     -- ≤80%: -10
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

-- Function to get daily leaderboard (bypasses RLS for global view)
CREATE OR REPLACE FUNCTION public.get_daily_leaderboard()
RETURNS TABLE (
  id UUID,
  username TEXT,
  score INTEGER,
  avatar_url TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    u.id,
    u.username,
    dl.total_points AS score,
    u.avatar_url
  FROM public.daily_logs dl
  INNER JOIN public.users u ON u.id = dl.user_id
  WHERE dl.date = CURRENT_DATE
  ORDER BY dl.total_points DESC
  LIMIT 15;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to backfill total_points_earned for existing users
-- Calculates: current balance + sum of all purchases
CREATE OR REPLACE FUNCTION public.backfill_lifetime_points()
RETURNS void AS $$
BEGIN
  UPDATE public.users u
  SET total_points_earned = COALESCE(u.balance, 0) + COALESCE(
    (SELECT SUM(points_spent) FROM public.purchases WHERE user_id = u.id),
    0
  )
  WHERE u.total_points_earned = 0 OR u.total_points_earned IS NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get total user count (bypasses RLS for public display)
CREATE OR REPLACE FUNCTION public.get_total_user_count()
RETURNS INTEGER AS $$
BEGIN
  RETURN (SELECT COUNT(*) FROM public.users);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to anonymous users (anon role)
GRANT EXECUTE ON FUNCTION public.get_total_user_count() TO anon;
GRANT EXECUTE ON FUNCTION public.get_total_user_count() TO authenticated;
